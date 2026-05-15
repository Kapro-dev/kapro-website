---
sidebar_position: 2
---

# Promotion Lifecycle

A `Release` is the whole rollout. A `ReleaseTarget` is one selected cluster
inside that rollout.

Each target moves through the same lifecycle. Some phases are skipped when the
pipeline does not configure that gate.

## One Target, Step by Step

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node">
      <strong>Pending</strong>
      <span>The cluster is selected but not allowed to start yet.</span>
    </div>
    <div class="kapro-node">
      <strong>Check</strong>
      <span>Artifact verification, cluster health, metrics, soak, and approval gates run.</span>
    </div>
    <div class="kapro-node">
      <strong>Apply</strong>
      <span>The actuator asks the delivery backend to use the selected version.</span>
    </div>
    <div class="kapro-node">
      <strong>Converge</strong>
      <span>The target reports that the desired version is running.</span>
    </div>
  </div>
</div>

The important thing is that Kapro stores the state in Kubernetes. If the
operator restarts, the release continues from status.

## Target Phases

| Phase | Meaning | Common blocker |
|---|---|---|
| `Pending` | The target exists but is not active yet. | Stage dependency, `maxParallel`, suspended release. |
| `Verification` | Kapro checks artifact identity or signature policy. | Missing digest, invalid signature, untrusted key. |
| `HealthCheck` | The target cluster must be reachable and healthy. | Stale heartbeat, unhealthy workloads. |
| `MetricsCheck` | Telemetry must meet the gate policy. | Prometheus query fails, SLO burn too high. |
| `Soaking` | The target waits for observation time. | Normal delay. |
| `WaitingApproval` | A human approval is required. | No `Approval` object yet, or rejected approval. |
| `Applying` | The actuator has asked the backend to converge. | Flux/Argo/Helm has not become ready. |
| `Converged` | The target is running the desired version. | Terminal success. |
| `Failed` | Policy stopped this target. | Failed gate, timeout, apply error. |
| `RolledBack` | A rollback action returned the target to a previous version. | Terminal rollback outcome. |

## How Stages Control Targets

Stages do not directly run workloads. They control when targets are allowed to
start.

<div class="kapro-diagram">
  <div class="kapro-lanes">
    <div class="kapro-lane">
      <div><strong>canary</strong><span>maxParallel: all</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">canary-1</span><span class="kapro-cluster active">canary-2</span></div>
      <div class="kapro-status">converged</div>
    </div>
    <div class="kapro-lane">
      <div><strong>production</strong><span>maxParallel: 1</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">prod-1</span><span class="kapro-cluster">prod-2</span><span class="kapro-cluster">prod-3</span></div>
      <div class="kapro-status">one at a time</div>
    </div>
  </div>
</div>

In that example, production waits for canary. Then Kapro promotes production
clusters one at a time.

## Reading a Stuck Release

When a release is stuck, read it like a table:

```bash
kubectl get releases,releasetargets
kubectl describe release checkout-v1-8-2
kubectl get releasetargets -l kapro.io/release=checkout-v1-8-2 -o wide
```

Ask three questions:

1. Which target is blocked?
2. Which phase is it in?
3. What evidence or condition explains the phase?

Examples:

| What you see | What it means |
|---|---|
| `prod-eu WaitingApproval` | A human has not approved production yet. |
| `canary MetricsCheck` | The metrics gate is still evaluating or failed. |
| `prod-us Applying` | Kapro allowed the target; the delivery backend has not converged. |
| `edge-a Pending` | The stage dependency or concurrency limit has not allowed it to start. |

## What Gets Recorded

Kapro records enough status to answer why a release moved or stopped:

| Status field | What it explains |
|---|---|
| `status.targets[]` | Per-cluster phase and selected version. |
| `status.targets[].gates[]` | Gate result and evidence for that target. |
| `status.pipelineProgress[]` | Stage and pipeline progress. |
| `status.report` | Compact release summary. |
| `status.auditTrail` | Important promotion decisions over time. |
| `status.conditions` | Kubernetes-style readiness and stalled conditions. |
