---
sidebar_position: 1
---

# Architecture

Kapro uses a **hub-and-spoke architecture**. The hub owns promotion state and decisions. Spokes report cluster health and converge local delivery backends.

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node">
      <strong>OCI registry</strong>
      <span>Immutable artifact versions produced by CI.</span>
    </div>
    <div class="kapro-node">
      <strong>Hub cluster</strong>
      <span>Kapro operator plans releases, evaluates gates, records status.</span>
    </div>
    <div class="kapro-node">
      <strong>Spoke clusters</strong>
      <span>Cluster controllers report health and desired-version convergence.</span>
    </div>
    <div class="kapro-node">
      <strong>Delivery backends</strong>
      <span>Flux, Argo CD, Helm, or plugins apply the version locally.</span>
    </div>
  </div>
</div>

## Hub Cluster

The hub cluster is the source of truth for fleet promotion.

| Component | Responsibility |
|---|---|
| `ReleaseReconciler` | Drives the pipeline DAG, stage DAG, target activation, and per-target FSM. |
| `ApprovalReconciler` | Watches `Approval` objects and unblocks targets waiting for human approval. |
| `CSRApprovalReconciler` | Approves spoke CSRs when bootstrap tokens are valid. |
| Approval service | Serves signed approve/reject links and release status views. |
| Plugin registry | Tracks external actuators, gates, and planners. |

## Spoke Clusters

Each spoke runs a lightweight controller. Its job is intentionally narrow:

1. Observe the target version selected by the hub.
2. Patch the local delivery backend.
3. Watch local convergence.
4. Report heartbeat and current versions back to the hub.

Spokes use outbound connectivity to the hub. They do not need the hub to open inbound connections into every cluster.

## Release Planning Model

<div class="kapro-diagram">
  <div class="kapro-lanes">
    <div class="kapro-lane">
      <div><strong>Wave 1</strong><span>canary</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">de-1</span><span class="kapro-cluster active">fi-1</span><span class="kapro-cluster">us-1</span><span class="kapro-cluster">jp-1</span></div>
      <div class="kapro-status">verified</div>
    </div>
    <div class="kapro-lane">
      <div><strong>Wave 2</strong><span>regional</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">eu-prod</span><span class="kapro-cluster active">us-prod</span><span class="kapro-cluster">apac-prod</span><span class="kapro-cluster">latam-prod</span></div>
      <div class="kapro-status">soaking</div>
    </div>
    <div class="kapro-lane">
      <div><strong>Wave 3</strong><span>fleet</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster">edge-a</span><span class="kapro-cluster">edge-b</span><span class="kapro-cluster">edge-c</span><span class="kapro-cluster">edge-d</span></div>
      <div class="kapro-status waiting">waiting</div>
    </div>
  </div>
</div>

Kapro turns selectors and pipeline stages into concrete `ReleaseTarget` objects. Each target advances independently, while stage dependencies and concurrency limits control the wave.

## CRD Inventory

| CRD | Kind | Purpose |
|-----|------|---------|
| `kaproapps.kapro.io` | `KaproApp` | Application or component metadata. |
| `pipelines.kapro.io` | `Pipeline` | Reusable stage DAG template. |
| `releases.kapro.io` | `Release` | Execution owner for a rollout. |
| `releasetargets.kapro.io` | `ReleaseTarget` | Per-target execution state. |
| `releasetriggers.kapro.io` | `ReleaseTrigger` | Autonomous release creation from OCI changes. |
| `memberclusters.kapro.io` | `MemberCluster` | Fleet inventory and observed state. |
| `approvals.kapro.io` | `Approval` | Human approve/reject signal. |
| `pluginregistrations.kapro.io` | `PluginRegistration` | External plugin registration. |
| `agentpolicies.kapro.io` | `AgentPolicy` | Agent-driven promotion policy. |

## Extension Interfaces

Kapro keeps extension points narrow:

| Interface | Question |
|-----------|----------|
| Actuator | Apply this version to this cluster. |
| Gate | May this target advance? |
| Planner | Which targets should this stage bind, and in what order? |

This keeps the promotion layer understandable while still allowing platform teams to integrate their own delivery systems and policy checks.
