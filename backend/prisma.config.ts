import dotenv from "dotenv";
import path from "path";
import { defineConfig, env } from "@prisma/config";

// Load environment variables from root .env or local .env
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
