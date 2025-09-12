import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "请提供验证token" },
        { status: 400 }
      );
    }

    // 查找并验证token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "无效的验证链接" },
        { status: 400 }
      );
    }

    // 检查token是否过期
    if (verificationToken.expires < new Date()) {
      // 删除过期token
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.json(
        { error: "验证链接已过期，请重新注册" },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 400 }
      );
    }

    // 更新用户邮箱验证状态
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    // 删除已使用的token
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json(
      { message: "邮箱验证成功！您现在可以登录了。" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "邮箱验证失败，请稍后重试" },
      { status: 500 }
    );
  }
}
