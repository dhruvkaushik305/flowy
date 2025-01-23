import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import invariant from "tiny-invariant";

invariant(process.env.DATABASE_URL, "Database URL is required");

export default defineConfig({
  out: "./drizzle",
  schema: "./drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
