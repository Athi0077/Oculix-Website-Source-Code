import { db } from "@backend/services/platform";
import * as schema from "@backend/models/schema";

export function getDb() {
  const database = db();
  if (!database) {
    throw new Error("Database is unavailable.");
  }
  return database;
}

export { schema };
