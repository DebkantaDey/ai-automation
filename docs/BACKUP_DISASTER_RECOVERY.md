# Production Backup & Disaster Recovery (DR) Strategy

This document specifies the data protection, continuous backup policies, SLA definitions, and disaster recovery procedures for the **AI Business Automation SaaS Platform**.

---

## 1. SLA Definitions

| Metric | Target SLA | Strategy |
| :--- | :--- | :--- |
| **Recovery Point Objective (RPO)** | **< 15 minutes** | Continuous Oplog archiving on MongoDB Atlas + Redis AOF persistence |
| **Recovery Time Objective (RTO)** | **< 30 minutes** | Infrastructure as Code (IaC) container redeployment + Point-in-Time Restore |
| **Availability SLA** | **99.95% uptime** | Multi-AZ deployment across 3 Availability Zones with automated health probes |

---

## 2. Backup Schedules & Retention Policies

### 2.1 MongoDB Atlas Continuous Cloud Backups
- **Continuous Backups**: Continuous operational log (oplog) archiving enabling granular point-in-time restore to any millisecond in the past 7 days.
- **Automated Daily Snapshots**: Taken every 24 hours at 02:00 UTC (Retained for 30 days).
- **Monthly Compliance Snapshots**: Taken on the 1st of every month (Retained for 365 days).
- **Cross-Region Snapshots**: Replicated to a secondary geographical cloud region for regional disaster resilience.

### 2.2 Redis Cache & Queue Persistence
- **AOF (Append Only File)**: Syncs every second (`appendfsync everysec`).
- **RDB Snapshots**: Daily backup of queue state and active distributed locks.

### 2.3 Object Storage (Documents & Files)
- **AWS S3 / Cloudflare R2**: Bucket versioning enabled.
- **Cross-Region Replication (CRR)**: Critical customer documents replicated across multi-region buckets.

---

## 3. Disaster Recovery (DR) Runbook

### Scenario A: Accidental Data Corruption / Tenant Recovery
1. Open **MongoDB Atlas Backup** portal.
2. Select **Restore to a Point in Time**.
3. Choose the exact timestamp prior to corruption.
4. Restore to a dedicated staging cluster, extract the required tenant documents, and replay into production.

### Scenario B: Complete Cloud Region Outage
1. Point global DNS (Cloudflare) to the secondary standby region.
2. Spin up API and Worker container tasks in secondary region via GitHub Actions / Terraform.
3. Promote the cross-region replica MongoDB cluster to Primary.
4. Verify `/api/v1/admin/health` diagnostics.
