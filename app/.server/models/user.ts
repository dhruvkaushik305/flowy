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
      .where(eq(schema.User.userName, userName))
  );

  return queryUserId?.[0]?.userId ?? null;
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
      .returning({ userId: schema.User.id })
  );

  return queryCreateNewUser?.[0]?.userId ?? null;
}
