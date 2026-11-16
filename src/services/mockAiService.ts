import type { GeminiMatchAnalysis } from "./geminiService";

export interface PreMatchedResultItem {
  id: string;
  requirementId: string;
  researcherId: string;
  researcherName: string;
  researcherFaculty: string;
  researcherRole: string;
  researcherAvatarInitial?: string;
  researcherAvatarColor?: string;
  fundingId?: string;
  fundingTitle?: string;
  fundingCode?: string;
  fundingSupportRatio?: string;
  fundingMaxBudget?: number;
  fitScore: number;
  scoreBreakdown: {
    expertiseAlignment: number;
    domainSynergy: number;
    practicalFeasibility: number;
  };
  explanation: string;
  suggestedTags: string[];
  isSelected: boolean;
}

interface AnalyzeMatchInput {
  requirementTitle: string;
  problemStatement: string;
  researcherName: string;
  researcherFaculty?: string;
  researcherExpertise?: string;
  researcherOutstandingWorks?: string;
  fundingTitle?: string;
}

/**
 * Keyword database for domain synergy and tag suggestions
 */
const DOMAIN_KEYWORDS: Record<
  string,
  { keywords: string[]; tags: string[]; defaultBreakdown: { exp: number; dom: number; prac: number } }
> = {
  cosmetics: {
    keywords: [
      "เครื่องสำอาง",
      "ส้มซ่า",
      "ลิปทินท์",
      "ลิป",
      "สูตรตำรับ",
      "บำรุงผิว",
      "สารสกัด",
      "สมุนไพร",
      "สกัด",
      "เปลือก",
      "waste to value",
      "cosmetic",
      "skincare",
    ],
    tags: [
      "เครื่องสำอางและเวชสำอาง",
      "การพัฒนาสูตรตำรับ",
      "การสกัดสารสำคัญ",
      "Waste to Value",
      "มาตรฐาน อย.",
    ],
    defaultBreakdown: { exp: 0.94, dom: 0.92, prac: 0.9 },
  },
  food_hpp: {
    keywords: [
      "ทับทิม",
      "น้ำทับทิม",
      "hpp",
      "ความดันสูง",
      "ยืดอายุ",
      "พาสเจอร์ไรส์",
      "จุลินทรีย์",
      "เครื่องดื่ม",
      "อาหารแปรรูป",
      "สารต้านอนุมูลอิสระ",
      "anthocyanin",
      "polyphenol",
      "ผลไม้",
      "gmp",
    ],
    tags: [
      "เกษตรและแปรรูปอาหาร",
      "เทคโนโลยีความดันสูง (HPP)",
      "การยืดอายุการเก็บรักษา",
      "เครื่องดื่มสุขภาพ",
      "มาตรฐาน GMP",
    ],
    defaultBreakdown: { exp: 0.95, dom: 0.93, prac: 0.92 },
  },
  digital_ai: {
    keywords: [
      "ดิจิทัล",
      "ai",
      "ปัญญาประดิษฐ์",
      "ซอฟต์แวร์",
      "iot",
      "แอปพลิเคชัน",
      "ระบบ",
      "แพลตฟอร์ม",
      "คอมพิวเตอร์",
      "ข้อมูล",
    ],
    tags: [
      "เทคโนโลยีและดิจิทัล",
      "AI & Machine Learning",
      "Smart Farming / IoT",
      "ระบบฐานข้อมูลและการจัดการ",
    ],
    defaultBreakdown: { exp: 0.91, dom: 0.89, prac: 0.88 },
  },
  engineering: {
    keywords: [
      "เครื่องจักร",
      "วิศวกรรม",
      "กลไก",
      "โรงงาน",
      "แปรรูป",
      "กึ่งอัตโนมัติ",
      "ล้อ",
      "โลหะ",
      "พลังงาน",
    ],
    tags: [
      "วิศวกรรมและเครื่องจักรกล",
      "การออกแบบเครื่องจักรกลเกษตร",
      "การปรับปรุงประสิทธิภาพการผลิต",
    ],
    defaultBreakdown: { exp: 0.88, dom: 0.87, prac: 0.85 },
  },
  business_marketing: {
    keywords: [
      "การตลาด",
      "bmc",
      "business model",
      "แผนธุรกิจ",
      "แบรนด์",
      "บรรจุภัณฑ์",
      "ของฝาก",
      "ทรัพย์สินทางปัญญา",
      "ลิขสิทธิ์",
      "สิทธิบัตร",
    ],
    tags: [
      "การบริหารและกลยุทธ์การตลาด",
      "Business Model Canvas (BMC)",
      "ทรัพย์สินทางปัญญาและมาตรฐาน",
    ],
    defaultBreakdown: { exp: 0.92, dom: 0.9, prac: 0.91 },
  },
};

/**
 * Smart Mock AI Analysis that generates realistic, context-specific results
 * without making external network calls to Gemini API.
 */
