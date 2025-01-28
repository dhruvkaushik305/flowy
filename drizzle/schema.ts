import {
  boolean,
  integer,
  pgTable,
  text,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const User = pgTable("flowy_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  userName: text("user_name").unique().notNull(),
  password: text("password").notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const Todo = pgTable("flowy_todo", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: uuid("user_id")
    .references(() => User.id)
    .notNull(),
});

export const Time = pgTable("flowy_time", {
  id: uuid("id").defaultRandom().primaryKey(),
  timeStudied: integer("time_studied").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: uuid("user_id")
    .references(() => User.id)
    .notNull(),
});

export const Follow = pgTable(
  "flowy_follow",
  {
    followerId: uuid("follower_id")
      .references(() => User.id)
      .notNull(),
    followingId: uuid("following_id")
      .references(() => User.id)
      .notNull(),
  },
  (table) => {
    return [
      {
        pk: primaryKey({ columns: [table.followerId, table.followingId] }),
      },
    ];
  },
);
