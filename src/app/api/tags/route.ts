import { NextResponse } from "next/server";
import { tagCatalogService } from "@/services/tagCatalogService";

export async function GET() {
  try {
    const catalog = await tagCatalogService.getCatalog();
    return NextResponse.json({
      success: true,
      count: catalog.length,
      data: catalog,
    });
  } catch (error) {
    console.error("GET /api/tags error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.label) {
      return NextResponse.json(
        { success: false, error: "Tag label is required" },
        { status: 400 }
      );
    }
    const created = await tagCatalogService.createTag(body);
    return NextResponse.json({
      success: true,
      data: created,
    });
  } catch (error) {
    console.error("POST /api/tags error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
