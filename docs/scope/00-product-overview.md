# Scope 00 — Product Overview

## Brief
Feedlyst is a SaaS platform that lets users connect external data sources, configure reusable widgets, and embed those widgets on customer websites.

## Primary User
Website owners, agencies, freelancers, marketers, and developers who need external content displayed on one or more websites without building each integration themselves.

## Core Journey
Sign up → create/select project → connect source → select data → configure widget → preview → publish → install → monitor.

## Core Concepts
- **Account:** authenticated tenant owner.
- **Project:** website/client workspace.
- **Connection:** authenticated provider access.
- **Source:** selected provider entity such as a Google Business location.
- **Widget:** reusable presentation instance.
- **Publication:** active delivery configuration.
- **View:** successful widget load counted against usage limits.

## Product Principles
- Integration-agnostic core.
- Provider adapters isolated from widget rendering.
- Configuration-first widget architecture.
- Fast public delivery.
- Safe multi-tenancy.
- Clear upgrade paths without blocking basic experimentation.

## Initial Scope
MVP starts with:
1. Authentication and account management.
2. Projects.
3. Google Reviews integration.
4. Normalized review data.
5. Review widget templates and customization.
6. Publish/embed flow.
7. Widget delivery API/CDN.
8. Basic usage metering.
9. Operational monitoring.

## Deferred
Instagram and additional providers, advanced analytics, collaboration, billing automation, template marketplace, AI features, and enterprise controls are subsequent phases.
