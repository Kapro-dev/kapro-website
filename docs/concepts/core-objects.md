---
sidebar_position: 2
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# Core Objects

<ConceptDiagram id="core-objects" />

Kapro is easier to learn when you start with one story:

<div class="kapro-lesson">
  <img src="/img/logo.png" alt="Kapro mascot" />
  <div>
    <strong>Kapro helps one version hop safely across a fleet.</strong>
    <p>Think of the artifact version as the thing being carried. The plan says the path. The fleet clusters are the places it can land. The target status tells you whether one landing worked.</p>
  </div>
</div>

## The Whole Story

Read the core objects from left to right:

<div class="kapro-architecture">
  <div class="kapro-layer">
    <div class="kapro-layer-title">Before anything moves<span>configuration objects</span></div>
    <div class="kapro-layer-cells">
      <div class="kapro-cell"><strong>FleetCluster</strong><span>Where a version can land.</span></div>
      <div class="kapro-cell"><strong>BackendProfile</strong><span>Which backend can apply it.</span></div>
      <div class="kapro-cell"><strong>PromotionSource</strong><span>Which app units exist.</span></div>
      <div class="kapro-cell"><strong>PromotionPlan</strong><span>Which route the version follows.</span></div>
    </div>
  </div>
  <div class="kapro-layer">
    <div class="kapro-layer-title">Start movement<span>intent objects</span></div>
    <div class="kapro-layer-cells">
      <div class="kapro-cell orange"><strong>PromotionTrigger</strong><span>Optional automation from artifacts.</span></div>
      <div class="kapro-cell kapro-pulse"><strong>PromotionRun</strong><span>The concrete request to move now.</span></div>
      <div class="kapro-cell"><strong>PromotionPolicy</strong><span>Rules that must hold.</span></div>
      <div class="kapro-cell"><strong>Approval</strong><span>Human yes or no where required.</span></div>
    </div>
  </div>
  <div class="kapro-layer">
    <div class="kapro-layer-title">During movement<span>runtime objects</span></div>
    <div class="kapro-layer-cells">
      <div class="kapro-cell green"><strong>PromotionTarget</strong><span>One selected cluster's state.</span></div>
      <div class="kapro-cell"><strong>Gate evidence</strong><span>Why it passed or stopped.</span></div>
      <div class="kapro-cell"><strong>Events</strong><span>External notifications and audit.</span></div>
      <div class="kapro-cell"><strong>Metrics</strong><span>Operations view.</span></div>
    </div>
  </div>
</div>

When a `PromotionRun` starts, Kapro creates `PromotionTarget` state for the selected clusters:

<div class="kapro-map">
  <div class="kapro-map-row">
    <div class="kapro-map-item"><strong>PromotionRun</strong><span>checkout v1.8.2 is moving.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>PromotionTarget</strong><span>checkout v1.8.2 on canary-eu.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>Gates and approvals</strong><span>Policy decides whether this target can continue.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>Backend apply</strong><span>Argo, Flux, or a plugin applies the version.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>Status</strong><span>Converged, failed, waiting, or rolled back.</span></div>
  </div>
</div>

## Object Cheat Sheet

You do not need every CRD on day one. Start with these:

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node"><strong>FleetCluster</strong><span>Where a version can go.</span></div>
    <div class="kapro-node"><strong>BackendProfile</strong><span>Which delivery backend Kapro may use.</span></div>
    <div class="kapro-node"><strong>PromotionSource</strong><span>Which app units can be promoted.</span></div>
    <div class="kapro-node"><strong>PromotionUnit</strong><span>One deployable unit and its version field.</span></div>
    <div class="kapro-node"><strong>PromotionPlan</strong><span>How promotion should move.</span></div>
    <div class="kapro-node"><strong>PromotionRun</strong><span>Which version to promote now.</span></div>
    <div class="kapro-node"><strong>PromotionTarget</strong><span>How one selected cluster is progressing.</span></div>
  </div>
</div>

Kapro creates or updates execution status as the PromotionRun runs:

