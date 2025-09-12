import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, validatePassword } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    // 验证输入
    if (!token || !password) {
      return NextResponse.json(
        { error: "请提供重置token和新密码" },
        { status: 400 }
      );
    }

    // 验证密码强度
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: "密码不符合要求", details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // 查找并验证token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "无效的重置链接" },
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
        { error: "重置链接已过期，请重新申请" },
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

    // 加密新密码
    const hashedPassword = await hashPassword(password);

    // 更新用户密码
    await prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword },
    });

    // 删除已使用的token
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json(
      { message: "密码重置成功！" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "密码重置失败，请稍后重试" },
      { status: 500 }
    );
  }
}
