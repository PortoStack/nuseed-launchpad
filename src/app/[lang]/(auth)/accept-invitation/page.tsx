"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Lock, User, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AcceptInvitationPage() {
  const params = useParams<{ lang: string }>();
  const lang = params.lang || "th";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      setError(lang === "th" ? "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" : "Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError(lang === "th" ? "รหัสผ่านยืนยันไม่ตรงกัน" : "Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate/perform invitation setup
      await new Promise((res) => setTimeout(res, 800));
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Failed to set up account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full">
      <div className="animate-in fade-in-0 slide-in-from-bottom-4 bg-brand-surface flex h-full w-full flex-col justify-center rounded-3xl p-8 shadow-2xl duration-500 sm:p-12">
        <div className="mx-auto w-full max-w-[400px]">
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-status-success-surface text-status-success-foreground">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {lang === "th" ? "ตั้งรหัสผ่านสำเร็จ" : "Account setup complete"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {lang === "th"
                  ? "บัญชีของคุณพร้อมใช้งานแล้ว สามารถเข้าสู่ระบบได้ทันที"
                  : "Your account is ready. You can now log in."}
              </p>
              <Button
                onClick={() => router.push(`/${lang}/login`)}
                className="w-full bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary-hover"
              >
                {lang === "th" ? "ไปที่หน้าเข้าสู่ระบบ" : "Go to Login"}
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-foreground mb-3 text-center text-[22px] font-bold">
                {lang === "th" ? "ยอมรับคำเชิญและตั้งรหัสผ่าน" : "Accept Invitation"}
              </h1>
              <p className="text-center text-xs text-muted-foreground mb-8">
                {lang === "th"
                  ? "ยินดีต้อนรับสู่ NU SEED Launchpad กรุณากำหนดรหัสผ่านสำหรับเข้าใช้งาน"
                  : "Welcome to NU SEED Launchpad. Please set up your password."}
              </p>

              {error && (
                <div className="bg-status-danger-surface text-status-danger-foreground mb-6 rounded-lg px-4 py-3 text-center text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="invitation-password">
                    {lang === "th" ? "รหัสผ่านใหม่" : "New Password"}
                  </Label>
                  <div className="relative">
                    <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      id="invitation-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="invitation-confirm">
                    {lang === "th" ? "ยืนยันรหัสผ่าน" : "Confirm Password"}
                  </Label>
                  <div className="relative">
                    <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      id="invitation-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 text-sm"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary-hover h-11 w-full rounded-md text-sm font-medium transition-all cursor-pointer mt-2"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : lang === "th" ? (
                    "บันทึกและเข้าสู่ระบบ"
                  ) : (
                    "Save & Continue"
                  )}
                </Button>

                <div className="text-center pt-2">
                  <Link
                    href={`/${lang}/login`}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {lang === "th" ? "กลับไปหน้าเข้าสู่ระบบ" : "Back to login"}
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
