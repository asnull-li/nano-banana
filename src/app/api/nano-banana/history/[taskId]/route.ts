import { NextRequest, NextResponse } from "next/server";
import { getUserUuid } from "@/services/user";
import { db } from "@/db";
import { nanoBananaTasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    
    // 验证用户身份
    const userUuid = await getUserUuid();
    if (!userUuid) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // 验证任务是否属于当前用户
    const [task] = await db()
      .select()
      .from(nanoBananaTasks)
      .where(
        and(
          eq(nanoBananaTasks.task_id, taskId),
          eq(nanoBananaTasks.user_uuid, userUuid)
        )
      )
      .limit(1);

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found or unauthorized" },
        { status: 404 }
      );
    }

    // 删除任务
    await db()
      .delete(nanoBananaTasks)
      .where(
        and(
          eq(nanoBananaTasks.task_id, taskId),
          eq(nanoBananaTasks.user_uuid, userUuid)
        )
      );

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete task",
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}