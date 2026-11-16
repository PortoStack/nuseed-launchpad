"use client";

import React, { useState } from "react";
import { Sparkles, Brain, CheckCircle2, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface AIMatchingInsightProps {
  requirementTitle: string;
  problemStatement: string;
  researcherName: string;
  researcherFaculty?: string;
  researcherExpertise?: string;
  fundingTitle?: string;
}

export function AIMatchingInsightDialog({
  requirementTitle,
  problemStatement,
  researcherName,
  researcherFaculty,
  researcherExpertise,
  fundingTitle,
}: AIMatchingInsightProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    fitScore: number;
    scoreBreakdown: {
      expertiseAlignment: number;
      domainSynergy: number;
      practicalFeasibility: number;
    };
    explanation: string;
    suggestedTags: string[];
  } | null>(null);

  const fetchAnalysis = async () => {
    if (analysis) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirementTitle,
          problemStatement,
          researcherName,
          researcherFaculty,
          researcherExpertise,
          fundingTitle,
        }),
      });
      const data = await res.json();
      if (data && data.fitScore !== undefined) {
        setAnalysis(data);
      }
    } catch (e) {
      console.error("AI Analysis fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) fetchAnalysis();
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="xs"
            className="bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 hover:border-primary/40 text-xs font-medium"
          >
            <Sparkles className="mr-1 h-3.5 w-3.5 text-amber-500" />
            AI Analysis
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                บทวิเคราะห์ความเข้ากันได้โดย Gemini AI
              </DialogTitle>
              <DialogDescription className="text-xs">
                วิเคราะห์ความเชี่ยวชาญเชิงลึกเทียบกับโจทย์ปัญหาจริง
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-xs">
              กำลังเชื่อมต่อ Gemini API เพื่อวิเคราะห์ความเข้ากันได้...
            </p>
          </div>
        ) : analysis ? (
          <div className="space-y-4 pt-2">
            {/* Overall Score */}
            <div className="bg-primary/5 border-primary/20 flex items-center justify-between rounded-xl border p-4">
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  AI Semantic Fit Score
                </p>
                <p className="text-primary text-2xl font-black">
                  {Math.round(analysis.fitScore * 100)}%
                </p>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
                ประเมินผลด้วย Gemini 2.5 Flash
              </Badge>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-muted/40 rounded-lg p-2.5">
                <p className="text-muted-foreground text-[11px]">ความตรงของทักษะ</p>
                <p className="text-foreground text-sm font-bold mt-0.5">
                  {Math.round(analysis.scoreBreakdown.expertiseAlignment * 100)}%
                </p>
              </div>
              <div className="bg-muted/40 rounded-lg p-2.5">
                <p className="text-muted-foreground text-[11px]">ความสอดคล้องอุตสาหกรรม</p>
                <p className="text-foreground text-sm font-bold mt-0.5">
                  {Math.round(analysis.scoreBreakdown.domainSynergy * 100)}%
                </p>
              </div>
              <div className="bg-muted/40 rounded-lg p-2.5">
                <p className="text-muted-foreground text-[11px]">ความเป็นไปได้</p>
                <p className="text-foreground text-sm font-bold mt-0.5">
                  {Math.round(analysis.scoreBreakdown.practicalFeasibility * 100)}%
                </p>
              </div>
            </div>

            {/* Explanation */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                เหตุผลและความเห็นจาก AI:
              </p>
              <div className="bg-muted/30 border-border rounded-lg border p-3 text-xs leading-relaxed text-foreground">
                {analysis.explanation}
              </div>
            </div>

            {/* Suggested Tags */}
            {analysis.suggestedTags && analysis.suggestedTags.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-muted-foreground text-[11px] font-medium">
                  แท็กที่ AI แนะนำเพิ่มเติม:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.suggestedTags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-primary/10 text-primary border border-primary/20 rounded-md px-2 py-0.5 text-[11px]"
                    >
                      +{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-muted/30 border border-dashed rounded-lg p-6 text-center text-xs text-muted-foreground">
            ยังไม่ได้ตั้งค่า `GEMINI_API_KEY` ในสภาพแวดล้อม หรือไม่สามารถเชื่อมต่อได้ในขณะนี้
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
