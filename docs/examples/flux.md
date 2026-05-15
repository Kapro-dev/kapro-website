---
sidebar_position: 1
---

# Flux Example

Flux is the reference delivery backend for Kapro.

In this example, Kapro decides when a cluster may receive `checkout:v1.8.2`.
Flux does the local reconciliation inside the target cluster.

## Flow

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node"><strong>Release</strong><span>Kapro selects checkout:v1.8.2.</span></div>
    <div class="kapro-node"><strong>Gate</strong><span>Canary passes health, soak, or approval checks.</span></div>
    <div class="kapro-node"><strong>Flux actuator</strong><span>Kapro patches Flux-facing configuration.</span></div>
    <div class="kapro-node"><strong>Flux reconcile</strong><span>Flux applies the workload and reports readiness.</span></div>
  </div>
</div>

## 1. Register a Flux Target Cluster

The `MemberCluster` tells Kapro which backend to use for the target.

```yaml
apiVersion: kapro.io/v1alpha1
kind: MemberCluster
metadata:
  name: checkout-canary
  labels:
    kapro.io/tier: canary
    kapro.io/region: europe-west3
spec:
  actuator:
    mode: pull
    backend: flux
    pull:
      ociRepository: app-bundle
      namespace: flux-system
```

Read it as:

- this cluster is a canary target
- Kapro should use the Flux backend
- the spoke cluster should pull the selected OCI bundle through `app-bundle`

## 2. Define the Component Bundle

```yaml
apiVersion: kapro.io/v1alpha1
kind: KaproBundle
metadata:
  name: checkout
spec:
  registries:
    - name: platform
      url: oci://registry.example.com/platform/charts
      provider: generic
      interval: 5m
  components:
    - name: checkout-api
      repo: platform
      version: "v1.8.2"
      targetNamespace: checkout
```

`KaproBundle` is the reusable component template. The running rollout starts
when you create a `Release`.

## 3. Define a Progressive Pipeline

```yaml
apiVersion: kapro.io/v1alpha1
kind: Pipeline
metadata:
  name: checkout-flux-progressive
spec:
  stages:
    - name: canary
      selector:
        matchLabels:
          kapro.io/tier: canary
      gate:
        mode: auto

    - name: production
      selector:
        matchLabels:
          kapro.io/tier: production
      strategy:
        maxParallel: 2
      dependsOn:
        - stage: canary
          requiredSoakTime: 30m
      gate:
        mode: manual
        approval:
          required: true
          approvers: ["sre-team"]
```

This gives you:

<div class="kapro-diagram">
  <div class="kapro-lanes">
    <div class="kapro-lane">
      <div><strong>canary</strong><span>auto</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">checkout-canary</span></div>
      <div class="kapro-status">first</div>
    </div>
    <div class="kapro-lane">
      <div><strong>production</strong><span>approval</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster">prod-eu</span><span class="kapro-cluster">prod-us</span><span class="kapro-cluster">prod-apac</span></div>
      <div class="kapro-status waiting">after soak</div>
    </div>
  </div>
</div>

## 4. Create a Release

```yaml
apiVersion: kapro.io/v1alpha1
kind: Release
metadata:
  name: checkout-v1-8-2
spec:
  version: "oci://registry.example.com/bundles/checkout@sha256:a1b2..."
  pipelines:
    - name: main
      pipeline: checkout-flux-progressive
  suspended: false
  timeout: 4h
```

## 5. Watch the Result

```bash
kubectl get releases,releasetargets
kubectl describe release checkout-v1-8-2
kubectl get releasetargets -l kapro.io/release=checkout-v1-8-2 -o wide
```

Expected progression:

```text
checkout-canary -> Applying -> Converged
prod-eu         -> WaitingApproval
prod-us         -> Pending
prod-apac       -> Pending
```

After approval, production targets move through `Applying` and `Converged`.

## What Flux Still Owns

Flux still owns:

- fetching sources
- pulling OCI artifacts
- applying manifests
- reconciling workloads
- reporting local readiness

Kapro owns:

- selecting the version
- ordering targets
- evaluating gates
- tracking convergence
- recording status and events
