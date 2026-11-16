import { NextResponse } from "next/server";
import { peopleService } from "@/services/peopleService";

export async function GET() {
  try {
    const researchers = await peopleService.getMatchingPeople();
    return NextResponse.json({
      success: true,
      count: researchers.length,
      data: researchers,
    });
  } catch (error) {
    console.error("GET /api/researchers error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch researchers" },
      { status: 500 }
    );
  }
}
