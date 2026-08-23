import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0", // Binds Vite to both IPv4 (127.0.0.1) and IPv6 (::1)
    port: 5173,
    strictPort: true, // Prevents Vite from silently switching ports
    allowedHosts: true, // Allows ngrok tunnel domains
  },
});