<div class="kapro-diagram">
  <div class="kapro-grid">
    <div class="kapro-card">
      <strong>PromotionTarget</strong>
      <span>One selected cluster inside one PromotionRun.</span>
    </div>
    <div class="kapro-card">
      <strong>Approval</strong>
      <span>A human approve or reject decision.</span>
    </div>
    <div class="kapro-card">
      <strong>Events</strong>
      <span>PromotionRun, stage, gate, and target lifecycle signals.</span>
    </div>
  </div>
</div>

The current preview also includes automation and integration objects:

| Object | Purpose |
|---|---|
| `PromotionTrigger` | Observes an artifact source and creates policy-guarded PromotionRuns. |
| `PluginRegistration` | Registers external backend adapter, gate, or planner plugin endpoints and reports compatibility. |
| `NotificationProvider` | Defines where lifecycle notifications can be sent. |
| `NotificationPolicy` | Defines when lifecycle notifications should be sent. |
| `AgentPolicy` | Defines policy boundaries for future agent-assisted workflows. |

## FleetCluster

A `FleetCluster` is one target cluster in the fleet.

It should answer:

- What is this cluster called?
- What labels describe it?
- Which delivery backend should Kapro use?
- Is it healthy?
- Which versions are currently running?

Example:

```yaml
apiVersion: kapro.io/v1alpha1
kind: FleetCluster
metadata:
  name: prod-eu-1
  labels:
    kapro.io/tier: production
    kapro.io/region: europe-west3
spec:
  delivery:
    mode: push
    backendRef: argo
    parameters:
      namespace: argocd
      applicationSelector.api: "kapro.io/import=true,service=api"
```

The labels are important. PromotionPlans use them to select targets.

`FleetCluster` objects can be written by hand in the hub config repository or
created during fleet onboarding. For GKE Fleet, `kapro fleet sync` reads Fleet
memberships and creates `FleetCluster` resources for bulk onboarding.

## BackendProfile

A `BackendProfile` declares a delivery backend such as Argo CD, Flux, or an
external plugin-backed system.

Example:

```yaml
apiVersion: kapro.io/v1alpha1
kind: BackendProfile
metadata:
  name: argo
spec:
  driver: argo
  runtime: Hub
  discovery:
    enabled: true
    managementPolicy: Observe
```

Start brownfield backends in `Observe`. Move to `Adopt` only after reviewing
the discovered objects and generated promotion units.

## PromotionSource and PromotionUnit

A `PromotionSource` defines the units Kapro can promote. A `PromotionUnit` is
one deployable unit inside that source.

Example:

```yaml
apiVersion: kapro.io/v1alpha1
kind: PromotionSource
metadata:
  name: checkout
spec:
  backendRef: argo
  units:
    - name: api
      backendKind: ArgoApplicationSource
      namespace: argocd
      sourcePath: argocd/applications/api.yaml
      versionField: spec.source.targetRevision
    - name: pos-server
      backendKind: GitJSONField
      namespace: argocd
      sourcePath: argocd/applicationsets/store-checkout.yaml
      versionField: argocd/environments/*.json:posServerVersion
```

Read that as: `api` is promoted by changing an Argo Application source
revision, while `pos-server` is promoted by changing a Git generator input
field.

## PromotionPlan

A `PromotionPlan` is the reusable rollout plan.

It says:

- start with these clusters
- then move to those clusters
- wait for these gates
- limit parallelism here
- require approval there

Example:

```yaml
apiVersion: kapro.io/v1alpha1
kind: PromotionPlan
metadata:
  name: checkout-progressive
spec:
  stages:
    - name: canary
      selector:
        matchLabels:
          kapro.io/tier: canary

    - name: production-eu
      selector:
        matchLabels:
          kapro.io/tier: production
          kapro.io/region: europe-west3
      dependsOn:
        - stage: canary
          requiredSoakTime: 30m
      gate:
        mode: manual
        approval:
          required: true
          approvers: ["sre-team"]
```

## PromotionRun

A `PromotionRun` starts execution.

It should be small and specific:

```text
Promote checkout version v1.8.2 with PromotionPlan checkout-progressive.
```

Example shape:

```yaml
apiVersion: kapro.io/v1alpha1
kind: PromotionRun
metadata:
  name: checkout-v1-8-2
spec:
  versions:
    api: "1.8.2"
    pos-server: "5.28.0"
  promotionplans:
    - name: main
      promotionplan: checkout-progressive
  suspended: false
  timeout: 4h
```

