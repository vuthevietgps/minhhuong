import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

export interface OrderEmailContext {
  to: string;
  packageName?: string | null;
  amountCents: number;
  currency: string;
  expiresAt?: Date | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  transferContent?: string | null;
  reviewNotes?: string | null;
  revokeReason?: string | null;
}

function formatVnd(amountCents: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(date);
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: Transporter | null = null;
  private readonly from: string;
  private readonly enabled: boolean;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') ?? '587');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    this.from =
      this.config.get<string>('SMTP_FROM') ??
      'Minh Huong English <no-reply@minhhuongenglish.com>';
    this.enabled = Boolean(host && user && pass);

    if (this.enabled) {
      this.transporter = createTransport({ host, port, auth: { user, pass } });
      this.logger.log(`Email enabled via ${host}:${port}`);
    } else {
      this.logger.warn('SMTP not configured — emails will be logged only');
    }
  }

  async sendOrderCreated(ctx: OrderEmailContext): Promise<void> {
    const subject = `[Minh Huong English] Yêu cầu thanh toán đã được tạo`;
    const html = `
<p>Xin chào,</p>
<p>Yêu cầu thanh toán của bạn đã được tạo thành công.</p>
<table style="border-collapse:collapse;margin-top:12px">
  <tr><td style="padding:4px 12px 4px 0;color:#555">Gói học:</td><td><strong>${ctx.packageName ?? 'N/A'}</strong></td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">Số tiền:</td><td><strong>${formatVnd(ctx.amountCents)}</strong></td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">Ngân hàng:</td><td><strong>${ctx.bankName ?? 'N/A'}</strong></td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">Số tài khoản:</td><td><strong>${ctx.bankAccountNumber ?? 'N/A'}</strong></td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">Tên tài khoản:</td><td><strong>${ctx.bankAccountName ?? 'N/A'}</strong></td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">Nội dung CK:</td><td><strong style="color:#0f766e">${ctx.transferContent ?? 'N/A'}</strong></td></tr>
</table>
<p style="margin-top:16px">Vui lòng chuyển khoản đúng số tiền và <strong>nội dung chuyển khoản</strong>, sau đó upload ảnh biên lai để đội vận hành xác nhận.</p>
<p style="color:#888;font-size:12px;margin-top:24px">Minh Huong English — noreply</p>`;
    await this.send(ctx.to, subject, html);
  }

  async sendAgencyApplicationApproved(to: string, code: string): Promise<void> {
    await this.send(
      to,
      '[Minh Huong English] Đăng ký đại lý đã được duyệt',
      `<p>Hồ sơ đại lý của bạn đã được duyệt.</p><p>Mã đại lý: <strong>${code}</strong></p><p>Bạn có thể đăng nhập bằng email và mật khẩu đã đăng ký để tạo link affiliate và bán hàng.</p>`,
    );
  }

  async sendAgencyApplicationRejected(to: string): Promise<void> {
    await this.send(
      to,
      '[Minh Huong English] Kết quả đăng ký đại lý',
      '<p>Hồ sơ đại lý của bạn chưa được duyệt. Vui lòng liên hệ bộ phận hỗ trợ nếu cần thêm thông tin.</p>',
    );
  }

  async sendOrderApproved(ctx: OrderEmailContext): Promise<void> {
    const subject = `[Minh Huong English] Tài khoản đã được kích hoạt 🎉`;
    const html = `
<p>Xin chào,</p>
<p>Thanh toán của bạn đã được xác nhận. Tài khoản học tập đã được kích hoạt.</p>
<table style="border-collapse:collapse;margin-top:12px">
  <tr><td style="padding:4px 12px 4px 0;color:#555">Gói học:</td><td><strong>${ctx.packageName ?? 'N/A'}</strong></td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">Hết hạn:</td><td><strong style="color:#0f766e">${formatDate(ctx.expiresAt)}</strong></td></tr>
</table>
<p style="margin-top:16px">Đăng nhập vào ứng dụng để bắt đầu học ngay!</p>
<p style="color:#888;font-size:12px;margin-top:24px">Minh Huong English — noreply</p>`;
    await this.send(ctx.to, subject, html);
  }

  async sendOrderRejected(ctx: OrderEmailContext): Promise<void> {
    const subject = `[Minh Huong English] Yêu cầu thanh toán bị từ chối`;
    const html = `
<p>Xin chào,</p>
<p>Rất tiếc, yêu cầu thanh toán của bạn chưa được duyệt.</p>
${ctx.reviewNotes ? `<p><strong>Lý do:</strong> ${ctx.reviewNotes}</p>` : ''}
<p>Vui lòng kiểm tra lại thông tin chuyển khoản và upload lại biên lai trong ứng dụng.</p>
<p style="color:#888;font-size:12px;margin-top:24px">Minh Huong English — noreply</p>`;
    await this.send(ctx.to, subject, html);
  }

  async sendOrderRevoked(ctx: OrderEmailContext): Promise<void> {
    const subject = `[Minh Huong English] Tài khoản học tập đã bị thu hồi`;
    const html = `
<p>Xin chào,</p>
<p>Tài khoản học tập của bạn đã bị thu hồi.</p>
${ctx.revokeReason ? `<p><strong>Lý do:</strong> ${ctx.revokeReason}</p>` : ''}
<p>Vui lòng liên hệ hỗ trợ nếu bạn có thắc mắc.</p>
<p style="color:#888;font-size:12px;margin-top:24px">Minh Huong English — noreply</p>`;
    await this.send(ctx.to, subject, html);
  }

  async sendExpiryReminder(
    to: string,
    expiresAt: Date,
    daysLeft: number,
  ): Promise<void> {
    const subject = `[Minh Huong English] Tài khoản sắp hết hạn trong ${daysLeft} ngày`;
    const html = `
<p>Xin chào,</p>
<p>Tài khoản học tập của bạn sẽ hết hạn vào <strong>${formatDate(expiresAt)}</strong> (còn <strong>${daysLeft} ngày</strong>).</p>
<p>Vui lòng gia hạn để không bị gián đoạn việc học.</p>
<p style="color:#888;font-size:12px;margin-top:24px">Minh Huong English — noreply</p>`;
    await this.send(to, subject, html);
  }

  async sendWeeklyLearningDigest(
    to: string,
    childName: string,
    stats: {
      completedLessons: number;
      totalStudyMinutes: number;
      streak: number;
    },
  ): Promise<void> {
    const subject = `[Minh Huong English] Tóm tắt học tập tuần này của ${childName}`;
    const streakLine =
      stats.streak > 0
        ? `<tr><td style="padding:4px 12px 4px 0;color:#555">Chuỗi ngày học:</td><td><strong>${stats.streak} ngày liên tiếp 🔥</strong></td></tr>`
        : '';
    const html = `
<p>Xin chào,</p>
<p>Tóm tắt hoạt động học tập của <strong>${childName}</strong> trong 7 ngày qua:</p>
<table style="border-collapse:collapse;margin-top:12px">
  <tr><td style="padding:4px 12px 4px 0;color:#555">Bài hoàn thành:</td><td><strong>${stats.completedLessons} bài</strong></td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">Thời gian học:</td><td><strong>${stats.totalStudyMinutes} phút</strong></td></tr>
  ${streakLine}
</table>
<p style="margin-top:16px">Tiếp tục duy trì thói quen học mỗi ngày để đạt kết quả tốt nhất!</p>
<p style="color:#888;font-size:12px;margin-top:24px">Minh Huong English — noreply</p>`;
    await this.send(to, subject, html);
  }

  async sendForgotPassword(
    to: string,
    resetToken: string,
    appUrl: string,
  ): Promise<void> {
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
    const subject = `[Minh Huong English] Đặt lại mật khẩu`;
    const html = `
<p>Xin chào,</p>
<p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản này.</p>
<p><a href="${resetUrl}" style="background:#0f766e;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px">Đặt lại mật khẩu</a></p>
<p style="margin-top:12px;color:#555">Link có hiệu lực trong 1 giờ. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
<p style="color:#888;font-size:12px;margin-top:24px">Minh Huong English — noreply</p>`;
    await this.send(to, subject, html);
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`[EMAIL-LOG] To: ${to} | Subject: ${subject}`);
      return;
    }
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${String(error)}`);
    }
  }
}
