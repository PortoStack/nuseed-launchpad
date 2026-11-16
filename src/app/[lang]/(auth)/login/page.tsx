"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import type { ApiError } from "@/types/common";
import { useQueryClient } from "@tanstack/react-query";
import { postLoginPathForUser } from "@/lib/auth/landing-path";
import { IconTooltip } from "@/components/shared/IconTooltip";
import { loginSchema } from "@/lib/auth/input-validation";

export default function LoginPage() {
  const params = useParams<{ lang: string }>();
  const lang = params.lang || "th";
  const t = useTranslations("Login");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    form?: string;
  }>({});

  const safeReturnTo = () => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("returnTo") || params.get("redirect");
    if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
    return raw;
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    const result = loginSchema.safeParse({ username, password });
    if (!username.trim()) newErrors.username = t("usernameRequired");
    else if (
      !result.success &&
      result.error.issues.some((issue) => issue.path[0] === "username")
    )
      newErrors.username = t("usernameInvalid");
    if (!password.trim()) newErrors.password = t("passwordRequired");
    else if (
      !result.success &&
      result.error.issues.some((issue) => issue.path[0] === "password")
    )
      newErrors.password = t("passwordInvalid");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const { user } = await authService.login(
        loginSchema.parse({ username, password })
      );

      queryClient.clear();
      router.push(postLoginPathForUser(user, lang, safeReturnTo()));
    } catch (error: any) {
      const apiError = error as ApiError | undefined;
      const fieldErrors = apiError?.fieldErrors;
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        setErrors({
          username: fieldErrors.username?.[0],
          password: fieldErrors.password?.[0],
          form:
            fieldErrors.username || fieldErrors.password
              ? undefined
              : t("loginFailed"),
        });
      } else {
        setErrors({ form: error?.message || t("loginFailed") });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full">
      {/* Login Card */}
      <div
        className="animate-in fade-in-0 slide-in-from-bottom-4 bg-brand-surface flex h-full w-full flex-col justify-center rounded-3xl p-8 shadow-2xl duration-500 sm:p-12"
        style={{
          fontFamily:
            lang === "th" ? "var(--font-sarabun)" : "var(--font-roboto)",
        }}
      >
        <div className="mx-auto w-full max-w-[400px]">
          {/* Title */}
          <h1
            className="text-foreground mb-8 text-center text-[22px] font-bold"
            style={{
              fontFamily:
                lang === "th" ? "var(--font-prompt)" : "var(--font-inter)",
            }}
          >
            {t("title")}
          </h1>

          {/* Form Error */}
          {errors.form && (
            <div className="animate-in fade-in-0 slide-in-from-top-2 bg-status-danger-surface text-status-danger-foreground mb-6 rounded-lg px-4 py-3 text-center text-sm font-medium duration-300">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="login-username" className="sr-only">
                {t("usernamePlaceholder")}
              </Label>
              <div className="relative">
                <User className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="login-username"
                  type="text"
                  placeholder={t("usernamePlaceholder")}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username)
                      setErrors((prev) => ({ ...prev, username: undefined }));
                  }}
                  className={`border-input placeholder:text-muted-foreground focus-visible:border-brand-primary focus-visible:ring-brand-primary h-11 rounded-md bg-transparent pl-10 text-sm transition-all focus-visible:ring-1 ${errors.username ? "border-status-danger bg-status-danger-surface/50" : ""}`}
                  aria-invalid={!!errors.username}
                  aria-describedby={
                    errors.username
                      ? "login-username-hint login-username-error"
                      : "login-username-hint"
                  }
                  autoComplete="username"
                  maxLength={200}
                  autoCapitalize="none"
                  spellCheck={false}
                  onBlur={() => {
                    if (username)
                      setErrors((previous) => ({
                        ...previous,
                        username: loginSchema.shape.username.safeParse(username)
                          .success
                          ? undefined
                          : t("usernameInvalid"),
                      }));
                  }}
                  disabled={isLoading}
                />
              </div>
              <p
                id="login-username-hint"
                className="text-muted-foreground text-xs leading-relaxed"
              >
                {t("usernameHint")}
              </p>
              {errors.username && (
                <p
                  id="login-username-error"
                  className="text-status-danger-foreground text-xs font-medium"
                >
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="login-password" className="sr-only">
                {t("passwordPlaceholder")}
              </Label>
              <div className="relative">
                <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("passwordPlaceholder")}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`border-input placeholder:text-muted-foreground focus-visible:border-brand-primary focus-visible:ring-brand-primary h-11 rounded-md bg-transparent pr-10 pl-10 text-sm transition-all focus-visible:ring-1 ${errors.password ? "border-status-danger bg-status-danger-surface/50" : ""}`}
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "login-password-error" : undefined
                  }
                  autoComplete="current-password"
                  maxLength={200}
                  onBlur={() => {
                    if (password)
                      setErrors((previous) => ({
                        ...previous,
                        password: loginSchema.shape.password.safeParse(password)
                          .success
                          ? undefined
                          : t("passwordInvalid"),
                      }));
                  }}
                  disabled={isLoading}
                />
                <IconTooltip
                  label={t(showPassword ? "hidePassword" : "showPassword")}
                >
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-muted-foreground focus-visible:ring-brand-primary absolute top-1/2 right-3 -translate-y-1/2 rounded p-0.5 transition-colors focus-visible:ring-2 focus-visible:outline-none cursor-pointer"
                    aria-label={t(
                      showPassword ? "hidePassword" : "showPassword"
                    )}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </IconTooltip>
              </div>
              {errors.password && (
                <p
                  id="login-password-error"
                  className="text-status-danger-foreground text-xs font-medium"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary-hover h-11 w-full rounded-md text-sm font-medium transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="animate-pulse">{t("loggingIn")}</span>
                </>
              ) : (
                t("loginButton")
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
