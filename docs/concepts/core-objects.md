---
sidebar_position: 2
---

# Core Objects

Kapro is easier to learn when you start with the objects.

You do not need to understand every CRD on day one. Start with these:

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node"><strong>MemberCluster</strong><span>Where a version can go.</span></div>
    <div class="kapro-node"><strong>KaproBundle</strong><span>What components are being promoted.</span></div>
    <div class="kapro-node"><strong>Pipeline</strong><span>How promotion should move.</span></div>
    <div class="kapro-node"><strong>Release</strong><span>Which version to promote now.</span></div>
  </div>
</div>

Kapro creates or updates execution status as the release runs:

<div class="kapro-diagram">
  <div class="kapro-grid">
    <div class="kapro-card">
      <strong>ReleaseTarget</strong>
      <span>One selected cluster inside one release.</span>
    </div>
    <div class="kapro-card">
      <strong>Approval</strong>
      <span>A human approve or reject decision.</span>
    </div>
    <div class="kapro-card">
      <strong>Events</strong>
      <span>Release, stage, gate, and target lifecycle signals.</span>
    </div>
  </div>
</div>

## MemberCluster

A `MemberCluster` is one target cluster in the fleet.

It should answer:

- What is this cluster called?
- What labels describe it?
- Which delivery backend should Kapro use?
- Is it healthy?
- Which versions are currently running?

Example:

```yaml
apiVersion: kapro.io/v1alpha1
kind: MemberCluster
metadata:
  name: prod-eu-1
  labels:
    kapro.io/tier: production
    kapro.io/region: europe-west3
spec:
  actuator:
    mode: pull
    backend: flux
    pull:
      ociRepository: app-bundle
      namespace: flux-system
```

The labels are important. Pipelines use them to select targets.

## KaproBundle

A `KaproBundle` describes the components, chart registries, defaults, and
per-cluster overrides that Kapro can promote.

Example:

```yaml
apiVersion: kapro.io/v1alpha1
kind: KaproBundle
metadata:
  name: checkout
spec:
  registries:
    - name: gar
      url: oci://europe-west3-docker.pkg.dev/my-project/charts
      provider: gcp
      interval: 5m
  components:
    - name: pos-server
      version: "5.28.0"
      repo: gar
      targetNamespace: workloads
    - name: keycloak
      version: "26.2.5"
      repo: gar
      targetNamespace: workloads
      shared: true
      prune: false
  defaults:
    timeout: 10m
    retries: 3
```

Think of `KaproBundle` as the component template. It is not the running
release, and it has no status by itself.

## Pipeline

A `Pipeline` is the reusable rollout plan.

It says:

- start with these clusters
- then move to those clusters
- wait for these gates
- limit parallelism here
- require approval there

Example:

```yaml
apiVersion: kapro.io/v1alpha1
kind: Pipeline
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

## Release

A `Release` starts execution.

It should be small and specific:

```text
Promote checkout version v1.8.2 with pipeline checkout-progressive.
```

Example shape:

```yaml
apiVersion: kapro.io/v1alpha1
kind: Release
metadata:
  name: checkout-v1-8-2
spec:
  version: "oci://europe-west3-docker.pkg.dev/my-project/bundles/checkout@sha256:a1b2..."
  pipelines:
    - name: main
      pipeline: checkout-progressive
  suspended: false
  timeout: 4h
```

After a `Release` exists, Kapro creates target state and drives the lifecycle.

## ReleaseTarget

A `ReleaseTarget` is the easiest object to debug.

It answers:

- Which release selected this cluster?
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

An `Approval` is separate from `Release` so a human decision is explicit and
auditable.

When a target reaches `WaitingApproval`, Kapro waits until the matching approval
exists and is approved.

## How the Objects Fit

<div class="kapro-diagram">
  <div class="kapro-lanes">
    <div class="kapro-lane">
      <div><strong>Config</strong><span>before release</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">MemberCluster</span><span class="kapro-cluster active">KaproBundle</span><span class="kapro-cluster active">Pipeline</span></div>
      <div class="kapro-status">ready</div>
    </div>
    <div class="kapro-lane">
      <div><strong>Intent</strong><span>start release</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">Release</span></div>
      <div class="kapro-status">created</div>
    </div>
    <div class="kapro-lane">
      <div><strong>Status</strong><span>during release</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">ReleaseTarget</span><span class="kapro-cluster">Approval</span><span class="kapro-cluster active">Events</span></div>
      <div class="kapro-status">observed</div>
    </div>
  </div>
</div>
