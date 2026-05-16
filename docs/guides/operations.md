---
sidebar_position: 2
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# Operations

<ConceptDiagram id="operations" />

Kapro is operated like a Kubernetes controller: watch objects, status,
conditions, events, logs, and metrics.

The most useful operational question is:

```text
Which PromotionTarget is blocked, and what evidence explains it?
```

## First Commands

Start here when a PromotionRun is not moving:

```bash
kubectl get PromotionRuns,promotiontargets,fleetclusters
kubectl describe PromotionRun <PromotionRun>
kubectl get promotiontargets -l kapro.io/promotionrun=<PromotionRun> -o wide
kubectl -n kapro-system logs deploy/kapro-operator --since=30m
```

## Read the Phase

| Target phase | What to check |
|---|---|
| `Pending` | Stage dependency, concurrency limit, suspended PromotionRun, planner deferral. |
| `Verification` | Artifact digest, signature policy, verification evidence. |
| `HealthCheck` | FleetCluster heartbeat and workload health. |
| `MetricsCheck` | Prometheus query, threshold, missing samples, unreachable metrics backend. |
| `Soaking` | Soak duration. This can be normal. |
| `WaitingApproval` | Approval object exists, approver is correct, approval was not rejected. |
| `Applying` | Backend adapter logs and backend convergence, such as Flux or Argo CD readiness. |
| `Failed` | Gate evidence, failure policy, timeout, backend error. |

## Metrics

The operator exposes Prometheus metrics on `:8080`.

| Metric | What it tells you |
|---|---|
| `kapro_controller_reconciles_total` | Reconcile volume and errors. |
| `kapro_controller_reconcile_duration_seconds` | Reconcile latency. |
| `kapro_sync_transitions_total` | Target phase transitions. |
| `kapro_gate_evaluations_total` | Gate pass, fail, running, and inconclusive rates. |
| `kapro_stage_duration_seconds` | Stage duration by PromotionPlan. |
| `kapro_release_active_total` | Number of non-terminal PromotionRuns. |
| `kapro_plugin_probe_ready` | Plugin readiness. |

## Alerts

Good first alerts:

| Alert | Signal |
|---|---|
| PromotionRun stuck | A PromotionRun remains non-terminal longer than expected. |
| Gate failure rate high | Gate failures exceed a threshold. |
| Plugin not ready | Plugin probe readiness drops. |
| PromotionTrigger blocked | Trigger reconciliation is failing. |
| Reconcile errors | Controller errors stay elevated. |

## Scaling Knobs

Start simple:

- Keep leader election enabled.
- Start with 5 concurrent reconciles for smaller hubs.
- Keep plugin timeouts short.
- Use gate intervals of at least 30 seconds unless you have a reason to poll faster.
- Increase stage `maxParallel` only after metrics and backend capacity look healthy.

## Sharding

Use sharding when one hub operator should not process every PromotionRun.

Set `KAPRO_SHARD` on an operator replica and label objects with
`kapro.io/shard`.

Common shard boundaries:

- environment: `dev`, `stage`, `prod`
- geography: `eu`, `us`, `apac`
- tenant or business unit

## Rollback

Do not edit status to roll back.

Create a new PromotionRun pinned to the last known good version:

1. Find the previous version from target status or your PromotionRun record.
2. Create a new `PromotionRun` for that version.
3. Use conservative `maxParallel`.
4. Keep approval gates for production.
5. Keep the failed PromotionRun for audit.

Rollback is another controlled promotion, not a manual status mutation.
