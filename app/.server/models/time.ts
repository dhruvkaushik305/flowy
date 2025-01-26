import db from "drizzle/db";
import safeCall from "../safeCall";
import * as schema from "drizzle/schema";
import { and, eq, gte, lt } from "drizzle-orm";

export async function getTodayTime(userId: string) {
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
  const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

  const queryTodayTime = await safeCall(
    db
      .select({ timeStudied: schema.Time.timeStudied })
      .from(schema.Time)
      .where(
        and(
          eq(schema.Time.userId, userId),
          gte(schema.Time.createdAt, startOfDay),
          lt(schema.Time.createdAt, endOfDay),
        ),
      )
      .limit(1),
  );

  if (!queryTodayTime || queryTodayTime.length === 0) return 0;

  return queryTodayTime[0].timeStudied;
}

export async function updateTime(userId: string, newTime: number) {
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
  const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

  const queryExistingTime = await safeCall(
    db
      .select({ id: schema.Time.id })
      .from(schema.Time)
      .where(
        and(
          eq(schema.Time.id, userId),
          gte(schema.Time.createdAt, startOfDay),
          lt(schema.Time.createdAt, endOfDay),
        ),
      )
      .limit(1),
  );

  if (!queryExistingTime) return;

  if (queryExistingTime.length > 0) {
    await safeCall(
      db
        .update(schema.Time)
        .set({
          timeStudied: newTime,
        })
        .where(eq(schema.Time.id, queryExistingTime[0].id)),
    );
  } else {
    await safeCall(
      db.insert(schema.Time).values({
        timeStudied: newTime,
        userId,
      }),
    );
  }
}

export async function resetTimer(userId: string) {
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
  const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

  await safeCall(
    db
      .delete(schema.Time)
      .where(
        and(
          eq(schema.Time.userId, userId),
          gte(schema.Time.createdAt, startOfDay),
          lt(schema.Time.createdAt, endOfDay),
        ),
      ),
  );
}
