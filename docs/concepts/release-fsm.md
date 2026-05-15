---
sidebar_position: 2
---

# Release FSM

Each selected cluster becomes a `ReleaseTarget`. Every target moves through the same finite state machine, but optional gates are skipped when no policy is configured.

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node"><strong>Pending</strong><span>Selected but not activated yet.</span></div>
    <div class="kapro-node"><strong>Verify</strong><span>Check artifact signature and provenance.</span></div>
    <div class="kapro-node"><strong>Evaluate</strong><span>Health, metrics, soak, and approval gates.</span></div>
    <div class="kapro-node"><strong>Apply</strong><span>Ask the actuator to converge the backend.</span></div>
  </div>
  <div class="kapro-grid kapro-gap-top">
    <div class="kapro-card kapro-good"><strong>Converged</strong><span>The target is running the desired version.</span></div>
    <div class="kapro-card kapro-bad"><strong>Failed</strong><span>A gate or apply step failed and policy halted progression.</span></div>
    <div class="kapro-card"><strong>RolledBack</strong><span>The target returned to a previous version after failure policy requested rollback.</span></div>
  </div>
</div>

## Phase Progression

| Phase | What happens |
|---|---|
| `Pending` | The target is selected, but dependencies, concurrency, or suspension keep it inactive. |
| `Verification` | Optional OCI signature/provenance checks run. |
| `HealthCheck` | The target cluster must be reachable and ready. |
| `MetricsCheck` | Prometheus or custom metrics must pass. |
| `Soaking` | The target waits for a minimum observation window. |
| `WaitingApproval` | A human approval CR must exist and be approved. |
| `Applying` | The actuator writes the desired version and waits for convergence. |
| `Converged` | The target reports the desired version. |
| `Failed` | The target stops because policy did not allow continuation. |
| `RolledBack` | The target was returned to a previous version. |

## Why This Matters

Kapro keeps target progress explicit. A stuck release should answer:

- Which cluster is blocked?
- Which phase is it in?
- Which gate produced the evidence?
- Did a human approve or reject it?
- Did the backend converge?

That is the difference between “a CI job failed somewhere” and an auditable fleet promotion record.

## Status Shape

| Field | Meaning |
|-------|---------|
| `status.targets[]` | One row per selected cluster. |
| `status.targets[i].gates[]` | Gate evidence for that target. |
| `status.report` | Compact release summary and pending approvals. |
| `status.auditTrail` | Immutable provenance entries, capped for size. |
| `status.pipelineProgress[]` | Pipeline DAG progress. |
| `status.conditions` | Standard Kubernetes conditions. |
