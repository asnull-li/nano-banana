import { wan25Tasks } from "@/db/schema";
import { db } from "@/db";
import { eq, desc } from "drizzle-orm";

// 创建任务记录
export async function insertTask(
  data: typeof wan25Tasks.$inferInsert
): Promise<typeof wan25Tasks.$inferSelect | undefined> {
  const [task] = await db().insert(wan25Tasks).values(data).returning();
  return task;
}

// 通过 task_id 查询任务
export async function findTaskById(
  taskId: string
): Promise<typeof wan25Tasks.$inferSelect | undefined> {
  const [task] = await db()
    .select()
    .from(wan25Tasks)
    .where(eq(wan25Tasks.task_id, taskId))
    .limit(1);
  return task;
}

// 通过 request_id 查询任务
export async function findTaskByRequestId(
  requestId: string
): Promise<typeof wan25Tasks.$inferSelect | undefined> {
  const [task] = await db()
    .select()
    .from(wan25Tasks)
    .where(eq(wan25Tasks.request_id, requestId))
    .limit(1);
  return task;
}

// 更新任务状态（通过 task_id）
export async function updateTaskStatus(
  taskId: string,
  updates: Partial<typeof wan25Tasks.$inferSelect>
): Promise<typeof wan25Tasks.$inferSelect | undefined> {
  const [updated] = await db()
    .update(wan25Tasks)
    .set({ ...updates, updated_at: new Date() })
    .where(eq(wan25Tasks.task_id, taskId))
    .returning();
  return updated;
}

// 通过 request_id 更新任务
export async function updateTaskByRequestId(
  requestId: string,
  updates: Partial<typeof wan25Tasks.$inferSelect>
): Promise<typeof wan25Tasks.$inferSelect | undefined> {
  const [updated] = await db()
    .update(wan25Tasks)
    .set({ ...updates, updated_at: new Date() })
    .where(eq(wan25Tasks.request_id, requestId))
    .returning();
  return updated;
}

// 查询用户的任务列表
export async function findTasksByUser(
  userUuid: string,
  limit: number = 20
): Promise<(typeof wan25Tasks.$inferSelect)[]> {
  const tasks = await db()
    .select()
    .from(wan25Tasks)
    .where(eq(wan25Tasks.user_uuid, userUuid))
    .orderBy(desc(wan25Tasks.created_at))
    .limit(limit);
  return tasks;
}
