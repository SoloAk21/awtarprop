import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config();

export const config = {
  token: process.env.TELEGRAM_BOT_TOKEN || "",
  webAppUrl: process.env.TELEGRAM_WEBAPP_URL ?? "http://localhost:5173",
  apiUrl: process.env.VITE_API_URL ?? "http://localhost:5000/api/v1",
  channelUsername: (process.env.TELEGRAM_CHANNEL_USERNAME ?? "").trim(),
  port: Number(process.env.PORT || 3000),
};

if (!config.token || config.token.includes("your_telegram_bot_token")) {
  console.warn(
    "⚠️ TELEGRAM_BOT_TOKEN is missing or invalid. Bot will not start.",
  );
  process.exit(0);
}
