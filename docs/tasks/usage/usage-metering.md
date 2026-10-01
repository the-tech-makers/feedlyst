# Task — Usage Metering

## Brief
Implementation contract for the Usage Metering module in M5.

## Status
PLANNED

## Objective
Record and aggregate billable widget usage.

## Scope
Immutable view events, tenant attribution, monthly aggregation, deduplication policy, dashboard usage summary.

## Dependencies
Public widget runtime and account model.

## Acceptance Criteria
- A widget load is attributed to the correct tenant and period without exposing internal event data.

## Tests
- Counting; retries; duplicate delivery; month rollover; aggregation correctness.

## Completion
Pending.
