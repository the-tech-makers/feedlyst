# Architecture — System Overview

## Brief
Feedlyst should be implemented as a modular SaaS platform with clear boundaries between dashboard, integration services, widget configuration, public delivery, and asynchronous workers.

## Logical Components
1. **Web App** — authentication, dashboard, editor, billing UI.
2. **API** — tenant-aware application APIs.
3. **Integration Adapters** — provider-specific OAuth/API logic.
4. **Sync Workers** — scheduled and event-driven synchronization.
5. **Domain Store** — PostgreSQL or equivalent relational database.
6. **Cache/Queue** — Redis-compatible infrastructure.
7. **Widget Delivery API** — public, highly cacheable read path.
8. **CDN** — static runtime assets and cacheable widget responses.
9. **Object Storage** — media/assets where required.
10. **Observability** — logs, metrics, traces, alerts.

## Data Flow
Provider → Connection → Source → Sync Job → Normalized Data → Widget → Publication → CDN/Runtime → Visitor.

## Critical Boundary
The public widget runtime must never require access to a user's OAuth token.

## Scalability Principle
Dashboard traffic and widget visitor traffic are separate workloads and must be independently scalable.
