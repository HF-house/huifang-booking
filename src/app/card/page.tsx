/**
 * /card — 慧芳房仲日常電子名片門面頁(房仲日常 CIS,專業版)
 * 2026-06-19 改版:真照片 + 官方品牌 icon + 去 emoji + 精緻排版(系統擁有者:要更專業)。
 * robots noindex(個人名片頁、隱私)。
 */
import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { RCIS } from "./_cis";
import { SOCIAL, ABIN } from "./_links";
import { FacebookIcon, YoutubeIcon, LineIcon, InstagramIcon, PhoneIcon, MailIcon, PinIcon, CalendarIcon } from "./_icons";

const OG_IMAGE = `https://example.com${ABIN.photoUrl}`;

export const metadata: Metadata = {
  title: `${ABIN.name}（${ABIN.alias}）‧ ${ABIN.title} | 預約諮詢`,
  description: `${ABIN.slogan} 線上預約慧芳:買房 / 賣房 / 租賃 / 法律諮詢,一對一為你服務。`,
  robots: { index: false, follow: false },
  // OG 鐵律:名片要講師高光(慧芳照片),不可 fallback OO 學院訂閱促銷圖
  openGraph: {
    title: `${ABIN.name}（${ABIN.alias}）‧ ${ABIN.title}`,
    description: `${ABIN.slogan} 線上預約慧芳、加 LINE 諮詢買賣租賃。`,
    url: "https://card.example.com",
    siteName: "中信房屋 ‧ 鄭慧芳",
    type: "profile",
    locale: "zh_TW",
    images: [{ url: OG_IMAGE, width: 460, height: 460, alt: ABIN.name }],
  },
  twitter: {
    card: "summary",
    title: `${ABIN.name}（${ABIN.alias}）‧ ${ABIN.title}`,
    description: `${ABIN.slogan}`,
    images: [OG_IMAGE],
  },
};

function PhotoCircle() {
  const size = 150;
  const shared: CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    border: "5px solid #fff",
    boxShadow: "0 8px 26px rgba(28,45,58,0.18)",
  };
  if (ABIN.photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={ABIN.photoUrl} alt={ABIN.name} width={size} height={size} style={{ ...shared, objectFit: "cover", objectPosition: "center" }} />
    );
  }
  return (
    <div style={{ ...shared, background: `linear-gradient(135deg,${RCIS.sky},${RCIS.skyDeep})`, color: "#fff", fontSize: 46, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      濱
    </div>
  );
}

function ContactRow({ icon, label, href }: { icon: React.ReactNode; label: string; href?: string }) {
  const inner = (
    <span style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 15, color: RCIS.inkSoft }}>
      <span style={{ color: RCIS.sky, display: "inline-flex" }}>{icon}</span>
      {label}
    </span>
  );
  return href ? (
    <a href={href} style={{ textDecoration: "none" }}>
      {inner}
    </a>
  ) : (
    inner
  );
}

function SocialBtn({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      style={{
        width: 50,
        height: 50,
        borderRadius: 14,
        background: RCIS.bgSoft,
        border: `1px solid ${RCIS.border}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </a>
  );
}

export default function CardPage() {
  return (
    <main style={{ minHeight: "100vh", background: `linear-gradient(180deg,${RCIS.skySoft},${RCIS.bgSoft})`, fontFamily: RCIS.font, color: RCIS.ink, padding: "32px 16px" }}>
      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        <div style={{ background: RCIS.bg, borderRadius: 22, boxShadow: RCIS.shadowLg, overflow: "hidden" }}>
          {/* cover */}
          <div style={{ height: 92, background: `linear-gradient(120deg,${RCIS.sky},${RCIS.skyDeep})`, position: "relative" }}>
            <div style={{ position: "absolute", top: 14, right: 18, fontSize: 12.5, color: RCIS.ink, letterSpacing: 2, fontWeight: 800 }}>
              中信房屋 ‧ 鄭慧芳
            </div>
          </div>

          {/* 照片 */}
          <div style={{ marginTop: -78, textAlign: "center", position: "relative", zIndex: 2 }}>
            <PhotoCircle />
          </div>

          {/* 名字 */}
          <div style={{ textAlign: "center", padding: "14px 26px 6px" }}>
            <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: 0.5 }}>
              {ABIN.name}
              <span style={{ color: RCIS.muted, fontSize: 17, fontWeight: 500, marginLeft: 10 }}>{ABIN.alias}</span>
            </div>
            <div style={{ fontSize: 15, color: RCIS.inkSoft, marginTop: 6, fontWeight: 500 }}>{ABIN.title}</div>
            <div style={{ fontSize: 14, color: RCIS.muted, marginTop: 12, lineHeight: 1.7 }}>{ABIN.slogan}</div>
          </div>

          {/* CTA */}
          <div style={{ padding: "18px 26px 6px", display: "grid", gap: 11 }}>
            <Link href="/card/booking" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, background: RCIS.orange, color: RCIS.ink, fontSize: 17, fontWeight: 800, padding: "15px", borderRadius: 13, textDecoration: "none", boxShadow: "0 8px 20px rgba(245,169,29,0.3)" }}>
              <CalendarIcon size={20} color={RCIS.ink} />
              線上預約諮詢
            </Link>
            <a href={SOCIAL.line} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, background: "#06C755", color: RCIS.ink, fontSize: 16, fontWeight: 800, padding: "14px", borderRadius: 13, textDecoration: "none" }}>
              <LineIcon size={22} />
              加慧芳 LINE
            </a>
          </div>

          {/* 聯絡 */}
          <div style={{ padding: "18px 26px", display: "grid", gap: 13, borderTop: `1px solid ${RCIS.line}`, marginTop: 14 }}>
            <ContactRow icon={<PhoneIcon size={18} />} label={ABIN.phone} href={`tel:${ABIN.phoneRaw}`} />
            <ContactRow icon={<MailIcon size={18} />} label={ABIN.email} href={`mailto:${ABIN.email}`} />
            <ContactRow icon={<PinIcon size={18} />} label={ABIN.address} />
          </div>

          {/* 社群 */}
          <div style={{ padding: "6px 26px 30px", borderTop: `1px solid ${RCIS.line}` }}>
            <div style={{ fontSize: 12.5, color: RCIS.muted, margin: "16px 0 13px", textAlign: "center", letterSpacing: 1 }}>追蹤慧芳</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
              <SocialBtn href={SOCIAL.fb} label="Facebook">
                <FacebookIcon size={26} />
              </SocialBtn>
              <SocialBtn href={SOCIAL.yt} label="YouTube">
                <YoutubeIcon size={26} />
              </SocialBtn>
              <SocialBtn href={SOCIAL.ig} label="Instagram">
                <InstagramIcon size={26} />
              </SocialBtn>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", fontSize: 12, color: RCIS.muted, marginTop: 18 }}>© {ABIN.name} ‧ 中信房屋</div>
      </div>
    </main>
  );
}
