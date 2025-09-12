import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateToken, validateEmail } from "@/lib/utils";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // 验证输入
    if (!email) {
      return NextResponse.json(
        { error: "请输入邮箱地址" },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "请输入有效的邮箱地址" },
        { status: 400 }
      );
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // 为了安全，即使用户不存在也返回成功
      return NextResponse.json(
        { message: "如果该邮箱已注册，重置链接将发送到您的邮箱" },
        { status: 200 }
      );
    }

    // 生成重置token
    const resetToken = generateToken();

    // 删除旧的验证token（如果存在）
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // 创建新的重置token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: resetToken,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1小时后过期
      },
    });

    // 发送重置邮件
    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json(
      { message: "密码重置链接已发送到您的邮箱" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "发送重置邮件失败，请稍后重试" },
      { status: 500 }
    );
  }
}
