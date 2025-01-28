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

export async function getTimeActivity(userId: string) {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const queryTimeActivity = await safeCall(
    db
      .select({
        dateTime: schema.Time.createdAt,
        timeStudied: schema.Time.timeStudied,
      })
      .from(schema.Time)
      .where(
        and(
          eq(schema.Time.userId, userId),
          gte(schema.Time.createdAt, startOfWeek),
          lt(schema.Time.createdAt, endOfWeek),
        ),
      ),
  );

  if (!queryTimeActivity) return [];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const todayIndex = new Date().getDay();

  //from the start to the current day, set the time as 0
  const timeActivity = daysOfWeek.slice(0, todayIndex + 1).map((day) => ({
    day,
    timeStudied: 0,
  }));

  //for the dates that our db returned, update the right time
  queryTimeActivity.forEach((activity) => {
    const day = daysOfWeek[new Date(activity.dateTime).getDay()];
    const dayIndex = timeActivity.findIndex((item) => item.day === day);
    if (dayIndex !== -1) {
      timeActivity[dayIndex].timeStudied = activity.timeStudied / 3600; //converts the time in seconds to hours
    }
  });

  return timeActivity;
}
