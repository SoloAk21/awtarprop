# AwtarProp — Property & Land Marketplace in Ethiopia

AwtarProp is a production-grade Telegram Mini App and web platform connecting property owners, brokers, agents, agencies, developers, buyers, and renters in Ethiopia.

## Architecture Architecture

- `shared/` — Common TypeScript types, validation schemas, domain constants, and utilities.
- `backend/` — Express REST API with TypeScript, Prisma, PostgreSQL, and security middleware.
- `frontend/` — React (Vite) + Tailwind CSS + Telegram Mini App SDK.
- `bot/` — Telegraf-based Telegram Bot integration service.

## Getting Started

1. Copy `.env.example` to `.env` in the root directory and configure environment variables.
2. Install dependencies across workspaces:
   ```bash
   npm install
   ```
