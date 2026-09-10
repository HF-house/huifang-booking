/**
 * POST/GET /api/appointment/outbox —— 手動或定時把派工單收一收
 *
 * 平常不需要打這支：預約成立後 create 路由會用 after() 立刻收一次，
 * 通知是即時的。這支是「補收」用的安全網 ——
 * 上一次通知失敗進了 retry、或當下 serverless 被中斷時，靠它把漏掉的補寄出去。
 *
 * 授權：Authorization: Bearer <CRON_SECRET 或 APPOINTMENT_TOKEN_SECRET>。
 * 沒帶對就 401，避免被人亂打灌爆寄信額度。
 */
import { NextRequest, NextResponse } from "next/server";
import { runAppointmentOutbox } from "@/lib/appointment-outbox-worker";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: NextRequest): boolean {
  const expected = (process.env.CRON_SECRET || process.env.APPOINTMENT_TOKEN_SECRET || "").trim();
  if (!expected) return false;
  const header = (req.headers.get("authorization") || "").trim();
  return header === `Bearer ${expected}`;
}

async function run(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const limit = Number(req.nextUrl.searchParams.get("limit") || 20);
    const result = await runAppointmentOutbox(Number.isFinite(limit) ? limit : 20);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[appointment/outbox] 收派工單失敗:", error);
    return NextResponse.json({ ok: false, error: "outbox_run_failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return run(req);
}

export async function POST(req: NextRequest) {
  return run(req);
}
