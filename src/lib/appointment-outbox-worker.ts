/**
 * 📮 派工單處理器 —— 把 appointment_outbox 裡到期的任務真正做掉
 *
 * 為什麼需要這個檔（2026-09-10 補上）：
 * 原本專案只有「把通知丟進 appointment_outbox」的那一半（enqueueAppointmentOutbox），
 * 撈出來執行的那一半（listDue / claim / finish）雖然寫好了，卻沒有任何地方呼叫。
 * 結果就是：預約建得起來，但通知永遠躺在佇列裡，一封都不會寄出去。
 *
 * 這支負責把佇列收乾淨。目前接了通知類任務；其他還沒設定的功能
 * （AI 判讀、Google 日曆、GA4/Meta 追蹤）會標成 blocked_config 結案，
 * 以免它們無限重試把佇列塞爆。等哪天真的接上了，再回來補對應分支。
 */
import {
  LEGACY_DEFAULT_DURATION_MIN,
  claimAppointmentOutbox,
  finishAppointmentOutbox,
  getAppointment,
  listDueAppointmentOutbox,
  settleAppointmentOutbox,
  type AppointmentOutboxRow,
  type MeetLocation,
} from "@/lib/appointment";
import {
  notifyAppointmentChange,
  notifyNewAppointment,
  type AppointmentNotificationDispatchResult,
  type NotifyInput,
} from "@/lib/appointment-notify";

type Appointment = NonNullable<Awaited<ReturnType<typeof getAppointment>>>;

