import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import invariant from "tiny-invariant";

invariant(process.env.DATABASE_URL, "Database URL is required");

const db = drizzle(process.env.DATABASE_URL);

export default db;
