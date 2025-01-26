import db from "drizzle/db";
import safeCall from "../safeCall";
import * as schema from "drizzle/schema";
import { eq } from "drizzle-orm";

export async function getTodos(userId: string) {
  const queryTodos = await safeCall(
    db
      .select({
        id: schema.Todo.id,
        title: schema.Todo.title,
        completed: schema.Todo.completed,
      })
      .from(schema.Todo)
      .where(eq(schema.Todo.userId, userId)),
  );

  return queryTodos ?? [];
}