After a `PromotionRun` exists, Kapro creates target state and drives the lifecycle.

## PromotionTrigger

A `PromotionTrigger` starts guarded automation.

It watches an artifact source and turns a qualifying observation into a
digest-pinned `PromotionRun`. The trigger policy controls tag filters, cooldown, max
active PromotionRuns, signature verification, scope, and whether the resulting
PromotionRun should start suspended.

Example shape:

```yaml
apiVersion: kapro.io/v1alpha1
kind: PromotionTrigger
metadata:
  name: checkout-oci
spec:
  suspended: true
  source:
    type: oci
    oci:
      repository: oci://europe-west3-docker.pkg.dev/my-project/promotionruns/checkout
      tagPattern: "^v[0-9]+\\.[0-9]+\\.[0-9]+$"
      requireSignature: true
      pollInterval: 5m
  promotionrunTemplate:
    promotionplans:
      - name: production
        promotionplan: checkout-progressive
    suspended: true
  cooldown: 15m
  maxActive: 1
```

Read that as: observe trusted semantic version tags, pin the digest, create at
most one active PromotionRun at a time, and let the normal Kapro PromotionRun lifecycle
handle the rest.

## PromotionTarget

A `PromotionTarget` is the easiest object to debug.

It answers:

- Which PromotionRun selected this cluster?
- Which phase is the cluster in?
- Which gate passed or failed?
- Which version was applied?
- Did the backend converge?

Example status shape:

```text
checkout-v1-8-2 / canary-eu -> Converged
checkout-v1-8-2 / prod-eu   -> WaitingApproval
checkout-v1-8-2 / prod-us   -> Pending
```

## Approval

An `Approval` is separate from `PromotionRun` so a human decision is explicit and
auditable.

When a target reaches `WaitingApproval`, Kapro waits until the matching approval
exists and is approved.

## PluginRegistration

`PluginRegistration` is the platform-owned declaration for external plugins.
It names the plugin type, endpoint, TLS configuration, timeout behavior, and
supported KAI, KGI, or KPI contract versions.

When the plugin gateway is enabled, ready backend adapter and gate registrations
can be loaded at operator startup. Planner registrations are probed and reported
in status as part of the KPI preview.

Plugin state does not replace Kapro PromotionRun state. Plugins do backend-specific
work and return normalized results; Kapro owns the PromotionRun state machine.

## NotificationProvider and NotificationPolicy

Kapro emits lifecycle events for PromotionRuns, stages, gates, approvals, and target
phase changes.

`NotificationProvider` defines destinations such as webhooks, Slack, email, Git
audit consumers, or other integrations. `NotificationPolicy` defines filters:
which event types, PromotionRuns, stages, targets, or phases should go to a provider.

Inline notification behavior remains the active runtime path today. Provider
and policy resources are the Kubernetes-native API preview for decoupling event
destinations from event subscriptions.

## AgentPolicy

`AgentPolicy` is the boundary for future policy-bound agent workflows. Agents
may explain state, draft recommendations, or request approval under policy, but
they must not bypass gates, approvals, RBAC, admission checks, or Kapro's
deterministic PromotionRun FSM.

## How the Objects Fit

<div class="kapro-diagram">
  <div class="kapro-lanes">
    <div class="kapro-lane">
      <div><strong>Config</strong><span>before PromotionRun</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">FleetCluster</span><span class="kapro-cluster active">BackendProfile</span><span class="kapro-cluster active">PromotionSource</span><span class="kapro-cluster active">PromotionPlan</span></div>
      <div class="kapro-status">ready</div>
    </div>
    <div class="kapro-lane">
      <div><strong>Intent</strong><span>start PromotionRun</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">PromotionTrigger</span><span class="kapro-cluster active">PromotionRun</span></div>
      <div class="kapro-status">created</div>
    </div>
    <div class="kapro-lane">
      <div><strong>Status</strong><span>during PromotionRun</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">PromotionTarget</span><span class="kapro-cluster">Approval</span><span class="kapro-cluster active">Events</span></div>
      <div class="kapro-status">observed</div>
    </div>
  </div>
</div>
