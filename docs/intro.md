---
sidebar_position: 1
slug: /intro
---

# What is Kapro?

Kapro is a **Kubernetes-native control plane for promoting immutable artifact versions across a fleet of clusters**.

It answers one operational question:

> Which clusters are allowed to receive this artifact version now, and why?

Kapro owns cross-cluster release ordering, target planning, gate evaluation, approval state, backend convergence tracking, and auditable status. It delegates build, render, GitOps reconciliation, traffic shaping, and in-cluster rollout strategy to the tools that already own those jobs.

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node">
      <strong>Immutable artifact</strong>
      <span>OCI image or bundle produced by any CI system.</span>
      <div class="kapro-chip-row"><span class="kapro-chip">v1.8.2</span><span class="kapro-chip">digest pinned</span></div>
    </div>
    <div class="kapro-node">
      <strong>Gate policy</strong>
      <span>Signature, health, metrics, soak time, and approval checks.</span>
      <div class="kapro-chip-row"><span class="kapro-chip green">evidence</span><span class="kapro-chip green">approval</span></div>
    </div>
    <div class="kapro-node">
      <strong>Promotion waves</strong>
      <span>Canary first, then regional groups, then the wider fleet.</span>
      <div class="kapro-chip-row"><span class="kapro-chip">Wave 1</span><span class="kapro-chip">Wave 2</span><span class="kapro-chip">Wave 3</span></div>
    </div>
    <div class="kapro-node">
      <strong>Backend convergence</strong>
      <span>Flux, Argo CD, Helm, or another actuator applies the chosen version.</span>
      <div class="kapro-chip-row"><span class="kapro-chip green">audited</span></div>
    </div>
  </div>
</div>

## Why It Exists

Many platform teams already have a registry, CI pipelines, GitOps tools, and rollout controllers. The missing layer is the **fleet promotion loop** between a new artifact and hundreds of independently reconciled clusters.

Without that layer, teams usually fall into one of three patterns:

- **Manual promotion:** humans move versions between clusters with limited auditability.
- **Bespoke CI pipelines:** each team hard-codes wave logic, approvals, and target selection differently.
- **Local-only delivery:** Flux, Argo CD, Argo Rollouts, Flagger, Istio, and Gateway API handle local reconciliation or traffic behavior, but not the fleet-level decision of which cluster should advance next.

Kapro is the state-aware layer for that decision.

## What Kapro Owns

<div class="kapro-diagram">
  <div class="kapro-split">
    <div class="kapro-card kapro-good">
      <strong>Kapro owns</strong>
      <span>Release planning, target selection, wave ordering, gates, approvals, convergence tracking, rollback decisions, and auditable release status.</span>
    </div>
    <div class="kapro-card kapro-bad">
      <strong>Kapro does not own</strong>
      <span>Artifact build, manifest rendering, in-cluster traffic shifting, workload controllers, generic workflows, or GitOps reconciliation.</span>
    </div>
  </div>
</div>

## Core Mental Model

Kapro models a rollout as a release plan that resolves into per-cluster targets:

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node"><strong>Release</strong><span>Execution owner and audit root.</span></div>
    <div class="kapro-node"><strong>Pipeline DAG</strong><span>Reusable release flow with dependency ordering.</span></div>
    <div class="kapro-node"><strong>Stage DAG</strong><span>Stage-level ordering, gates, and concurrency.</span></div>
    <div class="kapro-node"><strong>MemberClusters</strong><span>Selected targets with per-cluster state.</span></div>
  </div>
</div>

- **Release** owns execution end-to-end and terminates when all selected targets have converged or failed.
- **Pipeline** is a reusable stage template.
- **Stage** selects clusters and applies gate policy.
- **ReleaseTarget** stores per-cluster progress.
- **MemberCluster** stores fleet inventory and observed state.
- **Approval** carries human approve or reject signals.

## How Kapro Fits

| | Kapro | Flux | Argo CD | Kargo |
|---|---|---|---|---|
| **Fleet promotion orchestration** | Native | Manual | App-of-apps | Native |
| **Cross-cluster waves** | Native | Manual | Manual | Native |
| **OCI-first promotion contract** | Yes | Partial | Git-centric | Yes |
| **Gate evidence and approvals** | Built in | External | External | Built in |
| **Local reconciliation** | Delegates | Native | Native | Delegates |
| **Traffic shifting** | Delegates | Via Flagger | Via Rollouts | Delegates |

Kapro sits **above** local delivery systems. It decides *when* and *where* a version may advance; Flux, Argo CD, Helm, or another actuator decides *how* the target cluster converges.

## Next Steps

- [Install Kapro](/docs/getting-started/installation)
- [Run the Kind demo](/docs/getting-started/kind-demo)
- [Understand the architecture](/docs/concepts/architecture)
