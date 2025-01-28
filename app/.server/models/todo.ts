import db from "drizzle/db";
import safeCall from "../safeCall";
import * as schema from "drizzle/schema";
import { and, count, eq, gte, lt, sql } from "drizzle-orm";

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

export async function getTodoActivity(userId: string) {
  const startOfMonth = new Date(new Date().setDate(1));
  startOfMonth.setHours(0, 0, 0, 0);
  const today = new Date();

  const queryTodoActivity = await safeCall(
    db
      .select({
        createdAt: schema.Todo.createdAt,
        completedTodo: count(
          sql`CASE WHEN ${schema.Todo.completed} = true THEN 1 END`,
        ),
      })
      .from(schema.Todo)
      .where(
        and(
          eq(schema.Todo.userId, userId),
          gte(schema.Todo.createdAt, startOfMonth),
          lt(schema.Todo.createdAt, today),
        ),
      ),
  );

  if (!queryTodoActivity) return [];

  const dateMap = new Map<string, number>();
  //for the dates that are not in the query, add them manually until the current date
  for (let d = new Date(startOfMonth); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];

    dateMap.set(dateStr, 0);
  }

  //convert the ISO strings in the db to simple date and update the task count
  queryTodoActivity.forEach((activity) => {
    const date = new Date(activity.createdAt).toISOString().split("T")[0];
    dateMap.set(date, activity.completedTodo);
  });

  const todoActivity = Array.from(dateMap, ([date, count]) => {
    let level = 0;
    if (count >= 5) {
      level = 3;
    } else if (count >= 3) {
      level = 2;
    } else if (count >= 1) {
      level = 1;
    }

    return {
      date,
      count,
      level,
    };
  });
  console.log("todo activity", todoActivity);
  return todoActivity;
}
