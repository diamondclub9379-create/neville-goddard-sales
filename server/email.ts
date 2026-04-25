import { Resend } from "resend";
import { ENV } from "./_core/env";
import { SKOOL_COMMUNITY_URL } from "@shared/const";

const OWNER_EMAIL = "owner@nevillebooks.com";
const FROM_EMAIL = "ไดมอนด์คลับ <onboarding@resend.dev>"; // Resend default sender for testing

export interface OrderItem {
  titleTh: string;
  titleEn: string;
  quantity: number;
  price: number;
  discountedPrice?: number;
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  items: OrderItem[];
  total: number;
  createdAt: Date;
  slipUrl?: string; // Optional: uploaded payment slip URL
}

function formatPaymentMethod(method: string): string {
  const map: Record<string, string> = {
    "bank-transfer": "โอนเงินผ่านธนาคารกรุงไทย (KTB)",
    "promptpay": "พร้อมเพย์ (PromptPay)",
    "cod": "เก็บเงินปลายทาง",
  };
  return map[method] ?? method;
}

function buildOrderItemsHtml(items: OrderItem[]): string {
  return items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #1e293b; color: #e2e8f0;">
        <div style="font-weight: 600; color: #f8fafc;">${item.titleTh}</div>
        <div style="font-size: 12px; color: #94a3b8; font-style: italic;">${item.titleEn}</div>
        ${item.discountedPrice ? `<div style="font-size: 11px; color: #4ade80; margin-top: 2px;">🎁 ราคา Bundle พิเศษ</div>` : ""}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #1e293b; text-align: center; color: #94a3b8;">${item.quantity}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #1e293b; text-align: right;">
        ${item.discountedPrice
          ? `<span style="color: #94a3b8; text-decoration: line-through; font-size: 12px;">฿${item.price}</span><br><span style="color: #fbbf24; font-weight: 700;">฿${item.discountedPrice}</span>`
          : `<span style="color: #fbbf24; font-weight: 700;">฿${item.price}</span>`
        }
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #1e293b; text-align: right; color: #fbbf24; font-weight: 700;">
        ฿${(item.discountedPrice ?? item.price) * item.quantity}
      </td>
    </tr>`
    )
    .join("");
}

function buildCustomerEmailHtml(data: OrderEmailData): string {
  return `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ยืนยันการสั่งซื้อ - ไดมอนด์คลับ</title>
</head>
<body style="margin: 0; padding: 0; background-color: #020617; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <div style="display: inline-block; background: linear-gradient(135deg, #fbbf24, #f59e0b); padding: 2px; border-radius: 12px;">
        <div style="background: #0a0f1e; border-radius: 10px; padding: 16px 32px;">
          <h1 style="margin: 0; color: #fbbf24; font-size: 24px; letter-spacing: 2px;">ไดมอนด์คลับ</h1>
          <p style="margin: 4px 0 0; color: #94a3b8; font-size: 12px; letter-spacing: 1px;">บริษัท ไดมอนด์คลับ จำกัด | หนังสือ Neville Goddard ฉบับแปลไทย</p>
        </div>
      </div>
    </div>

    <!-- Confirmation Banner -->
    <div style="background: linear-gradient(135deg, rgba(251,191,36,0.1), rgba(10,15,30,0.9)); border: 1px solid rgba(251,191,36,0.3); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 32px;">
      <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
      <h2 style="margin: 0 0 8px; color: #fbbf24; font-size: 22px;">ยืนยันการสั่งซื้อเรียบร้อยแล้ว!</h2>
      <p style="margin: 0; color: #94a3b8; font-size: 14px;">ขอบคุณที่สั่งซื้อหนังสือกับเรา คุณ${data.customerName}</p>
      <div style="margin-top: 16px; display: inline-block; background: rgba(251,191,36,0.15); border: 1px solid rgba(251,191,36,0.4); border-radius: 8px; padding: 8px 20px;">
        <span style="color: #94a3b8; font-size: 12px;">เลขออเดอร์: </span>
        <span style="color: #fbbf24; font-weight: 700; font-size: 16px; letter-spacing: 1px;">${data.orderNumber}</span>
      </div>
    </div>

    <!-- Order Details -->
    <div style="background: #0d1117; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; margin-bottom: 24px;">
      <div style="background: rgba(251,191,36,0.08); padding: 16px 20px; border-bottom: 1px solid #1e293b;">
        <h3 style="margin: 0; color: #fbbf24; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">📦 รายการสินค้า</h3>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: rgba(255,255,255,0.02);">
            <th style="padding: 10px 16px; text-align: left; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">สินค้า</th>
            <th style="padding: 10px 16px; text-align: center; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">จำนวน</th>
            <th style="padding: 10px 16px; text-align: right; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">ราคา/ชิ้น</th>
            <th style="padding: 10px 16px; text-align: right; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">รวม</th>
          </tr>
        </thead>
        <tbody>
          ${buildOrderItemsHtml(data.items)}
        </tbody>
        <tfoot>
          <tr style="background: rgba(251,191,36,0.05);">
            <td colspan="3" style="padding: 16px 20px; text-align: right; color: #e2e8f0; font-size: 16px; font-weight: 600;">ยอดรวมทั้งสิ้น</td>
            <td style="padding: 16px 20px; text-align: right; color: #fbbf24; font-size: 22px; font-weight: 700;">฿${data.total.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Customer & Payment Info -->
    <div style="display: grid; gap: 16px; margin-bottom: 24px;">
      <div style="background: #0d1117; border: 1px solid #1e293b; border-radius: 12px; padding: 20px;">
        <h3 style="margin: 0 0 12px; color: #fbbf24; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">👤 ข้อมูลผู้สั่งซื้อ</h3>
        <p style="margin: 4px 0; color: #e2e8f0;"><span style="color: #64748b; font-size: 12px;">ชื่อ: </span>${data.customerName}</p>
        <p style="margin: 4px 0; color: #e2e8f0;"><span style="color: #64748b; font-size: 12px;">อีเมล: </span>${data.customerEmail}</p>
        <p style="margin: 4px 0; color: #e2e8f0;"><span style="color: #64748b; font-size: 12px;">โทร: </span>${data.customerPhone}</p>
        <p style="margin: 4px 0; color: #e2e8f0;"><span style="color: #64748b; font-size: 12px;">ที่อยู่: </span>${data.customerAddress}</p>
      </div>
      <div style="background: #0d1117; border: 1px solid #1e293b; border-radius: 12px; padding: 20px;">
        <h3 style="margin: 0 0 12px; color: #fbbf24; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">💳 วิธีชำระเงิน</h3>
        <p style="margin: 0; color: #e2e8f0; font-size: 16px;">${formatPaymentMethod(data.paymentMethod)}</p>
        ${data.paymentMethod === "bank-transfer"
          ? `<p style="margin: 8px 0 0; color: #94a3b8; font-size: 13px;">กรุณาส่งหลักฐานการโอนเงิน (สลิป) มาทาง LINE: @coachwanchai</p>`
          : ""
        }
      </div>
    </div>

    <!-- Next Steps -->
    <div style="background: linear-gradient(135deg, rgba(251,191,36,0.06), rgba(10,15,30,0.8)); border: 1px solid rgba(251,191,36,0.2); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 12px; color: #fbbf24; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">📋 ขั้นตอนถัดไป</h3>
      <ol style="margin: 0; padding-left: 20px; color: #94a3b8; font-size: 14px; line-height: 2;">
        <li>ทีมงานจะตรวจสอบออเดอร์ภายใน 24 ชั่วโมง</li>
        <li>เมื่อยืนยันการชำระเงินแล้ว จะจัดส่งหนังสือทันที</li>
        <li>คุณจะได้รับอีเมลแจ้งเลขพัสดุเมื่อจัดส่งแล้ว</li>
      </ol>
    </div>

    <!-- Skool Community CTA -->
    <div style="background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(10,15,30,0.8)); border: 1px solid rgba(16,185,129,0.35); border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: center;">
      <div style="font-size: 36px; margin-bottom: 8px;">👥</div>
      <h3 style="margin: 0 0 8px; color: #6ee7b7; font-size: 18px; font-weight: 700;">เข้าร่วมชุมชน Neville Goddard Thailand</h3>
      <p style="margin: 0 0 16px; color: #94a3b8; font-size: 14px; line-height: 1.6;">ระหว่างรอหนังสือ มาเจอกับเพื่อนที่ฝึกการ Manifest เหมือนกัน<br/>เรียนรู้ แชร์ประสบการณ์ และรับเทคนิคพิเศษฟรี</p>
      <a href="${SKOOL_COMMUNITY_URL}?utm_source=email&utm_medium=order_confirmation&utm_campaign=community" style="display: inline-block; background: linear-gradient(135deg, #10b981, #14b8a6); color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px;">เข้าร่วมฟรี →</a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #475569; font-size: 12px; border-top: 1px solid #1e293b; padding-top: 24px;">
      <p style="margin: 0 0 4px; color: #64748b;">บริษัท ไดมอนด์คลับ จำกัด</p>
      <p style="margin: 0; color: #334155;">หนังสือ Neville Goddard ฉบับแปลไทย | เปลี่ยนจินตนาการให้เป็นความจริง</p>
    </div>
  </div>
</body>
</html>`;
}

function buildOwnerEmailHtml(data: OrderEmailData): string {
  return `
<!DOCTYPE html>
<html lang="th">
<head><meta charset="UTF-8"><title>ออเดอร์ใหม่ - ไดมอนด์คลับ</title></head>
<body style="margin: 0; padding: 0; background-color: #020617; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(10,15,30,0.9)); border: 2px solid rgba(251,191,36,0.4); border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
      <div style="font-size: 40px; margin-bottom: 8px;">🛍️</div>
      <h2 style="margin: 0; color: #fbbf24; font-size: 20px;">มีออเดอร์ใหม่เข้ามา!</h2>
      <p style="margin: 8px 0 0; color: #94a3b8;">เลขออเดอร์: <strong style="color: #fbbf24;">${data.orderNumber}</strong></p>
    </div>

    <div style="background: #0d1117; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h3 style="margin: 0 0 12px; color: #fbbf24; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">👤 ข้อมูลลูกค้า</h3>
      <p style="margin: 4px 0; color: #e2e8f0;"><strong>ชื่อ:</strong> ${data.customerName}</p>
      <p style="margin: 4px 0; color: #e2e8f0;"><strong>อีเมล:</strong> ${data.customerEmail}</p>
      <p style="margin: 4px 0; color: #e2e8f0;"><strong>โทร:</strong> ${data.customerPhone}</p>
      <p style="margin: 4px 0; color: #e2e8f0;"><strong>ที่อยู่:</strong> ${data.customerAddress}</p>
      <p style="margin: 4px 0; color: #e2e8f0;"><strong>ชำระเงินด้วย:</strong> ${formatPaymentMethod(data.paymentMethod)}</p>
    </div>

    <div style="background: #0d1117; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; margin-bottom: 16px;">
      <div style="background: rgba(251,191,36,0.08); padding: 12px 20px; border-bottom: 1px solid #1e293b;">
        <h3 style="margin: 0; color: #fbbf24; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">📦 รายการสินค้า</h3>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="padding: 8px 16px; text-align: left; color: #64748b; font-size: 12px;">สินค้า</th>
            <th style="padding: 8px 16px; text-align: center; color: #64748b; font-size: 12px;">จำนวน</th>
            <th style="padding: 8px 16px; text-align: right; color: #64748b; font-size: 12px;">ราคา</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
          <tr>
            <td style="padding: 10px 16px; border-top: 1px solid #1e293b; color: #e2e8f0;">${item.titleTh}${item.discountedPrice ? " 🎁" : ""}</td>
            <td style="padding: 10px 16px; border-top: 1px solid #1e293b; text-align: center; color: #94a3b8;">${item.quantity}</td>
            <td style="padding: 10px 16px; border-top: 1px solid #1e293b; text-align: right; color: #fbbf24; font-weight: 700;">฿${(item.discountedPrice ?? item.price) * item.quantity}</td>
          </tr>`).join("")}
        </tbody>
        <tfoot>
          <tr style="background: rgba(251,191,36,0.05);">
            <td colspan="2" style="padding: 14px 20px; text-align: right; color: #e2e8f0; font-weight: 600;">ยอดรวม</td>
            <td style="padding: 14px 20px; text-align: right; color: #fbbf24; font-size: 20px; font-weight: 700;">฿${data.total.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    ${data.slipUrl ? `
    <div style="background: linear-gradient(135deg, rgba(34,197,94,0.1), rgba(10,15,30,0.9)); border: 1px solid rgba(34,197,94,0.3); border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h3 style="margin: 0 0 12px; color: #4ade80; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">🧾 หลักฐานการโอนเงิน</h3>
      ${data.slipUrl.match(/\.(jpg|jpeg|png|webp)$/i)
        ? `<a href="${data.slipUrl}" target="_blank" style="display: block; margin-bottom: 8px;"><img src="${data.slipUrl}" alt="สลิปการโอนเงิน" style="max-width: 100%; max-height: 300px; object-fit: contain; border-radius: 8px; border: 1px solid rgba(34,197,94,0.3);" /></a>`
        : ""
      }
      <a href="${data.slipUrl}" target="_blank" style="color: #4ade80; font-size: 13px; word-break: break-all;">📎 ดูสลิปการโอนเงิน →</a>
    </div>` : ""}

    <div style="text-align: center; color: #475569; font-size: 12px; border-top: 1px solid #1e293b; padding-top: 16px;">
      <p style="margin: 0;">ไดมอนด์คลับ Admin Notification — ${new Date(data.createdAt).toLocaleString("th-TH")}</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  if (!ENV.resendApiKey) {
    console.warn("[Email] RESEND_API_KEY not set, skipping email send");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const resend = new Resend(ENV.resendApiKey);

  try {
    // Send customer confirmation email
    const customerResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: [data.customerEmail],
      subject: `✅ ยืนยันการสั่งซื้อ #${data.orderNumber} - ไดมอนด์คลับ`,
      html: buildCustomerEmailHtml(data),
    });

    if (customerResult.error) {
      console.error("[Email] Customer email error:", customerResult.error);
      return { success: false, error: customerResult.error.message };
    }

    // Send owner notification email
    const ownerResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: [OWNER_EMAIL],
      subject: `🛍️ ออเดอร์ใหม่ #${data.orderNumber} — ฿${data.total.toLocaleString()} จาก ${data.customerName}`,
      html: buildOwnerEmailHtml(data),
    });

    if (ownerResult.error) {
      // Owner email failure is non-critical — log but don't fail the whole operation
      console.error("[Email] Owner notification email error:", ownerResult.error);
    }

    console.log(`[Email] Order confirmation sent to ${data.customerEmail}, order ${data.orderNumber}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Email] Unexpected error:", message);
    return { success: false, error: message };
  }
}
