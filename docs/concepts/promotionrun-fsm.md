---
sidebar_position: 2
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# Promotion Lifecycle

<ConceptDiagram id="promotionrun-fsm" />

A `PromotionRun` is the whole rollout. A `PromotionTarget` is one selected cluster
inside that rollout.

<div class="kapro-lesson">
  <img src="/img/logo.png" alt="Kapro mascot" />
  <div>
    <strong>The lifecycle is Kapro's checklist.</strong>
    <p>Kapro does not jump straight from "new version exists" to "production changed." Each target must pass through visible states so people can see exactly where it is waiting.</p>
  </div>
</div>

Each target moves through the same lifecycle. Some phases are skipped when the
PromotionPlan does not configure that gate.

## One Target, Step by Step

<div class="kapro-state-machine">
  <div class="kapro-state-row">
    <div class="kapro-state"><strong>Pending</strong><span>Selected but blocked by order or parallelism.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-state"><strong>Verification</strong><span>Artifact and policy checks.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-state"><strong>HealthCheck</strong><span>Cluster and workload health.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-state"><strong>MetricsCheck</strong><span>SLO and telemetry checks.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-state waiting"><strong>WaitingApproval</strong><span>Human gate if required.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-state"><strong>Applying</strong><span>Backend receives the selected version.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-state good"><strong>Converged</strong><span>Healthy on the desired version.</span></div>
  </div>
</div>

The important thing is that Kapro stores the state in Kubernetes. If the
operator restarts, the PromotionRun continues from status.

Failures leave a trail too:

<div class="kapro-state-machine">
  <div class="kapro-state-row">
    <div class="kapro-state stop"><strong>Failed</strong><span>Gate, health, timeout, or apply failure stopped the target.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-state waiting"><strong>Rollback decision</strong><span>Policy or operator decides whether to roll back.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-state good"><strong>RolledBack</strong><span>Target returned to a known previous version.</span></div>
  </div>
</div>

## Target Phases

| Phase | Meaning | Common blocker |
|---|---|---|
| `Pending` | The target exists but is not active yet. | Stage dependency, `maxParallel`, suspended PromotionRun. |
| `Verification` | Kapro checks artifact identity or signature policy. | Missing digest, invalid signature, untrusted key. |
| `HealthCheck` | The target cluster must be reachable and healthy. | Stale heartbeat, unhealthy workloads. |
| `MetricsCheck` | Telemetry must meet the gate policy. | Prometheus query fails, SLO burn too high. |
| `Soaking` | The target waits for observation time. | Normal delay. |
| `WaitingApproval` | A human approval is required. | No `Approval` object yet, or rejected approval. |
| `Applying` | The backend adapter has asked the backend to converge. | Flux/Argo/Helm has not become ready. |
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

## Reading a Stuck PromotionRun

When a PromotionRun is stuck, read it like a table:

```bash
kubectl get PromotionRuns,promotiontargets
kubectl describe PromotionRun checkout-v1-8-2
kubectl get promotiontargets -l kapro.io/promotionrun=checkout-v1-8-2 -o wide
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

Kapro records enough status to answer why a PromotionRun moved or stopped:

| Status field | What it explains |
|---|---|
| `status.targets[]` | Per-cluster phase and selected version. |
| `status.targets[].gates[]` | Gate result and evidence for that target. |
| `status.PromotionPlanProgress[]` | Stage and PromotionPlan progress. |
| `status.report` | Compact PromotionRun summary. |
| `status.auditTrail` | Important promotion decisions over time. |
| `status.conditions` | Kubernetes-style readiness and stalled conditions. |
