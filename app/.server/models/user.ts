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

export async function getUserDetails(userId: string) {
  const queryUserDetails = await safeCall(
    db
      .select({
        name: schema.User.name,
        userName: schema.User.userName,
        joinedAt: schema.User.joinedAt,
      })
      .from(schema.User)
      .where(eq(schema.User.id, userId)),
  );

  if (!queryUserDetails || queryUserDetails.length === 0)
    return {
      name: "",
      userName: "",
      joinedAt: "",
    };

  //make the date a lil more presentable yk
  const userDetails = {
    ...queryUserDetails[0],
    joinedAt: queryUserDetails[0].joinedAt.toISOString().split("T")[0],
  };

  return userDetails;
}

export async function verifyUserId(userId: string) {
  const queryVerifyUser = await safeCall(
    db
      .select({ id: schema.User.id })
      .from(schema.User)
      .where(eq(schema.User.id, userId)),
  );

  return queryVerifyUser !== null && queryVerifyUser.length > 0;
}
