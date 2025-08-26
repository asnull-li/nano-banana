import { nanoBananaTasks } from "@/db/schema";
import { db } from "@/db";
import { eq, desc } from "drizzle-orm";

// 创建任务记录
export async function insertTask(
  data: typeof nanoBananaTasks.$inferInsert
): Promise<typeof nanoBananaTasks.$inferSelect | undefined> {
  const [task] = await db().insert(nanoBananaTasks).values(data).returning();
  return task;
}

// 通过task_id查询任务
export async function findTaskById(
  taskId: string
): Promise<typeof nanoBananaTasks.$inferSelect | undefined> {
  const [task] = await db()
    .select()
    .from(nanoBananaTasks)
    .where(eq(nanoBananaTasks.task_id, taskId))
    .limit(1);
  return task;
}

// 通过request_id查询任务
export async function findTaskByRequestId(
  requestId: string
): Promise<typeof nanoBananaTasks.$inferSelect | undefined> {
  const [task] = await db()
    .select()
    .from(nanoBananaTasks)
    .where(eq(nanoBananaTasks.request_id, requestId))
    .limit(1);
  return task;
}

// 更新任务状态
export async function updateTaskStatus(
  taskId: string,
  updates: Partial<typeof nanoBananaTasks.$inferSelect>
): Promise<typeof nanoBananaTasks.$inferSelect | undefined> {
  const [updated] = await db()
    .update(nanoBananaTasks)
    .set({ ...updates, updated_at: new Date() })
    .where(eq(nanoBananaTasks.task_id, taskId))
    .returning();
  return updated;
}

// 通过request_id更新任务
export async function updateTaskByRequestId(
  requestId: string,
  updates: Partial<typeof nanoBananaTasks.$inferSelect>
): Promise<typeof nanoBananaTasks.$inferSelect | undefined> {
  const [updated] = await db()
    .update(nanoBananaTasks)
    .set({ ...updates, updated_at: new Date() })
    .where(eq(nanoBananaTasks.request_id, requestId))
    .returning();
  return updated;
}

// 查询用户的任务列表
export async function findTasksByUser(
  userUuid: string,
  limit: number = 20
): Promise<(typeof nanoBananaTasks.$inferSelect)[]> {
  const tasks = await db()
    .select()
    .from(nanoBananaTasks)
    .where(eq(nanoBananaTasks.user_uuid, userUuid))
    .orderBy(desc(nanoBananaTasks.created_at))
    .limit(limit);
  return tasks;
}