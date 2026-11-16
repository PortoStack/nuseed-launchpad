import { NextResponse } from "next/server";
import { fundingService } from "@/services/fundingService";

export async function GET() {
  try {
    const fundings = await fundingService.getFundings();
    return NextResponse.json({
      success: true,
      count: fundings.length,
      data: fundings,
    });
  } catch (error) {
    console.error("GET /api/fundings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch funding programs" },
      { status: 500 }
    );
  }
}
