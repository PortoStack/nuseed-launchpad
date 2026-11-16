import { GoogleGenAI } from "@google/genai";
import { mockAnalyzeMatch } from "./mockAiService";

export interface GeminiMatchAnalysis {
  fitScore: number; // 0.0 - 1.0
  scoreBreakdown: {
    expertiseAlignment: number; // 0.0 - 1.0
    domainSynergy: number; // 0.0 - 1.0
    practicalFeasibility: number; // 0.0 - 1.0
  };
  explanation: string; // คำอธิบายวิเคราะห์ภาษาไทย
  suggestedTags: string[]; // แท็กที่แนะนำเพิ่มเติม
}

export async function analyzeMatchWithGemini(input: {
  requirementTitle: string;
  problemStatement: string;
  researcherName: string;
  researcherFaculty?: string;
  researcherExpertise?: string;
  researcherOutstandingWorks?: string;
  fundingTitle?: string;
}): Promise<GeminiMatchAnalysis | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  const useMock = process.env.USE_MOCK_AI === "true" || !apiKey;

  if (useMock) {
    return mockAnalyzeMatch(input);
  }

  const {
    requirementTitle,
    problemStatement,
    researcherName,
    researcherFaculty,
    researcherExpertise,
    researcherOutstandingWorks,
    fundingTitle,
  } = input;

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
คุณเป็นผู้เชี่ยวชาญด้านการจับคู่งานวิจัยกับผู้ประกอบการ (Technology Transfer & Matching Specialist) ของอุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร
กรุณาวิเคราะห์ความเข้ากันได้ระหว่าง "โจทย์ความต้องการของผู้ประกอบการ" กับ "ความเชี่ยวชาญของนักวิจัย" (และกรอบทุนสนับสนุน ถ้ามี)

ข้อมูลโจทย์ผู้ประกอบการ:
- ชื่อโครงการ/บริษัท: ${requirementTitle}
- โจทย์ปัญหา/ความต้องการ: ${problemStatement}

ข้อมูลนักวิจัย:
- ชื่อ: ${researcherName}
- คณะ/สังกัด: ${researcherFaculty || "ไม่ระบุ"}
- ความเชี่ยวชาญ: ${researcherExpertise || "ไม่ระบุ"}
- ผลงานวิจัยเด่น/ประสบการณ์: ${researcherOutstandingWorks || "ไม่ระบุ"}

${fundingTitle ? `กรอบทุนสนับสนุนเป้าหมาย: ${fundingTitle}` : ""}

กรุณาวิเคราะห์และตอบกลับในรูปแบบ JSON ตาม Schema นี้เท่านั้น (ไม่มี markdown code block หรือคำอธิบายเสริม):
{
  "fitScore": <ตัวเลขทศนิยมระหว่าง 0.0 ถึง 1.0 แสดงคะแนนความเข้ากันได้โดยรวม>,
  "scoreBreakdown": {
    "expertiseAlignment": <ตัวเลข 0.0 - 1.0 ความตรงกับความเชี่ยวชาญ>,
    "domainSynergy": <ตัวเลข 0.0 - 1.0 ความสอดคล้องของอุตสาหกรรม>,
    "practicalFeasibility": <ตัวเลข 0.0 - 1.0 ความเป็นไปได้ในการประยุกต์ใช้จริง>
  },
  "explanation": "<บทวิเคราะห์ภาษาไทย 2-3 ประโยค สรุปเหตุผลความเหมาะสม จุดเด่น หรือข้อเสนอแนะในการทำโครงการร่วมกัน>",
  "suggestedTags": ["<แท็กที่เกี่ยวข้อง 2-4 แท็ก>"]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return null;

    const parsed: GeminiMatchAnalysis = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.error("Gemini Match Analysis error:", error);
    return null;
  }
}