export function mockAnalyzeMatch(input: AnalyzeMatchInput): GeminiMatchAnalysis {
  const textCorpus = [
    input.requirementTitle,
    input.problemStatement,
    input.researcherExpertise || "",
    input.researcherFaculty || "",
    input.researcherOutstandingWorks || "",
  ]
    .join(" ")
    .toLowerCase();

  // 1. Identify matched domain
  let matchedDomain = "food_hpp";
  let maxDomainMatches = 0;

  for (const [domainKey, config] of Object.entries(DOMAIN_KEYWORDS)) {
    const matchCount = config.keywords.filter((kw) => textCorpus.includes(kw.toLowerCase())).length;
    if (matchCount > maxDomainMatches) {
      maxDomainMatches = matchCount;
      matchedDomain = domainKey;
    }
  }

  const domainConfig = DOMAIN_KEYWORDS[matchedDomain];

  // 2. Compute dynamic fit score based on text alignment
  const overlapBonus = Math.min(0.08, maxDomainMatches * 0.02);
  const baseScore = 0.86 + overlapBonus;
  const fitScore = Math.min(0.98, Number(baseScore.toFixed(2)));

  const scoreBreakdown = {
    expertiseAlignment: Math.min(0.98, Number((domainConfig.defaultBreakdown.exp + overlapBonus * 0.5).toFixed(2))),
    domainSynergy: Math.min(0.97, Number((domainConfig.defaultBreakdown.dom + overlapBonus * 0.5).toFixed(2))),
    practicalFeasibility: Math.min(0.95, Number((domainConfig.defaultBreakdown.prac + overlapBonus * 0.5).toFixed(2))),
  };

  // 3. Generate natural Thai rationale
  const researcherTitle = input.researcherName.trim();
  const faculty = input.researcherFaculty ? `สังกัด${input.researcherFaculty}` : "มหาวิทยาลัยนเรศวร";
  const project = input.requirementTitle || "โครงการพัฒนาผลิตภัณฑ์";
  const fundingNote = input.fundingTitle ? ` และมีความพร้อมสูงในการขอรับการสนับสนุนงบประมาณภายใต้ ${input.fundingTitle}` : "";

  let explanation = "";
  if (matchedDomain === "cosmetics") {
    explanation = `${researcherTitle} ${faculty} มีความเชี่ยวชาญเฉพาะด้านเทคโนโลยีเภสัชกรรมและการพัฒนาสูตรตำรับเครื่องสำอาง ซึ่งตอบสนองตรงจุดกับโจทย์ "${project}" โดยสามารถประยุกต์ใช้องค์ความรู้การสกัดสารออกฤทธิ์และควบคุมคุณภาพตามมาตรฐาน อย./GMP ได้อย่างแม่นยำ${fundingNote}`;
  } else if (matchedDomain === "food_hpp") {
    explanation = `${researcherTitle} ${faculty} มีความเชี่ยวชาญด้านวิทยาศาสตร์และเทคโนโลยีการแปรรูปอาหาร สามารถให้คำปรึกษาและออกแบบกระบวนการผลิตเพื่อยืดอายุการเก็บรักษาและรักษาสารสำคัญในผลิตภัณฑ์สำหรับ "${project}" ได้อย่างมีประสิทธิภาพตามมาตรฐานอุตสาหกรรม${fundingNote}`;
  } else if (matchedDomain === "business_marketing") {
    explanation = `${researcherTitle} ${faculty} มีความเชี่ยวชาญด้านกลยุทธ์การตลาด การออกแบบ Business Model Canvas (BMC) และการจัดการทรัพย์สินทางปัญญา สามารถช่วยวางทิศทางเชิงพาณิชย์และขยายตลาดสำหรับ "${project}" ได้อย่างครบวงจร${fundingNote}`;
  } else {
    explanation = `${researcherTitle} ${faculty} มีประสบการณ์และผลงานวิจัยที่สอดคล้องกับโจทย์ความต้องการ "${project}" โดยสามารถนำเทคโนโลยีและระเบียบวิธีวิจัยขั้นสูงมาช่วยแก้ไขปัญหาและพัฒนาผลิตภัณฑ์ให้มีขีดความสามารถการแข่งขันสูงขึ้น${fundingNote}`;
  }

  return {
    fitScore,
    scoreBreakdown,
    explanation,
    suggestedTags: domainConfig.tags.slice(0, 4),
  };
}

/**
 * Smart Tag Extraction based on requirement text
 */
export async function mockExtractTagsFromText(
  text: string,
  businessType?: string
): Promise<string[]> {
  const combined = `${text} ${businessType || ""}`.toLowerCase();
  const extractedTags = new Set<string>();

  for (const config of Object.values(DOMAIN_KEYWORDS)) {
    const hits = config.keywords.filter((kw) => combined.includes(kw.toLowerCase()));
    if (hits.length > 0) {
      config.tags.forEach((t) => extractedTags.add(t));
    }
  }

  // Fallback defaults if none matched
  if (extractedTags.size === 0) {
    extractedTags.add("วิสาหกิจชุมชน");
    extractedTags.add("การพัฒนาผลิตภัณฑ์ใหม่");
    extractedTags.add("การปรับปรุงกระบวนการผลิต");
  }

  return Array.from(extractedTags).slice(0, 6);
}
