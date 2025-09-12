"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setMessage("无效的重置链接");
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!password) {
      newErrors.password = "请输入新密码";
    } else if (password.length < 8) {
      newErrors.password = "密码至少需要8个字符";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = "密码需要包含大小写字母和数字";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "请确认新密码";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "两次输入的密码不一致";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("无效的重置链接");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("密码重置成功！3秒后将跳转到登录页面。");
        // 清空表单
        setPassword("");
        setConfirmPassword("");
        // 3秒后跳转到登录页面
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } else {
        setMessage(data.error || "密码重置失败，请稍后重试");
      }
    } catch (error) {
      setMessage("密码重置失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">无效链接</h2>
          <p className="text-gray-600 mb-6">
            您访问的密码重置链接无效或已过期。
          </p>
          <Link
            href="/auth/forgot-password"
            className="inline-block px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            重新申请重置
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">重置密码</h2>
          <p className="text-gray-600">请输入您的新密码</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="新密码"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入新密码"
            error={errors.password}
            helperText="密码至少8位，包含大小写字母和数字"
            required
          />

          <Input
            label="确认新密码"
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="请再次输入新密码"
            error={errors.confirmPassword}
            required
          />

          {message && (
            <div className="text-center">
              <p className={`text-sm ${message.includes("成功") ? "text-green-600" : "text-red-600"}`}>
                {message}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            重置密码
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            记起密码了？{" "}
            <Link
              href="/auth/login"
              className="font-medium text-orange-600 hover:text-orange-500 transition-colors"
            >
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
