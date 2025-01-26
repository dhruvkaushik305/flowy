import db from "drizzle/db";
import safeCall from "../safeCall";
import bcrypt from "bcryptjs";
import * as schema from "drizzle/schema";
import { eq } from "drizzle-orm";

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
