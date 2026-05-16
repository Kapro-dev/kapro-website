---
sidebar_position: 1
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# Architecture

<ConceptDiagram id="architecture" />

Kapro is a hub-and-spoke promotion control plane.

<div class="kapro-lesson">
  <img src="/img/logo.png" alt="Kapro mascot" />
  <div>
    <strong>The hub is the brain. The backends do the local work.</strong>
    <p>Kapro decides which version may move, in what order, and under what policy. Argo, Flux, or a plugin performs the actual delivery for each selected cluster.</p>
  </div>
</div>

The hub owns PromotionRun decisions, ordering, gate evidence, approvals, plugin
dispatch, notifications, and status. Spoke clusters own local reconciliation and
report what actually converged.

## Layered Architecture

The easiest way to read Kapro is top to bottom. Each layer has a narrow job.

<div class="kapro-architecture">
  <div class="kapro-layer">
    <div class="kapro-layer-title">Intent layer<span>what should move</span></div>
    <div class="kapro-layer-cells">
      <div class="kapro-cell"><strong>Hub config Git</strong><span>Reviewable fleet YAML.</span></div>
      <div class="kapro-cell"><strong>Promotion</strong><span>Human-friendly desired rollout intent.</span></div>
      <div class="kapro-cell"><strong>PromotionRun</strong><span>One execution attempt for a version.</span></div>
      <div class="kapro-cell orange"><strong>PromotionTrigger</strong><span>Guarded automation creates runs.</span></div>
    </div>
  </div>
  <div class="kapro-layer">
    <div class="kapro-layer-title">Planning layer<span>where and in what order</span></div>
    <div class="kapro-layer-cells">
      <div class="kapro-cell"><strong>FleetCluster</strong><span>Cluster inventory, labels, health.</span></div>
      <div class="kapro-cell"><strong>PromotionPlan</strong><span>Stages, selectors, dependencies.</span></div>
      <div class="kapro-cell"><strong>PromotionPolicy</strong><span>Rules before movement.</span></div>
      <div class="kapro-cell green"><strong>Planner / KPI</strong><span>Optional target ordering plugin.</span></div>
    </div>
  </div>
  <div class="kapro-layer">
    <div class="kapro-layer-title">Control layer<span>deterministic controller brain</span></div>
    <div class="kapro-layer-cells">
      <div class="kapro-cell kapro-pulse"><strong>PromotionRunReconciler</strong><span>Expands plans into PromotionTargets.</span></div>
      <div class="kapro-cell"><strong>PromotionTargetReconciler</strong><span>Runs one target state machine.</span></div>
      <div class="kapro-cell"><strong>ApprovalReconciler</strong><span>Records human decisions.</span></div>
      <div class="kapro-cell"><strong>BackendProfile controller</strong><span>Discovers brownfield Argo/Flux topology.</span></div>
    </div>
  </div>
  <div class="kapro-layer">
    <div class="kapro-layer-title">Safety layer<span>why a target may move</span></div>
    <div class="kapro-layer-cells">
      <div class="kapro-cell"><strong>Verification</strong><span>Signature, digest, provenance.</span></div>
      <div class="kapro-cell"><strong>Health</strong><span>Heartbeat and workload readiness.</span></div>
      <div class="kapro-cell"><strong>Metrics</strong><span>Error rate, latency, business probes.</span></div>
      <div class="kapro-cell orange"><strong>Approval</strong><span>Manual gate for risky stages.</span></div>
    </div>
  </div>
  <div class="kapro-layer">
    <div class="kapro-layer-title">Delivery layer<span>who changes the workload</span></div>
    <div class="kapro-layer-cells">
      <div class="kapro-cell green"><strong>Argo CD</strong><span>Application and ApplicationSet sync.</span></div>
      <div class="kapro-cell green"><strong>Flux</strong><span>GitRepository, OCIRepository, HelmRelease, Kustomization.</span></div>
      <div class="kapro-cell green"><strong>External plugin / KAI</strong><span>Internal backend integration.</span></div>
      <div class="kapro-cell"><strong>Spoke agent</strong><span>Reports local convergence where used.</span></div>
    </div>
  </div>
  <div class="kapro-layer">
    <div class="kapro-layer-title">Evidence layer<span>what happened</span></div>
    <div class="kapro-layer-cells">
      <div class="kapro-cell"><strong>PromotionTarget status</strong><span>Per-cluster phase and evidence.</span></div>
      <div class="kapro-cell"><strong>PromotionRun status</strong><span>Rollout summary.</span></div>
      <div class="kapro-cell"><strong>Events</strong><span>Audit, chat, SIEM, automation.</span></div>
      <div class="kapro-cell"><strong>Metrics</strong><span>Operations dashboards and alerts.</span></div>
    </div>
  </div>
</div>

The hub does not own every workload detail. It owns the decision that a cluster
may move to a version and records whether that decision converged.

## Communication Flow

This is the runtime communication for one promotion.

