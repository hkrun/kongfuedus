"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("请输入邮箱地址");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("请输入有效的邮箱地址");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("密码重置链接已发送到您的邮箱，请检查并点击链接重置密码。");
        setEmail("");
      } else {
        setError(data.error || "发送重置邮件失败，请稍后重试");
      }
    } catch (error) {
      setError("发送重置邮件失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">忘记密码？</h2>
          <p className="text-gray-600">
            请输入您的邮箱地址，我们将发送密码重置链接给您
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="邮箱地址"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="请输入您的邮箱"
            error={error}
            required
          />

          {message && (
            <div className="text-center">
              <p className="text-sm text-green-600">{message}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            发送重置链接
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
