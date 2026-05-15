---
sidebar_position: 3
---

# Progressive Rollout Example

This example builds a rollout from zero to a full fleet.

The goal:

```text
checkout:v1.8.2 -> canary -> Europe production -> global production
```

## Step 1: Label the Fleet

Use labels to describe each cluster.

```yaml
apiVersion: kapro.io/v1alpha1
kind: MemberCluster
metadata:
  name: canary-eu
  labels:
    kapro.io/tier: canary
    kapro.io/region: europe-west3
---
apiVersion: kapro.io/v1alpha1
kind: MemberCluster
metadata:
  name: prod-eu
  labels:
    kapro.io/tier: production
    kapro.io/region: europe-west3
---
apiVersion: kapro.io/v1alpha1
kind: MemberCluster
metadata:
  name: prod-us
  labels:
    kapro.io/tier: production
    kapro.io/region: us-central1
```

## Step 2: Draw the Rollout

<div class="kapro-diagram">
  <div class="kapro-lanes">
    <div class="kapro-lane">
      <div><strong>Wave 1</strong><span>canary</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">canary-eu</span></div>
      <div class="kapro-status">small blast radius</div>
    </div>
    <div class="kapro-lane">
      <div><strong>Wave 2</strong><span>Europe</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster">prod-eu</span></div>
      <div class="kapro-status waiting">after canary</div>
    </div>
    <div class="kapro-lane">
      <div><strong>Wave 3</strong><span>global</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster">prod-us</span><span class="kapro-cluster">prod-apac</span></div>
      <div class="kapro-status waiting">after Europe</div>
    </div>
  </div>
</div>

## Step 3: Encode the Pipeline

```yaml
apiVersion: kapro.io/v1alpha1
kind: Pipeline
metadata:
  name: checkout-three-wave
spec:
  stages:
    - name: canary
      selector:
        matchLabels:
          kapro.io/tier: canary

    - name: europe
      selector:
        matchLabels:
          kapro.io/tier: production
          kapro.io/region: europe-west3
      dependsOn:
        - stage: canary
          requiredSoakTime: 30m
          strategy: all

    - name: global
      selector:
        matchLabels:
          kapro.io/tier: production
      strategy:
        maxParallel: 5
      dependsOn:
        - stage: europe
          requiredSoakTime: 1h
          strategy: all
```

## Step 4: Add a Gate

Production can require approval:

```yaml
gate:
  mode: manual
  approval:
    required: true
    approvers:
      - sre-team
```

Production can also add metrics:

```yaml
gate:
  mode: auto
  metrics:
    - name: error-rate
      query: rate(http_requests_total{status=~"5.."}[5m])
      threshold: "0.01"
      interval: 60s
```

Use the exact metric fields supported by your Kapro release. The important
model is that the gate returns evidence and Kapro records it.

## Step 5: Create the Release

```yaml
apiVersion: kapro.io/v1alpha1
kind: Release
metadata:
  name: checkout-v1-8-2
spec:
  appRef:
    name: checkout
  version: "v1.8.2"
  pipelineRef:
    name: checkout-three-wave
```

## Step 6: Watch It Move

```bash
kubectl get releasetargets -l kapro.io/release=checkout-v1-8-2 -o wide
```

Expected timeline:

| Time | What happens |
|---|---|
| Start | Canary target is created and activated. |
| Canary converged | Europe stage becomes eligible after soak. |
| Europe approved | Europe target applies and converges. |
| Europe soaked | Global targets begin, limited by `maxParallel`. |
| End | Release is completed or failed with evidence. |
