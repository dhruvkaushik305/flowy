import db from "drizzle/db";
import safeCall from "../safeCall";
import bcrypt from "bcryptjs";
import * as schema from "drizzle/schema";
import { and, count, eq, gte, like, lt, sql } from "drizzle-orm";

export async function getUserId(userName: string) {
  const queryUserId = await safeCall(
    db
      .select({ userId: schema.User.id })
      .from(schema.User)
      .where(eq(schema.User.userName, userName)),
  );

  if (queryUserId === null) {
    return undefined; //signifies db issue
  }

  if (queryUserId.length === 0) {
    return null;
  }

  return queryUserId[0].userId;
}

export async function createNewUser(body: {
  name: string;
  userName: string;
  password: string;
}) {
  const hashedPassword = await bcrypt.hash(body.password, 10);

  const queryCreateNewUser = await safeCall(
    db
      .insert(schema.User)
      .values({
        name: body.name,
        userName: body.userName,
        password: hashedPassword,
      })
      .returning({ userId: schema.User.id }),
  );

  return queryCreateNewUser?.[0]?.userId ?? undefined;
}

export async function comparePasswords(userId: string, hashedPassword: string) {
  const queryUserPassword = await safeCall(
    db
      .select({ password: schema.User.password })
      .from(schema.User)
      .where(eq(schema.User.id, userId)),
  );

  if (!queryUserPassword || queryUserPassword.length === 0) {
    return undefined;
  }

  const passwordsMatched = await bcrypt.compare(
    hashedPassword,
    queryUserPassword[0].password,
  );

  return passwordsMatched;
}

export async function getName(userId: string) {
  const queryName = await safeCall(
    db
      .select({ name: schema.User.name })
      .from(schema.User)
      .where(eq(schema.User.id, userId)),
  );

  return queryName?.[0]?.name ?? null;
}

export async function searchUsers(initials: string | null) {
  if (!initials) return [];

  const querySearchUser = await safeCall(
    db
      .select({
        id: schema.User.id,
        name: schema.User.name,
        userName: schema.User.userName,
      })
      .from(schema.User)
      .where(like(schema.User.userName, `${initials}%`)),
  );

  return querySearchUser ?? [];
}

export async function getFollowingData(userId: string) {
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
  const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

  const queryFollowingData = await safeCall(
    db
      .select({
        id: schema.User.id,
        name: schema.User.name,
        userName: schema.User.userName,
        timeStudied: sql<number>`COALESCE(${schema.Time.timeStudied},0)`,
        totalTodos: count(schema.Todo.id),
        completedTodos: count(
          sql`CASE WHEN ${schema.Todo.completed} = true THEN 1 END`,
        ),
      })
      .from(schema.Follow)
      .innerJoin(schema.User, eq(schema.Follow.followingId, schema.User.id))
      .leftJoin(
        schema.Todo,
        and(
          eq(schema.Todo.userId, schema.Follow.followingId),
          gte(schema.Todo.createdAt, startOfDay),
          lt(schema.Todo.createdAt, endOfDay),
        ),
      )
      .leftJoin(
        schema.Time,
        and(
          eq(schema.Follow.followingId, schema.Time.userId),
          gte(schema.Time.createdAt, startOfDay),
          lt(schema.Time.createdAt, endOfDay),
        ),
      )
      .where(eq(schema.Follow.followerId, userId))
      .groupBy(
        schema.User.id,
        schema.User.name,
        schema.User.userName,
        schema.Time.timeStudied,
      ),
  );

  return queryFollowingData ?? [];
}
