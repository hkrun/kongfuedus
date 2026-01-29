"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ForgotPasswordForm() {
  const t = useTranslations();
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError(t('auth.forgotPassword.errors.emailRequired'));
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('auth.forgotPassword.errors.emailInvalid'));
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
        setMessage(t('auth.forgotPassword.successMessage'));
        setEmail("");
      } else {
        setError(data.error || t('auth.forgotPassword.errors.sendFailed'));
      }
    } catch (error) {
      setError(t('auth.forgotPassword.errors.sendFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.forgotPassword.title')}</h2>
          <p className="text-gray-600">
            {t('auth.forgotPassword.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label={t('auth.forgotPassword.emailLabel')}
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.forgotPassword.emailPlaceholder')}
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
            {t('auth.forgotPassword.sendButton')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('auth.forgotPassword.rememberPassword')}{" "}
            <Link
              href={`/${locale}/auth/login`}
              className="font-medium text-orange-600 hover:text-orange-500 transition-colors"
            >
              {t('auth.forgotPassword.loginNow')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
