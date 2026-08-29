import { bot } from "./bot";
import { config } from "./config/env";
import { registerBotHandlers } from "./handlers/bot.handlers";
import { startHealthCheckServer } from "./utils/health-server";

// 1. Start HTTP Server for Render / Platform Health Checks
const server = startHealthCheckServer();

// 2. Register Commands and Actions
registerBotHandlers();

// 3. Launch Bot with Auto-Retry
const launchBotWithRetry = async (retryCount = 0) => {
  try {
    await bot.launch();
    console.log("🤖 AwtarProp Bot online and processing updates.");

    try {
      await Promise.all([
        bot.telegram.setMyCommands([
          {
            command: "start",
            description: "Start / Launch AwtarProp Marketplace",
          },
          { command: "language", description: "Change Language / ቋንቋ ይምረጡ" },
          { command: "help", description: "Get Help & Guide" },
        ]),
        bot.telegram.setChatMenuButton({
          menuButton: {
            type: "web_app",
            text: "Open AwtarProp",
            web_app: { url: config.webAppUrl },
          },
        }),
      ]);
      console.log(
        `✅ Synced commands & Chat Menu Button to target URL: ${config.webAppUrl}`,
      );
    } catch (syncErr: any) {
      console.warn("⚠️ Chat Menu Button sync warning:", syncErr?.message);
    }
  } catch (err: any) {
    console.error(
      `Network error starting bot (Attempt ${retryCount + 1}):`,
      err?.message,
    );
    if (retryCount < 10) {
      setTimeout(() => launchBotWithRetry(retryCount + 1), 5000);
    } else {
      process.exit(1);
    }
  }
};

launchBotWithRetry();

// Graceful Shutdown
const stop = (signal: string) => {
  console.log(`Received ${signal}. Gracefully stopping bot...`);
  server.close();
  bot.stop(signal);
};

process.once("SIGINT", () => stop("SIGINT"));
process.once("SIGTERM", () => stop("SIGTERM"));