function parseIntent(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function parseMeetLocation(raw: string | null): MeetLocation | null {
  if (!raw) return null;
  try {
    const location = JSON.parse(raw) as Partial<MeetLocation>;
    if (!location.name) return null;
    return {
      name: String(location.name).slice(0, 120),
      address: location.address ? String(location.address).slice(0, 240) : undefined,
      placeId: location.placeId ? String(location.placeId).slice(0, 160) : undefined,
      lat: typeof location.lat === "number" ? location.lat : undefined,
      lng: typeof location.lng === "number" ? location.lng : undefined,
    } as MeetLocation;
  } catch {
    return null;
  }
}

function slotEnd(appt: Appointment): Date {
  const start = new Date(appt.slot_at);
  return appt.slot_end_at
    ? new Date(appt.slot_end_at)
    : new Date(start.getTime() + LEGACY_DEFAULT_DURATION_MIN * 60_000);
}

function toNotifyInput(appt: Appointment): NotifyInput {
  return {
    id: appt.id,
    name: appt.name,
    gender: appt.gender,
    phone: appt.phone,
    email: appt.email,
    lineId: appt.line_id,
    meetType: appt.meet_type,
    meetLocation: parseMeetLocation(appt.meet_location),
    intent: parseIntent(appt.intent),
    urgency: appt.urgency,
    note: appt.note,
    slotAt: new Date(appt.slot_at),
    slotEndAt: slotEnd(appt),
    aiHeat: appt.ai_heat,
    aiSuggestion: appt.ai_suggestion,
    meetUrl: appt.meet_url,
    status: appt.status,
  };
}

function readPayload(row: AppointmentOutboxRow): Record<string, unknown> {
  if (!row.payload_json) return {};
  try {
    const parsed = JSON.parse(row.payload_json);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function lineConfigured(): boolean {
  return Boolean(
    (process.env.LINE_CHANNEL_ACCESS_TOKEN || "").trim() &&
      (process.env.LINE_ADMIN_GROUP_ID || "").trim(),
  );
}

/**
 * 只有「本來就該通的管道」失敗才算失敗。
 *
 * notifyNewAppointment 只要有任一管道沒送成就回 ok:false。
 * 但 LINE 還沒接的情況下它必然失敗，若照單全收會讓每張派工單都卡在 retry
 * 重試八次才罷休 —— email 明明已經寄成功了。
 */
function assertDispatched(result: AppointmentNotificationDispatchResult, label: string): void {
  if (result.ok) return;
  const failed: string[] = [];
  if (result.customerEmail === "failed") failed.push("客戶 Email");
  if (result.adminEmail === "failed") failed.push("管理員 Email");
  if (result.adminLine === "failed" && lineConfigured()) failed.push("LINE");
  if (!failed.length) return;
  throw new Error(`${label}未送達：${failed.join("、")}`);
}

/** 還沒接的功能：直接結案，不要讓它一直重試。回傳結案理由，null 代表這個任務要真的執行。 */
function unconfiguredReason(taskType: string): string | null {
  switch (taskType) {
    case "ai_grade":
      return "未接 AI 判讀，略過";
    case "calendar_create":
    case "calendar_reschedule":
    case "calendar_cancel":
      return "Google 日曆未綁定，略過";
    case "analytics_ga4":
      return process.env.NEXT_PUBLIC_GA_ID ? null : "未設定 GA4，略過";
    case "analytics_meta":
      return process.env.META_CAPI_ACCESS_TOKEN ? null : "未設定 Meta CAPI，略過";
    default:
      return null;
  }
}

async function handle(row: AppointmentOutboxRow): Promise<void> {
  const appt = await getAppointment(row.appointment_id);
  if (!appt) {
    // 預約本身不見了（例如手動刪掉），這張派工單沒有意義了。
    await settleAppointmentOutbox({
      id: row.id,
      status: "failed_permanent",
      reason: "找不到對應的預約",
    });
    return;
  }

  const input = toNotifyInput(appt);
  const payload = readPayload(row);

  switch (row.task_type) {
    case "notify_new": {
      const phase = payload.phase === "confirmation_request" ? "confirmation_request" : "confirmed";
      const result = await notifyNewAppointment(input, { phase, onlyPending: true });
      assertDispatched(result, "新預約通知");
      return;
    }
    case "notify_reschedule": {
      const result = await notifyAppointmentChange(
        input,
        {
          type: "reschedule",
          previousSlotTw: typeof payload.previousSlotTw === "string" ? payload.previousSlotTw : null,
        },
        { notifyAdmin: true, onlyPending: true },
      );
      assertDispatched(result, "改期通知");
      return;
    }
    case "notify_cancel": {
      const result = await notifyAppointmentChange(
        input,
        {
          type: "cancel",
          previousSlotTw: typeof payload.previousSlotTw === "string" ? payload.previousSlotTw : null,
        },
        { notifyAdmin: true, onlyPending: true },
      );
      assertDispatched(result, "取消通知");
      return;
    }
    default:
      // 走到這裡代表有新的 task_type 但這支還沒接。標成 blocked 讓人看得到，而不是無聲重試。
      await settleAppointmentOutbox({
        id: row.id,
        status: "blocked_config",
        reason: `派工單處理器尚未支援的任務類型：${row.task_type}`,
      });
  }
}

export type OutboxRunResult = {
  picked: number;
  done: number;
  skipped: number;
  failed: number;
  errors: string[];
};

/**
 * 收一輪派工單。
 * 有人（HTTP 路由或建立預約後的 after()）呼叫才會動，本身不含排程。
 */
export async function runAppointmentOutbox(limit = 20): Promise<OutboxRunResult> {
  const result: OutboxRunResult = { picked: 0, done: 0, skipped: 0, failed: 0, errors: [] };
  const rows = await listDueAppointmentOutbox(limit);
  result.picked = rows.length;

  for (const row of rows) {
    const skipReason = unconfiguredReason(row.task_type);
    if (skipReason) {
      await settleAppointmentOutbox({ id: row.id, status: "blocked_config", reason: skipReason });
      result.skipped += 1;
      continue;
    }

    // claim 失敗＝別人已經搶走或還在鎖定中，跳過就好。
    if (!(await claimAppointmentOutbox(row.id))) continue;

    try {
      await handle(row);
      await finishAppointmentOutbox(row.id);
      result.done += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await finishAppointmentOutbox(row.id, message);
      result.failed += 1;
      result.errors.push(`${row.task_type}: ${message}`.slice(0, 300));
      console.error(`[outbox] ${row.task_type} 失敗 (${row.id}):`, error);
    }
  }

  return result;
}
