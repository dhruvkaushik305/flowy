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

export async function createTodo(userId: string, newTodo: string) {
  await safeCall(
    db.insert(schema.Todo).values({
      title: newTodo,
      userId,
    }),
  );
}

export async function toggleTodo(todoId: string, newState: boolean) {
  await safeCall(
    db
      .update(schema.Todo)
      .set({ completed: newState })
      .where(eq(schema.Todo.id, todoId)),
  );
}

export async function updateTodo(todoId: string, newTitle: string) {
  await safeCall(
    db
      .update(schema.Todo)
      .set({ title: newTitle })
      .where(eq(schema.Todo.id, todoId)),
  );
}

export async function deleteTodo(todoId: string) {
  await safeCall(db.delete(schema.Todo).where(eq(schema.Todo.id, todoId)));
}
