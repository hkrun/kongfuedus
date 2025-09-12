import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.APP_URL}/auth/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: "验证您的邮箱地址",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a365d;">欢迎加入 ${process.env.APP_NAME}!</h2>
          <p>请点击下面的按钮验证您的邮箱地址：</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; background-color: #ed8936; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
             验证邮箱
           </a>
          <p>或者复制以下链接到浏览器：</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>此链接将在24小时后过期。</p>
          <p>如果您没有注册账户，请忽略此邮件。</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: "重置您的密码",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a365d;">密码重置请求</h2>
          <p>您请求重置密码。请点击下面的按钮重置您的密码：</p>
          <a href="${resetUrl}" 
             style="display: inline-block; background-color: #ed8936; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
             重置密码
           </a>
          <p>或者复制以下链接到浏览器：</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>此链接将在1小时后过期。</p>
          <p>如果您没有请求重置密码，请忽略此邮件。</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return { success: false, error };
  }
}
