import bcrypt from "bcryptjs";
import * as schema from "drizzle/schema";
import db from "./db";

async function deleteExistingData() {
  try {
    await db.delete(schema.Time);
    await db.delete(schema.Todo);
    await db.delete(schema.Follow);
    await db.delete(schema.User);
  } catch (e) {
    console.error("The following error occurred while clearing the database");
  }
}

async function main() {
  try {
    const hashedPassword = await bcrypt.hash("secret", 10);

    const querySeedUser = await db
      .insert(schema.User)
      .values([
        {
          name: "Alice",
          userName: "example_alice",
          password: hashedPassword,
        },
        {
          name: "Bob",
          userName: "example_bob",
          password: hashedPassword,
        },
        {
          name: "Charlie",
          userName: "example_charlie",
          password: hashedPassword,
        },
      ])
      .returning({ id: schema.User.id });

    await db.insert(schema.Todo).values([
      {
        title: "Todo 1.0",
        completed: false,
        userId: querySeedUser[0].id,
      },
      {
        title: "Todo 1.1",
        completed: false,
        userId: querySeedUser[0].id,
      },
      {
        title: "Todo 2.0",
        completed: false,
        userId: querySeedUser[1].id,
      },
      {
        title: "Todo 2.1",
        completed: false,
        userId: querySeedUser[1].id,
      },
      {
        title: "Todo 3.0",
        completed: false,
        userId: querySeedUser[2].id,
      },
      {
        title: "Todo 3.1",
        completed: false,
        userId: querySeedUser[2].id,
      },
    ]);

    await db.insert(schema.Time).values([
      {
        timeStudied: 3 * 3600,
        userId: querySeedUser[0].id,
      },
      {
        timeStudied: 2.5 * 3600,
        userId: querySeedUser[1].id,
      },
      {
        timeStudied: 4.5 * 3600,
        userId: querySeedUser[2].id,
      },
    ]);

    await db.insert(schema.Follow).values([
      {
        followerId: querySeedUser[0].id,
        followingId: querySeedUser[1].id,
      },
      {
        followerId: querySeedUser[1].id,
        followingId: querySeedUser[2].id,
      },
      {
        followerId: querySeedUser[2].id,
        followingId: querySeedUser[0].id,
      },
    ]);
  } catch (e) {
    console.error("The following error occurred while seeding the database", e);
  }
}

await deleteExistingData();
console.log("Database has been cleared");

await main();
console.log("Database has been seeded");
