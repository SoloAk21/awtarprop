import http from "http";
import { config } from "../config/env";

export function startHealthCheckServer() {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("AwtarProp Telegram Bot status: OK");
  });

  server.listen(config.port, "0.0.0.0", () => {
    console.log(`🌐 Health check HTTP server active on port ${config.port}`);
  });

  return server;
}
