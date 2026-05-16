---
sidebar_position: 1
slug: /intro
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# What is Kapro?

<ConceptDiagram id="intro" />

Kapro is a Kubernetes control plane for one job:

> Move one immutable artifact version across many Kubernetes clusters, in a safe order, with evidence for every decision.

It does not build images. It does not render manifests. It does not replace Flux,
Argo CD, Helm, Flagger, or Argo Rollouts.

Kapro sits above those tools and answers:

> Which clusters may receive this version now, and why?

## The Short Version

Think of a platform with many clusters:

<div class="kapro-mental-model">
  <div class="kapro-model-card"><strong>Pipeline builds</strong><span>CI creates image, chart, or artifact. Kapro does not build it.</span></div>
  <div class="kapro-model-card"><strong>Artifact version exists</strong><span>The version is immutable, signed, and inspectable.</span></div>
  <div class="kapro-model-card"><strong>Promotion moves it</strong><span>Kapro decides where that version may go next and records evidence.</span></div>
</div>

Kapro is the part in the middle: the fleet-level promotion decision.

## Pipeline, Artifact, Promotion

People often use deployment words in different ways. Kapro uses promotion-domain
names so the internal model stays clear:

<div class="kapro-pipeline">
  <div class="kapro-pipeline-node build"><strong>CI pipeline</strong><span>test, build, sign</span></div>
  <div class="kapro-pipeline-hop"><span></span></div>
  <div class="kapro-pipeline-node artifact"><strong>Artifact version</strong><span>image digest or chart revision</span></div>
  <div class="kapro-pipeline-hop"><span></span></div>
  <div class="kapro-pipeline-node kapro"><strong>Kapro promotion</strong><span>plan, policy, gates, targets</span></div>
  <div class="kapro-pipeline-hop"><span></span></div>
  <div class="kapro-pipeline-node fleet"><strong>Fleet outcome</strong><span>per-cluster evidence</span></div>
</div>

<div class="kapro-map">
  <div class="kapro-map-row">
    <div class="kapro-map-item"><strong>CI pipeline</strong><span>Builds and tests. Output is an artifact.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>Artifact version</strong><span>Image tag, digest, chart version, Git revision, or unit version.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>PromotionPlan</strong><span>The route: canary, region, production, approvals.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>PromotionRun</strong><span>One attempt to move that version.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>PromotionTarget</strong><span>One selected cluster proving it converged.</span></div>
  </div>
</div>

Read it like a simple sentence:

```text
CI built checkout:v1.8.2.
PromotionPlan says canary first, then Europe, then the rest.
PromotionRun moves checkout:v1.8.2 through that plan.
PromotionTargets show what happened on each cluster.
```

## Why Kapro Exists

Most teams already have the pieces around a PromotionRun:

- CI creates an artifact.
- An OCI registry stores the artifact.
- Flux or Argo CD applies changes inside a cluster.
- Observability tells you whether the service is healthy.
- Git stores reviewed platform configuration.

The missing piece is the shared rule for moving from one cluster to the next.

Without Kapro, teams often put that logic in CI scripts:

> deploy canary, wait, query metrics, ask for approval, deploy region, repeat

That works once. It becomes hard to standardize across many teams, regions,
compliance zones, and clusters.

Kapro turns that script into Kubernetes objects with status, events, retries,
approvals, and an audit trail.

The current operating model has two explicit sources of truth:

| Source | What it controls |
|---|---|
| Hub config Git repository | Fleet inventory, backend profiles, promotion sources, rollout PromotionPlans, PromotionRun triggers, notification policy, plugin registrations, and PromotionRun intent. |
| Backend-native Git repositories | Argo CD Applications, ApplicationSets, Flux objects, HelmRelease files, and the version fields Kapro can promote. |
| OCI registry | Immutable runtime artifacts that PromotionRuns can point to by digest. |

Spoke clusters do not need to watch the hub config repository. A `BackendProfile`
selects Argo CD, Flux, or an external backend, and each `PromotionSource` maps
the backend-native objects and fields Kapro may update. Kapro records
convergence back on the hub.