<div class="kapro-swimlane">
  <div class="kapro-swimlane-grid">
    <div class="kapro-lane-head">Actor</div>
    <div class="kapro-lane-head">1. Intent</div>
    <div class="kapro-lane-head">2. Plan</div>
    <div class="kapro-lane-head">3. Check</div>
    <div class="kapro-lane-head">4. Apply</div>
    <div class="kapro-lane-head">5. Observe</div>
    <div class="kapro-lane-head">6. Decide</div>

    <div class="kapro-lane-head">User / CI</div>
    <div class="kapro-message">Creates PromotionRun or artifact tag.</div>
    <div class="kapro-lane-cell"></div>
    <div class="kapro-lane-cell"></div>
    <div class="kapro-lane-cell"></div>
    <div class="kapro-lane-cell"></div>
    <div class="kapro-lane-cell"></div>

    <div class="kapro-lane-head">Kapro hub</div>
    <div class="kapro-message">Reads PromotionRun and PromotionSource.</div>
    <div class="kapro-message">Selects FleetClusters from PromotionPlan stages.</div>
    <div class="kapro-message">Runs policies, gates, approvals, planner.</div>
    <div class="kapro-message">Calls backend adapter for active PromotionTarget.</div>
    <div class="kapro-message">Reads backend and target evidence.</div>
    <div class="kapro-message end">Marks target Converged, Failed, or RolledBack.</div>

    <div class="kapro-lane-head">Argo / Flux / plugin</div>
    <div class="kapro-lane-cell"></div>
    <div class="kapro-lane-cell"></div>
    <div class="kapro-lane-cell"></div>
    <div class="kapro-message">Applies selected version locally.</div>
    <div class="kapro-message">Reports sync, health, version, backend objects.</div>
    <div class="kapro-lane-cell"></div>
  </div>
</div>

## Sources of Truth

Kapro separates configuration truth from runtime artifact truth.

| Source | Owns | Does not own |
|---|---|---|
| Hub config Git repository | `FleetCluster`, `BackendProfile`, `PromotionSource`, `PromotionPlan`, `PromotionTrigger`, `PromotionRun`, notification, plugin, and policy manifests | Backend credentials, generated status, runtime cluster health |
| OCI registry | Immutable image, chart, or artifact digests | Fleet topology, promotion ordering, approvals, gate outcomes |
| Hub cluster etcd | Applied desired state plus observed status | Long-term repository history or artifact storage |

The default operating model is simple: CI validates the hub config repository
and applies YAML to the hub with `kubectl apply`. Teams that already run Flux on
the hub can let Flux apply the same repository. Spoke clusters remain gitless in
this model; they consume the selected OCI artifact and report status through
Kapro.

## Hub Cluster

The hub is the control plane.

It stores:

- `FleetCluster` inventory
- `BackendProfile` backend definitions and discovery status
- `PromotionSource` and `PromotionUnit` mappings
- `PromotionPlan` rollout plans
- `PromotionRun` objects
- `PromotionTarget` status
- `Approval` objects
- `PromotionTrigger` automation policy and observed artifacts
- `PluginRegistration` compatibility and readiness
- `NotificationProvider` and `NotificationPolicy` configuration
- `AgentPolicy` guardrails for future policy-bound agent workflows
- lifecycle events and audit status

The main controller is the `PromotionRunReconciler`. It reads a `PromotionRun`, resolves
the referenced `PromotionPlan` and `PromotionSource`, selects clusters, creates
targets, evaluates gates, calls the selected backend adapter, and waits for
convergence.

<div class="kapro-diagram">
  <div class="kapro-grid">
    <div class="kapro-card">
      <strong>PromotionRunReconciler</strong>
      <span>Runs the PromotionPlan and target lifecycle.</span>
    </div>
    <div class="kapro-card">
      <strong>ApprovalReconciler</strong>
      <span>Unblocks targets when an approval is created.</span>
    </div>
    <div class="kapro-card">
      <strong>BackendProfile controller</strong>
      <span>Discovers Argo or Flux topology and records observe/adopt status.</span>
    </div>
    <div class="kapro-card">
      <strong>PromotionTriggerReconciler</strong>
      <span>Observes OCI sources and creates digest-pinned PromotionRuns under policy.</span>
    </div>
    <div class="kapro-card">
      <strong>Notification engine</strong>
      <span>Emits PromotionRun, gate, approval, target, and stage lifecycle events.</span>
    </div>
  </div>
</div>

## Fleet Clusters

A `FleetCluster` is Kapro's record for one workload cluster.

It contains:

- labels used by stage selectors
- cloud, region, tier, and capability metadata
- delivery backend configuration
- heartbeat and health status
- current version observations
- bootstrap and spoke-controller status where applicable

Labels are how a PromotionPlan chooses targets:

```yaml
selector:
  matchLabels:
    kapro.io/tier: production
    kapro.io/region: europe-west3
```

This is similar to how a Kubernetes `Deployment` selects Pods with labels, but
the selected things are clusters.

