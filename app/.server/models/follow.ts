import db from "drizzle/db";
import safeCall from "../safeCall";
import * as schema from "drizzle/schema";
import { and, count, eq, gte, lt, sql } from "drizzle-orm";

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

export async function getFollowersList(userId: string) {
  const queryFollowersList = await safeCall(
    db
      .select({
        id: schema.User.id,
        name: schema.User.name,
        userName: schema.User.userName,
      })
      .from(schema.User)
      .leftJoin(schema.Follow, eq(schema.User.id, schema.Follow.followerId))
      .where(eq(schema.Follow.followingId, userId)),
  );

  return queryFollowersList ?? [];
}

export async function getFollowingList(userId: string) {
  const queryFollowingList = await safeCall(
    db
      .select({
        id: schema.User.id,
        name: schema.User.name,
        userName: schema.User.userName,
      })
      .from(schema.User)
      .leftJoin(schema.Follow, eq(schema.User.id, schema.Follow.followingId))
      .where(eq(schema.Follow.followerId, userId)),
  );

  return queryFollowingList ?? [];
}

export async function getFollowingCount(userId: string) {
  const queryFollowingCount = await safeCall(
    db
      .select({ followingCount: count(schema.Follow.followingId) })
      .from(schema.Follow)
      .where(eq(schema.Follow.followerId, userId)),
  );

  return queryFollowingCount?.[0]?.followingCount ?? 0;
}

export async function getFollowersCount(userId: string) {
  const queryFollowersCount = await safeCall(
    db
      .select({ followerCount: count(schema.Follow.followerId) })
      .from(schema.Follow)
      .where(eq(schema.Follow.followingId, userId)),
  );

  return queryFollowersCount?.[0]?.followerCount ?? 0;
}

export async function followUser(followerId: string, followingId: string) {
  await safeCall(
    db.insert(schema.Follow).values({
      followerId,
      followingId,
    }),
  );
}

export async function unfollowUser(currentUserId: string, userId: string) {
  await safeCall(
    db
      .delete(schema.Follow)
      .where(
        and(
          eq(schema.Follow.followerId, currentUserId),
          eq(schema.Follow.followingId, userId),
        ),
      ),
  );
}

export async function checkFollow(currentUserId: string, userId: string) {
  const queryCheckFollow = await safeCall(
    db
      .select({ currentUserId: schema.Follow.followerId })
      .from(schema.Follow)
      .where(
        and(
          eq(schema.Follow.followerId, currentUserId),
          eq(schema.Follow.followingId, userId),
        ),
      ),
  );

  return queryCheckFollow !== null && queryCheckFollow.length > 0;
}