## The Kubernetes Analogy

If you know Kubernetes, the mental model is small:

| Kubernetes concept | Kapro concept | Meaning |
|---|---|---|
| `Node` | `FleetCluster` | A cluster that can receive PromotionRuns. |
| `Deployment` | `PromotionPlan` | A reusable rollout plan. |
| `ReplicaSet` | Stage | One wave inside the plan. |
| `Pod` | `PromotionTarget` | One selected cluster moving through the PromotionRun. |
| `Job` | `PromotionRun` | One execution that finishes as completed or failed. |

Kubernetes schedules Pods onto Nodes. Kapro schedules PromotionTarget objects onto
FleetClusters.

## The Objects You Need First

You can understand Kapro with the core objects first:

<div class="kapro-diagram">
  <div class="kapro-grid">
    <div class="kapro-card">
      <strong>FleetCluster</strong>
      <span>One cluster in the fleet. Labels describe region, tier, cloud, compliance zone, or capacity.</span>
    </div>
    <div class="kapro-card">
      <strong>BackendProfile</strong>
      <span>The Argo CD, Flux, or external backend Kapro may observe, adopt, or drive.</span>
    </div>
    <div class="kapro-card">
      <strong>PromotionSource</strong>
      <span>The app source and deployable units Kapro is allowed to promote.</span>
    </div>
    <div class="kapro-card">
      <strong>PromotionUnit</strong>
      <span>One deployable unit, its backend kind, source file, and version field.</span>
    </div>
    <div class="kapro-card">
      <strong>PromotionPlan</strong>
      <span>The reusable rollout plan: stages, selectors, dependencies, gates, and concurrency.</span>
    </div>
    <div class="kapro-card">
      <strong>PromotionRun</strong>
      <span>The request to promote one version through one or more PromotionPlans.</span>
    </div>
    <div class="kapro-card">
      <strong>PromotionTarget</strong>
      <span>The live per-cluster state created by Kapro as the PromotionRun runs.</span>
    </div>
    <div class="kapro-card">
      <strong>Approval</strong>
      <span>The human approve or reject signal when a stage requires it.</span>
    </div>
    <div class="kapro-card">
      <strong>PromotionTrigger</strong>
      <span>A guarded automation rule that observes OCI artifacts and creates PromotionRuns.</span>
    </div>
    <div class="kapro-card">
      <strong>PluginRegistration</strong>
      <span>A platform-owned declaration of an external backend adapter, gate, or planner endpoint.</span>
    </div>
  </div>
</div>

Other preview and operations CRDs round out the platform surface:
`NotificationProvider`, `NotificationPolicy`, and `AgentPolicy`.

## A PromotionRun in One Picture

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
| PromotionRun state and status | Image build and artifact publishing |
| Stage ordering and wave dependencies | Manifest rendering |
| Backend discovery and adoption policy | Backend credentials and controller installation |
| PromotionUnit version-field mapping | Argo CD, Flux, Helm, or backend reconciliation |
| Cluster target selection and planning | Backend apply mechanics |
| Gate evaluation and evidence | In-cluster canary traffic shifting |
| Approval state | Long-term audit storage |
| Backend convergence tracking | Team-specific incident workflows |
| PromotionTrigger policy | Artifact build and tag publication |
| Plugin compatibility status | Plugin backend permissions |

That boundary is important. Kapro is a promotion control plane, not a second CI
system and not another local rollout controller.

## Where to Go Next

1. [Architecture](/docs/concepts/architecture): learn the hub, spokes, and delivery backends.
2. [Promotion lifecycle](/docs/concepts/promotionrun-fsm): follow one target from pending to converged.
3. [Gates](/docs/concepts/gates): understand the safety checks.
4. [Automation and triggers](/docs/concepts/automation-and-triggers): see guarded OCI-driven PromotionRun creation.
5. [Hub configuration](/docs/guides/hub-config): see how teams store fleet config in Git.
6. [Fleet discovery](/docs/guides/fleet-discovery): onboard GKE Fleet clusters.
7. [Local Kind demo](/docs/getting-started/kind-demo): run the flow on your machine.
