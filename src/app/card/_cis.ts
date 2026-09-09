/**
 * 房仲日常 CIS — 前台亮色版（/card 名片頁 / 預約表單 / 成功頁，給客戶看）
 * 2026-06-19：天藍 #4EC4DC + 橘 #F5A91D + 深 #1C2D3A，明亮親切。
 * ⚠️ 跟後台OO 學院深色 cis.ts 分開（那是給系統擁有者久盯的深色；這是給客戶的亮色名片）。
 */
export const RCIS = {
  sky: "#4EC4DC", // 天藍（主色）
  skyDeep: "#1F6F83",
  skySoft: "#E8F7FB", // 淺天藍底
  orange: "#F5A91D", // 橘（CTA / 強調）
  orangeDeep: "#E0950A",
  orangeSoft: "#FEF3DF",
  ink: "#1C2D3A", // 深字（主文字）
  inkSoft: "#3F5160", // 次深字
  muted: "#7A8896", // 弱字
  bg: "#FFFFFF",
  bgSoft: "#F7FAFB",
  border: "#E3EAEE",
  line: "#EDF2F4",
  green: "#2BB673", // 成功 / 確認
  font: "'Noto Sans TC','PingFang TC','Microsoft JhengHei',-apple-system,BlinkMacSystemFont,sans-serif",
  radius: 16,
  radiusSm: 10,
  shadow: "0 4px 20px rgba(28,45,58,0.08)",
  shadowLg: "0 12px 44px rgba(28,45,58,0.14)",
} as const;

// 業績溫度色（後台 + 通知共用判讀）
export const HEAT_TONE: Record<string, { label: string; emoji: string; color: string }> = {
  high: { label: "高溫", emoji: "🔥", color: "#E0950A" },
  mid: { label: "中溫", emoji: "🟡", color: "#4EC4DC" },
  low: { label: "低溫", emoji: "⚪", color: "#7A8896" },
};
