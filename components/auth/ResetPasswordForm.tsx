"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ResetPasswordForm() {
  const t = useTranslations();
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
      setMessage(t('auth.resetPassword.errors.invalidLink'));
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!password) {
      newErrors.password = t('auth.resetPassword.errors.passwordRequired');
    } else if (password.length < 8) {
      newErrors.password = t('auth.resetPassword.errors.passwordTooShort');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = t('auth.resetPassword.errors.passwordWeak');
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('auth.resetPassword.errors.confirmRequired');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.resetPassword.errors.passwordMismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage(t('auth.resetPassword.errors.invalidLink'));
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
        setMessage(t('auth.resetPassword.successMessage'));
        // 清空表单
        setPassword("");
        setConfirmPassword("");
        // 3秒后跳转到登录页面
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } else {
        setMessage(data.error || t('auth.resetPassword.errors.resetFailed'));
      }
    } catch (error) {
      setMessage(t('auth.resetPassword.errors.resetFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{t('auth.resetPassword.invalidLinkTitle')}</h2>
          <p className="text-gray-600 mb-6">
            {t('auth.resetPassword.invalidLinkMessage')}
          </p>
          <Link
            href="/auth/forgot-password"
            className="inline-block px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            {t('auth.resetPassword.requestAgain')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.resetPassword.title')}</h2>
          <p className="text-gray-600">{t('auth.resetPassword.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label={t('auth.resetPassword.newPasswordLabel')}
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
            error={errors.password}
            helperText={t('auth.resetPassword.passwordHelper')}
            required
          />

          <Input
            label={t('auth.resetPassword.confirmPasswordLabel')}
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
            error={errors.confirmPassword}
            required
          />

          {message && (
            <div className="text-center">
              <p className={`text-sm ${message.includes("成功") || message.includes("success") || message.includes("Successfully") ? "text-green-600" : "text-red-600"}`}>
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
            {t('auth.resetPassword.resetButton')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('auth.resetPassword.rememberPassword')}{" "}
            <Link
              href="/auth/login"
              className="font-medium text-orange-600 hover:text-orange-500 transition-colors"
            >
              {t('auth.resetPassword.loginNow')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
