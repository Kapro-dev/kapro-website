---
sidebar_position: 1
slug: /intro
---

# What is Kapro?

Kapro is a Kubernetes control plane for one job:

> Move one immutable artifact version across many Kubernetes clusters, in a safe order, with evidence for every decision.

It does not build images. It does not render manifests. It does not replace Flux,
Argo CD, Helm, Flagger, or Argo Rollouts.

Kapro sits above those tools and answers:

> Which clusters may receive this version now, and why?

## The Short Version

Think of a platform with many clusters:

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node">
      <strong>A version exists</strong>
      <span>CI publishes an immutable OCI image or bundle.</span>
      <div class="kapro-chip-row"><span class="kapro-chip">checkout:v1.8.2</span><span class="kapro-chip">digest pinned</span></div>
    </div>
    <div class="kapro-node">
      <strong>Kapro plans</strong>
      <span>Selects clusters and orders them into waves.</span>
      <div class="kapro-chip-row"><span class="kapro-chip">canary</span><span class="kapro-chip">region</span><span class="kapro-chip">fleet</span></div>
    </div>
    <div class="kapro-node">
      <strong>Gates decide</strong>
      <span>Checks signatures, health, metrics, soak time, and approvals.</span>
      <div class="kapro-chip-row"><span class="kapro-chip green">evidence</span><span class="kapro-chip green">approved</span></div>
    </div>
    <div class="kapro-node">
      <strong>Backends apply</strong>
      <span>Flux, Argo CD, Helm, or plugins converge each cluster.</span>
      <div class="kapro-chip-row"><span class="kapro-chip green">audited</span></div>
    </div>
  </div>
</div>

Kapro is the part in the middle: the fleet-level promotion decision.

## Why Kapro Exists

Most teams already have the pieces around a release:

- CI creates an artifact.
- An OCI registry stores the artifact.
- Flux or Argo CD applies changes inside a cluster.
- Observability tells you whether the service is healthy.

The missing piece is the shared rule for moving from one cluster to the next.

Without Kapro, teams often put that logic in CI scripts:

> deploy canary, wait, query metrics, ask for approval, deploy region, repeat

That works once. It becomes hard to standardize across many teams, regions,
compliance zones, and clusters.

Kapro turns that script into Kubernetes objects with status, events, retries,
approvals, and an audit trail.

## The Kubernetes Analogy

If you know Kubernetes, the mental model is small:

| Kubernetes concept | Kapro concept | Meaning |
|---|---|---|
| `Node` | `MemberCluster` | A cluster that can receive releases. |
| `Deployment` | `Pipeline` | A reusable rollout plan. |
| `ReplicaSet` | Stage | One wave inside the plan. |
| `Pod` | `ReleaseTarget` | One selected cluster moving through the release. |
| `Job` | `Release` | One execution that finishes as completed or failed. |

Kubernetes schedules Pods onto Nodes. Kapro schedules release targets onto
MemberClusters.

## The Objects You Need First

You can understand Kapro with five objects:

<div class="kapro-diagram">
  <div class="kapro-grid">
    <div class="kapro-card">
      <strong>MemberCluster</strong>
      <span>One cluster in the fleet. Labels describe region, tier, cloud, compliance zone, or capacity.</span>
    </div>
    <div class="kapro-card">
      <strong>KaproApp</strong>
      <span>The application metadata and components that are allowed to be promoted.</span>
    </div>
    <div class="kapro-card">
      <strong>Pipeline</strong>
      <span>The reusable rollout plan: stages, selectors, dependencies, gates, and concurrency.</span>
    </div>
    <div class="kapro-card">
      <strong>Release</strong>
      <span>The request to promote one version through one or more pipelines.</span>
    </div>
    <div class="kapro-card">
      <strong>ReleaseTarget</strong>
      <span>The live per-cluster state created by Kapro as the release runs.</span>
    </div>
    <div class="kapro-card">
      <strong>Approval</strong>
      <span>The human approve or reject signal when a stage requires it.</span>
    </div>
  </div>
</div>

## A Release in One Picture

<div class="kapro-diagram">
  <div class="kapro-lanes">
    <div class="kapro-lane">
      <div><strong>Stage 1</strong><span>canary</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">canary-eu</span><span class="kapro-cluster">canary-us</span></div>
      <div class="kapro-status">converged</div>
    </div>
    <div class="kapro-lane">
      <div><strong>Stage 2</strong><span>regional production</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">prod-eu</span><span class="kapro-cluster">prod-us</span></div>
      <div class="kapro-status">soaking</div>
    </div>
    <div class="kapro-lane">
      <div><strong>Stage 3</strong><span>remaining fleet</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster">edge-a</span><span class="kapro-cluster">edge-b</span><span class="kapro-cluster">edge-c</span></div>
      <div class="kapro-status waiting">waiting</div>
    </div>
  </div>
</div>

Each stage selects clusters by label. Each selected cluster becomes a target.
Each target moves independently through verification, health checks, soak,
approval, apply, and convergence.

## What Kapro Owns

| Kapro owns | Kapro delegates |
|---|---|
| Release state and status | Image build and artifact publishing |
| Stage ordering and wave dependencies | Manifest rendering |
| Cluster target selection | Flux, Argo CD, Helm, or backend reconciliation |
| Gate evaluation and evidence | In-cluster canary traffic shifting |
| Approval state | Long-term audit storage |
| Backend convergence tracking | Team-specific incident workflows |

That boundary is important. Kapro is a promotion control plane, not a second CI
system and not another local rollout controller.

## Where to Go Next

1. [Architecture](/docs/concepts/architecture): learn the hub, spokes, and delivery backends.
2. [Promotion lifecycle](/docs/concepts/release-fsm): follow one target from pending to converged.
3. [Gates](/docs/concepts/gates): understand the safety checks.
4. [Hub configuration](/docs/guides/hub-config): see how teams store fleet config in Git.
5. [Local Kind demo](/docs/getting-started/kind-demo): run the flow on your machine.
