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
