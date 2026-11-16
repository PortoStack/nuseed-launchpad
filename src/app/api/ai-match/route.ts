import { NextResponse } from "next/server";
import { analyzeMatchWithGemini } from "@/services/geminiService";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is not configured in environment variables (.env.local)",
        },
        { status: 503 }
      );
    }

    const result = await analyzeMatchWithGemini(body);

    if (!result) {
      return NextResponse.json(
        { error: "Gemini AI analysis could not be generated" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API /api/ai-match error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
