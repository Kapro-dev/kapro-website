---
sidebar_position: 2
---

# Release FSM

Each target in a Release progresses through a finite state machine (FSM). The phase is stored at `ReleaseTarget.status.phase`.

## Phase Progression

```
Pending
  |
Verification          -- optional: cosign signature verification
  |
HealthCheck           -- optional: MemberCluster health is fresh + Ready
  |
MetricsCheck          -- optional: Prometheus queries pass
  |
Soaking               -- optional: minimum time-since-entry has elapsed
  |
WaitingApproval       -- optional: Approval CR exists and is Approved
  |
Applying              -- Actuator.Apply() called; desiredVersion written
  |
Converged  |  Failed  |  RolledBack
```

Each optional gate is skipped when its policy is not configured. Phase handlers never silently fall back -- an unresolvable gate returns an error and the target stays in its current phase with a failure condition.

## Phases Explained

### Pending

The target has been selected by a stage but the planner has not yet activated it. This can be due to stage dependencies, `maxParallel` limits, or a suspended Release.

### Verification

Optional OCI signature verification using cosign. The gate checks that the artifact digest has a valid signature matching the configured identity or key. Targets skip this phase when no verification policy is configured.

### HealthCheck

Checks that the target MemberCluster's health is fresh and Ready. This ensures the target cluster is reachable and healthy before attempting delivery.

### MetricsCheck

Evaluates Prometheus queries configured in the stage gate policy. All queries must return passing values for the target to advance. Supports configurable intervals and failure thresholds.

### Soaking

A time-based gate. The target must remain in this phase for at least the configured `soakTime` duration before advancing. This gives operators time to observe the deployment before it is considered healthy.

### WaitingApproval

A human must approve the target. The operator sends a notification with signed approve/reject URLs. A human clicks approve, creating an `Approval` CR with the deterministic name `<release>-<target>`. The gate checks for this CR directly.

### Applying

The actuator applies the desired version to the target cluster. For the Flux actuator, this writes `MemberCluster.spec.desiredVersion` on the hub. The spoke cluster controller then reconciles the local delivery system.

### Terminal States

- **Converged**: The target cluster is running the desired version and the actuator has confirmed convergence.
- **Failed**: A gate failed and the failure policy does not allow retry or continuation.
- **RolledBack**: The target was rolled back to its previous version after a failure.

## Status Shape

| Field | Bound |
|-------|-------|
| `status.targets[]` | One row per selected cluster. Current state only. |
| `status.targets[i].gates[]` | One row per gate invocation. |
| `status.report` | Compact counter summary + pending approval list. |
| `status.auditTrail` | Immutable provenance, capped at 50 entries. |
| `status.pipelineProgress[]` | One row per pipeline node in the DAG. |
| `status.conditions` | Standard Kubernetes conditions. |
