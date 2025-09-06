import { NextRequest, NextResponse } from "next/server";
import { getUserUuid } from "@/services/user";
import { db } from "@/db";
import { nanoBananaTasks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const userUuid = await getUserUuid();
    if (!userUuid) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // 查询用户的任务列表
    const tasks = await db()
      .select()
      .from(nanoBananaTasks)
      .where(eq(nanoBananaTasks.user_uuid, userUuid))
      .orderBy(desc(nanoBananaTasks.created_at))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      tasks,
      page,
      limit,
    });
  } catch (error) {
    console.error("History API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch history",
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}