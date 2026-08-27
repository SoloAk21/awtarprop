import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .default("5000")
    .transform((val) => parseInt(val, 10)),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().default("awtarprop_dev_secret_key_change_in_prod"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  GEMINI_API_KEY: z.string().optional(),
  CHAPA_SECRET_KEY: z
    .string()
    .default("CHASECK_TEST-DevMockChapaSecretKey12345"),
  CHAPA_WEBHOOK_SECRET: z
    .string()
    .default("awtarprop_chapa_webhook_secret_key"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
