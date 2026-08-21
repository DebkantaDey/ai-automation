# Multi-Cloud Production Deployment Guide

This guide outlines the production deployment topology for the **AI Business Automation SaaS Platform**.

---

## 1. Production Topology Architecture

```text
[ Global DNS / Cloudflare WAF ]
         │
         ├── Next.js 16 Web App ───────► Vercel Edge Network
         │
         └── API & Webhooks (/api/v1) ──► AWS ECS Fargate / Railway / Render
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               ▼                               ▼                               ▼
       MongoDB Atlas M10+              Redis Enterprise Cloud          AWS S3 / Cloudflare R2
   (Multi-AZ Replica Set)            (BullMQ & Caching Cluster)          (Encrypted Storage)
               ▲                               ▲
               │                               │
   Background Workers (BullMQ) ────────────────┘
   (Autonomous Scaling Container Tasks)
```

---

## 2. Infrastructure Components

### 2.1 Frontend (Next.js 16 App Router)
- **Host**: Vercel / Cloudflare Pages / AWS Amplify
- **Config**:
  - `NEXT_PUBLIC_API_URL`: `https://api.yourdomain.com/api/v1`
  - Build command: `npm run build`

### 2.2 Backend REST API & SSE Gateways (NestJS)
- **Host**: AWS ECS Fargate / Render / Railway / DigitalOcean App Platform
- **Stateless Instances**: Auto-scaling across CPU/Memory utilization thresholds.
- **Port**: 4000
- **Health Check Path**: `GET /api/v1/health`

### 2.3 Background Queue Consumers & AI Workers
- **Command**: `node dist/main.js` (Worker Mode)
- **Queues**: `workflowQueue`, `aiQueue`, `webhookQueue`, `emailQueue`, `notificationQueue`, `fileProcessingQueue`, `billingQueue`.
- **Scaling**: Independent horizontal auto-scaling based on BullMQ backlog queue depth.

### 2.4 Database & Cache
- **Primary Database**: MongoDB Atlas (Tier M10+ recommended for Multi-AZ automatic failover).
- **In-Memory Cache & Queues**: Redis Cloud / AWS ElastiCache for Redis (Engine 7.x, Multi-AZ).

---

## 3. Environment Variables & Secret Management

Always inject secrets via your cloud secret manager (AWS Secrets Manager, Doppler, or Railway Secrets). **Never bake secrets into container images.**

| Secret Variable | Description | Example / Format |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment | `production` |
| `MONGODB_URI` | MongoDB Atlas replica URI | `mongodb+srv://...` |
| `REDIS_HOST` | Managed Redis hostname | `redis-cluster.prod.internal` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | 256-bit Access Token secret | `min-32-chars-long-secret` |
| `JWT_REFRESH_SECRET` | 256-bit Refresh Token secret | `min-32-chars-long-secret` |
| `ENCRYPTION_KEY` | AES-256-GCM Integration Key | `64 hex characters` |
| `OPENAI_API_KEY` | OpenAI API Key | `sk-proj-...` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIza...` |
| `ANTHROPIC_API_KEY` | Anthropic Claude API Key | `sk-ant-...` |
| `STRIPE_SECRET_KEY` | Stripe Production Key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret | `whsec_...` |
