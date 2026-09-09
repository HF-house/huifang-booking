/**
 * 👤 這個系統是誰的 —— 從這裡改，只改這一個檔
 *
 * 名片頁、預約表單、通知信、日曆邀請 全都讀這裡。
 * 把下面換成你自己的資料，整套系統就是你的了。
 *
 * ⚠️ 這個檔會進 Git。手機與 Email 填進去等於公開在網路上
 *    （名片本來就是要給人看的，但你如果不想被爬蟲收割，
 *      可以改成讀環境變數：process.env.OWNER_PHONE 之類）。
 */

export const OWNER = {
  /** 你的名字（正式全名，出現在通知信署名與日曆邀請） */
  name: "鄭慧芳",
  /** 慣用稱呼（客戶怎麼叫你，出現在文案裡：「慧芳會與您聯繫」） */
  alias: "慧芳",
  /** 頭銜 */
  title: "中信房屋 忠孝延吉加盟店 · 樂誠團隊",
  /** 手機（顯示用，含分隔線） */
  phone: "0910-376-660",
  /** 手機（純數字，撥號連結與 LINE 加好友用） */
  phoneRaw: "0910376660",
  /** 聯絡信箱（客戶回信會到這裡） */
  email: "la121442@gmail.com",
  /** 公司地址（「公司面談」這個選項會顯示它） */
  address: "台北市松山區延吉街 46-1 號 1 樓",
  /** 公司／品牌名 */
  company: "中信房屋",
  /** 大頭照放 public/card/ 底下 */
  photoUrl: "/card/huifang.jpg",
  /** 一句話介紹自己 */
  slogan: "13 年在地深耕．大安、松山、雙敦學區．房子的事，找慧芳。",
} as const;

/** 社群連結 —— 用不到的留空字串，畫面會自動不顯示 */
export const SOCIAL = {
  line: `https://line.me/R/ti/p/~${OWNER.phoneRaw}`,
  fb: "https://www.facebook.com/akai0988?locale=zh_TW",
  yt: "",
  ig: "",
} as const;

/** LINE 加好友 QR 圖（放 public/card/ 底下）。null = 不顯示 QR 區 */
export const LINE_QR: string | null = null;

/** 網站網址（通知信裡的連結、Open Graph 用） */
export const SITE_URL = process.env.APPOINTMENT_BASE_URL || "http://localhost:3000";
