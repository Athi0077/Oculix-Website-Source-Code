import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "../backend/src/models/migrations",
  schema: "../backend/src/models/schema.ts",
  dialect: "sqlite",
});
