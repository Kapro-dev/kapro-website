---
sidebar_position: 1
---

# Architecture

Kapro uses a hub-and-spoke model.

The hub makes promotion decisions. Spoke clusters run or report the local
delivery work.

```text
CI -> OCI artifact -> Kapro hub -> selected clusters -> Flux/Argo/Helm apply
```

## The Big Picture

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node">
      <strong>OCI registry</strong>
      <span>Stores immutable versions produced by CI.</span>
    </div>
    <div class="kapro-node">
      <strong>Hub cluster</strong>
      <span>Runs Kapro controllers and stores release state.</span>
    </div>
    <div class="kapro-node">
      <strong>MemberClusters</strong>
      <span>Represent target clusters with labels, health, and backend config.</span>
    </div>
    <div class="kapro-node">
      <strong>Delivery backend</strong>
      <span>Flux, Argo CD, Helm, or a plugin applies the selected version.</span>
    </div>
  </div>
</div>

The hub does not need to own every workload detail. It owns the decision that a
cluster may move to a version and records whether that decision converged.

## Hub Cluster

The hub is the control plane.

It stores:

- `MemberCluster` inventory
- `KaproBundle` definitions
- `Pipeline` rollout plans
- `Release` objects
- `ReleaseTarget` status
- `Approval` objects
- lifecycle events and audit status

The main controller is the `ReleaseReconciler`. It reads a `Release`, resolves
the referenced `Pipeline`, selects clusters, creates targets, evaluates gates,
and waits for convergence.

<div class="kapro-diagram">
  <div class="kapro-grid">
    <div class="kapro-card">
      <strong>ReleaseReconciler</strong>
      <span>Runs the pipeline and target lifecycle.</span>
    </div>
    <div class="kapro-card">
      <strong>ApprovalReconciler</strong>
      <span>Unblocks targets when an approval is created.</span>
    </div>
    <div class="kapro-card">
      <strong>Plugin registry</strong>
      <span>Loads actuator, gate, and planner integrations.</span>
    </div>
  </div>
</div>

## Member Clusters

A `MemberCluster` is Kapro's record for one workload cluster.

It contains:

- labels used by stage selectors
- cloud, region, tier, and capability metadata
- delivery backend configuration
- heartbeat and health status
- current version observations

Labels are how a pipeline chooses targets:

```yaml
selector:
  matchLabels:
    kapro.io/tier: production
    kapro.io/region: europe-west3
```

This is similar to how a Kubernetes `Deployment` selects Pods with labels, but
the selected things are clusters.

## Pipelines and Stages

A `Pipeline` is a reusable rollout plan. It does not execute by itself.

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

## Releases and Targets

A `Release` is one execution:

```text
promote checkout version v1.8.2 using pipeline checkout-progressive
```

Kapro expands the release into `ReleaseTarget` state:

```text
checkout-v1.8.2 / checkout-canary -> Converged
checkout-v1.8.2 / prod-eu-1       -> Soaking
checkout-v1.8.2 / prod-us         -> Pending
```

That per-target status is what makes debugging simple. You can see exactly
which cluster is blocked and why.

## Actuators

An actuator is the adapter between Kapro and the delivery backend.

Kapro says:

```text
target prod-eu-1 may receive checkout:v1.8.2
```

The actuator translates that into backend-specific work, such as patching a Flux
resource, an Argo CD Application, a Helm release, or an internal delivery API.

The backend still owns local rollout behavior. Kapro only tracks whether the
target converged to the selected version.

## Extension Boundaries

Kapro has three narrow extension surfaces:

| Extension | Question it answers |
|---|---|
| Actuator | How do I apply this version to this target? |
| Gate | May this target advance now? |
| Planner | Which eligible targets should bind first? |

Extensions do backend-specific work. Kapro keeps ownership of release state,
ordering, retries, failures, approvals, and status.
