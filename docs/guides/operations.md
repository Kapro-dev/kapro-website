---
sidebar_position: 2
---

# Operations

Kapro is operated like a Kubernetes controller: watch objects, status,
conditions, events, logs, and metrics.

The most useful operational question is:

```text
Which release target is blocked, and what evidence explains it?
```

## First Commands

Start here when a release is not moving:

```bash
kubectl get releases,releasetargets,memberclusters
kubectl describe release <release>
kubectl get releasetargets -l kapro.io/release=<release> -o wide
kubectl -n kapro-system logs deploy/kapro-operator --since=30m
```

## Read the Phase

| Target phase | What to check |
|---|---|
| `Pending` | Stage dependency, concurrency limit, suspended release, planner deferral. |
| `Verification` | Artifact digest, signature policy, verification evidence. |
| `HealthCheck` | MemberCluster heartbeat and workload health. |
| `MetricsCheck` | Prometheus query, threshold, missing samples, unreachable metrics backend. |
| `Soaking` | Soak duration. This can be normal. |
| `WaitingApproval` | Approval object exists, approver is correct, approval was not rejected. |
| `Applying` | Actuator logs and backend convergence, such as Flux readiness. |
| `Failed` | Gate evidence, failure policy, timeout, backend error. |

## Metrics

The operator exposes Prometheus metrics on `:8080`.

| Metric | What it tells you |
|---|---|
| `kapro_controller_reconciles_total` | Reconcile volume and errors. |
| `kapro_controller_reconcile_duration_seconds` | Reconcile latency. |
| `kapro_sync_transitions_total` | Target phase transitions. |
| `kapro_gate_evaluations_total` | Gate pass, fail, running, and inconclusive rates. |
| `kapro_stage_duration_seconds` | Stage duration by pipeline. |
| `kapro_release_active_total` | Number of non-terminal releases. |
| `kapro_plugin_probe_ready` | Plugin readiness. |

## Alerts

Good first alerts:

| Alert | Signal |
|---|---|
| Release stuck | A release remains non-terminal longer than expected. |
| Gate failure rate high | Gate failures exceed a threshold. |
| Plugin not ready | Plugin probe readiness drops. |
| ReleaseTrigger blocked | Trigger reconciliation is failing. |
| Reconcile errors | Controller errors stay elevated. |

## Scaling Knobs

Start simple:

- Keep leader election enabled.
- Start with 5 concurrent reconciles for smaller hubs.
- Keep plugin timeouts short.
- Use gate intervals of at least 30 seconds unless you have a reason to poll faster.
- Increase stage `maxParallel` only after metrics and backend capacity look healthy.

## Sharding

Use sharding when one hub operator should not process every release.

Set `KAPRO_SHARD` on an operator replica and label objects with
`kapro.io/shard`.

Common shard boundaries:

- environment: `dev`, `stage`, `prod`
- geography: `eu`, `us`, `apac`
- tenant or business unit

## Rollback

Do not edit status to roll back.

Create a new release pinned to the last known good version:

1. Find the previous version from target status or your release record.
2. Create a new `Release` for that version.
3. Use conservative `maxParallel`.
4. Keep approval gates for production.
5. Keep the failed release for audit.

Rollback is another controlled promotion, not a manual status mutation.
