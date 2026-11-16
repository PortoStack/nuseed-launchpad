import { NextResponse } from "next/server";
import { requirementService } from "@/services/requirementService";

export async function GET() {
  try {
    const requirements = await requirementService.getRequirements();
    return NextResponse.json({
      success: true,
      count: requirements.length,
      data: requirements,
    });
  } catch (error) {
    console.error("GET /api/requirements error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch requirements" },
      { status: 500 }
    );
  }
}