For GKE fleets, the Kapro CLI can list Fleet memberships and sync them into
`FleetCluster` objects:

```bash
kapro fleet list --project my-project
kapro fleet sync --project my-project
```

That command uses the GKE Hub API through the Go SDK, not the `gcloud` CLI. It
is an onboarding helper; after clusters are represented as `FleetCluster`
objects, the normal Kapro PromotionRun model is the same.

## PromotionPlans and Stages

A `PromotionPlan` is a reusable rollout plan. It does not execute by itself.

A stage says:

- which clusters to select
- what must happen before the stage starts
- how many targets may run at once
- which gates must pass

<div class="kapro-diagram">
  <div class="kapro-lanes">
    <div class="kapro-lane">
      <div><strong>canary</strong><span>tier=canary</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">checkout-canary</span></div>
      <div class="kapro-status">first</div>
    </div>
    <div class="kapro-lane">
      <div><strong>production-eu</strong><span>region=europe</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">prod-eu-1</span><span class="kapro-cluster">prod-eu-2</span></div>
      <div class="kapro-status">after canary</div>
    </div>
    <div class="kapro-lane">
      <div><strong>production-global</strong><span>tier=production</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster">prod-us</span><span class="kapro-cluster">prod-apac</span></div>
      <div class="kapro-status waiting">last</div>
    </div>
  </div>
</div>

## PromotionRuns and Targets

A `PromotionRun` is one execution:

```text
promote checkout version v1.8.2 using PromotionPlan checkout-progressive
```

Kapro expands the PromotionRun into `PromotionTarget` state:

```text
checkout-v1.8.2 / checkout-canary -> Converged
checkout-v1.8.2 / prod-eu-1       -> Soaking
checkout-v1.8.2 / prod-us         -> Pending
```

That per-target status is what makes debugging simple. You can see exactly
which cluster is blocked and why.

## Backend Profiles and Promotion Sources

`BackendProfile` selects the delivery backend: `argo`, `flux`, or `external`.
It also controls brownfield discovery through `managementPolicy: Observe` or
`Adopt`.

`PromotionSource` defines the units Kapro can promote. Each `PromotionUnit`
names one deployable unit and the backend-native version field Kapro may change.

```text
BackendProfile argo -> discover Applications and ApplicationSets
PromotionSource checkout -> units api, worker, pos-server
PromotionRun versions -> api=1.5.0, worker=3.9.1, pos-server=5.28.0
```

## PromotionRun Triggers

`PromotionTrigger` is Kapro's preview API for guarded automation. It observes an
artifact source, applies tag filters, cooldown, max-active, scope, and signature
policy, then creates a digest-pinned `PromotionRun`.

The safe flow is:

```text
OCI artifact observed -> PromotionTrigger policy passes -> suspended or scoped PromotionRun -> normal Kapro PromotionPlan
```

Detection is not deployment by itself. The resulting `PromotionRun` still goes
through the same stage graph, gates, approvals, backend adapters, and
convergence checks as a manually created PromotionRun.

## Backend Adapters

A backend adapter connects Kapro to the tool that applies a version.

Kapro says:

```text
target prod-eu-1 may receive checkout:v1.8.2
```

The adapter translates that into backend-specific work, such as patching an Argo
CD Application revision, applying a Git-native ApplicationSet generator field,
updating a Flux source revision, or calling an external plugin.

The backend still owns local rollout behavior. Kapro only tracks whether the
target converged to the selected version.

## Extension Boundaries

Kapro has three narrow extension surfaces and one registration API:

| Extension | Question it answers |
|---|---|
| Backend adapter / KAI | How do I apply this version to this target? |
| Gate / KGI | May this target advance now? |
| Planner / KPI | Which eligible targets should bind first? |
| PluginRegistration | Which external plugin endpoint and contract version should Kapro load? |

Extensions do backend-specific work. Kapro keeps ownership of PromotionRun state,
ordering, retries, failures, approvals, and status.

The plugin gateway is an opt-in runtime preview. Ready backend adapter and gate
registrations are loaded at operator startup when enabled; planner registration
status is reported, while external planner runtime dispatch remains future work.

## Operational Surfaces

Kapro now includes the production-adoption surfaces expected around the core
controller:

| Surface | Purpose |
|---|---|
| Helm chart and Kustomize install path | Install CRDs, RBAC, controller, webhook resources, and baseline services. |
| Kind demo | Local end-to-end path for PromotionTrigger, planner, gates, backend apply, approval, and status. |
| Conformance harnesses | KAI, KGI, and KPI checks for external plugin authors. |
| API stability policy | Alpha, Preview, and Stable classifications plus upgrade rules. |
| RBAC and security model | Trust boundaries for PromotionRuns, approvals, plugins, triggers, secrets, and agents. |
| Monitoring | Prometheus rules, Grafana dashboard, and operations guide. |
| Lifecycle events | Webhook or CloudEvents payloads for audit, chat, SIEM, tickets, and Git audit consumers. |
