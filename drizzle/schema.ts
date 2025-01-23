import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const User = pgTable("flowy_users", {
  id: uuid().defaultRandom().primaryKey(),
  name: text("name").notNull(),
  userName: text("user_name").unique().notNull(),
  password: text("password").notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
});
