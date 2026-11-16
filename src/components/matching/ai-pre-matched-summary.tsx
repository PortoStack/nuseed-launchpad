"use client";

import React, { useState } from "react";
import {
  Sparkles,
  UserCheck,
  Wallet,
  CheckCircle2,
  RefreshCw,
  Lightbulb,
  Building,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PreMatchedResultItem } from "@/services/mockAiService";
import { reMatchRequirementAction } from "@/app/actions/requirement-actions";

interface AIPreMatchedSummaryProps {
  requirementId: string;
  initialMatches: PreMatchedResultItem[];
  onSelectTab?: (tab: "researchers" | "coaches" | "funding") => void;
}

export function AIPreMatchedSummary({
  requirementId,
  initialMatches,
  onSelectTab,
}: AIPreMatchedSummaryProps) {
  const [matches, setMatches] = useState<PreMatchedResultItem[]>(initialMatches);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (matches.length === 0) return null;

  // Separate Lead Researcher and Coach/Advisor/Co-Researcher
  const leadResearcherMatch = matches[0];
  const coachMatch = matches.length > 1 ? matches[1] : null;
  const fundingInfo = leadResearcherMatch || matches[0];

  const handleReMatch = async () => {
    setIsRefreshing(true);
    try {
      const res = await reMatchRequirementAction(requirementId);
      if (res.success && res.results.length > 0) {
        setMatches(res.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card rounded-2xl border p-5 shadow-xs space-y-4">
      {/* Header bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              ผลการวิเคราะห์และจับคู่ล่วงหน้าโดย AI (AI Pre-Matched Recommendation)
            </h3>
            <p className="text-muted-foreground text-xs">
              ระบบวิเคราะห์จับคู่นักวิจัยหลัก ที่ปรึกษา และแหล่งทุนตามโครงสร้างข้อเสนอโครงการ IRTC
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs py-0.5"
          >
            ✓ Match สำเร็จ
          </Badge>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReMatch}
            disabled={isRefreshing}
            className="text-muted-foreground hover:text-foreground h-7 gap-1 text-xs"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
            คำนวณใหม่
          </Button>
        </div>
      </div>

      {/* Recommended 3 Pillars Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Pillar 1: Lead Researcher */}
        {leadResearcherMatch && (
          <div className="border-border/80 bg-card rounded-xl border p-4 shadow-2xs flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
                  <UserCheck className="text-primary h-3.5 w-3.5" />
                  หัวหน้าโครงการ (นักวิจัยเทคโนโลยี)
                </span>
                <Badge className="bg-emerald-600 text-white text-[11px] px-1.5 py-0 font-bold">
                  {Math.round(leadResearcherMatch.fitScore * 100)}% Fit
                </Badge>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-2xs"
                  style={{
                    backgroundColor:
                      leadResearcherMatch.researcherAvatarColor || "#0e6197",
                  }}
                >
                  {leadResearcherMatch.researcherAvatarInitial ||
                    leadResearcherMatch.researcherName.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-foreground truncate text-sm font-bold">
                    {leadResearcherMatch.researcherName}
                  </h4>
                  <p className="text-muted-foreground truncate text-xs">
                    {leadResearcherMatch.researcherFaculty}
                  </p>
                </div>
              </div>

              <p className="text-muted-foreground line-clamp-3 text-xs pt-1 leading-relaxed">
                {leadResearcherMatch.explanation}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectTab && onSelectTab("researchers")}
              className="w-full text-xs h-7 gap-1 justify-center"
            >
              ดูรายละเอียดในแท็บนักวิจัย <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Pillar 2: Coach & Advisor */}
        {coachMatch ? (
          <div className="border-border/80 bg-card rounded-xl border p-4 shadow-2xs flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
                  <Lightbulb className="text-amber-500 h-3.5 w-3.5" />
                  {coachMatch.researcherRole === "coach" || coachMatch.researcherRole === "advisor"
                    ? "ที่ปรึกษา / โค้ช (การตลาด & BMC)"
                    : "ผู้ร่วมวิจัย / ที่ปรึกษาโครงการ"}
                </span>
                <Badge className="bg-amber-600 text-white text-[11px] px-1.5 py-0 font-bold">
                  {Math.round(coachMatch.fitScore * 100)}% Fit
                </Badge>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-2xs"
                  style={{
                    backgroundColor: coachMatch.researcherAvatarColor || "#d97706",
                  }}
                >
                  {coachMatch.researcherAvatarInitial ||
                    coachMatch.researcherName.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-foreground truncate text-sm font-bold">
                    {coachMatch.researcherName}
                  </h4>
                  <p className="text-muted-foreground truncate text-xs">
                    {coachMatch.researcherFaculty}
                  </p>
                </div>
              </div>

              <p className="text-muted-foreground line-clamp-3 text-xs pt-1 leading-relaxed">
                {coachMatch.explanation}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectTab && onSelectTab("coaches")}
              className="w-full text-xs h-7 gap-1 justify-center"
            >
              ดูรายละเอียดในแท็บที่ปรึกษา <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="border-border/80 bg-card rounded-xl border p-4 shadow-2xs flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <span className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
                <Lightbulb className="text-amber-500 h-3.5 w-3.5" />
                ที่ปรึกษาด้านการตลาดและแผนธุรกิจ
              </span>
              <p className="text-muted-foreground text-xs pt-2">
                สามารถเลือกดูรายชื่อที่ปรึกษาและโค้ชเพื่อร่วมจัดทำแบบจำลองธุรกิจ BMC และกลยุทธ์การตลาด
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectTab && onSelectTab("coaches")}
              className="w-full text-xs h-7 gap-1 justify-center"
            >
              เลือกดูที่ปรึกษา <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Pillar 3: Funding Program */}
        {fundingInfo.fundingTitle && (
          <div className="border-border/80 bg-card rounded-xl border p-4 shadow-2xs flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
                  <Wallet className="text-emerald-500 h-3.5 w-3.5" />
                  แหล่งเงินทุนที่แนะนำ
                </span>
                <Badge variant="outline" className="text-primary font-bold text-xs">
                  {fundingInfo.fundingCode || "GRANT"}
                </Badge>
              </div>

              <div className="pt-1">
                <h4 className="text-foreground text-sm font-bold line-clamp-2">
                  {fundingInfo.fundingTitle}
                </h4>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>วงเงินสูงสุด:</span>
                    <span className="font-semibold text-foreground">
                      {fundingInfo.fundingMaxBudget
                        ? `${fundingInfo.fundingMaxBudget.toLocaleString()} บาท`
                        : "ตามระเบียบโครงการ"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>สัดส่วนสนับสนุน:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {fundingInfo.fundingSupportRatio || "ภาครัฐสนับสนุน"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectTab && onSelectTab("funding")}
              className="w-full text-xs h-7 gap-1 justify-center"
            >
              ดูรายละเอียดในแท็บแหล่งทุน <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
