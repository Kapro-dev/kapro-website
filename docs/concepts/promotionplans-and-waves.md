---
sidebar_position: 3
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# PromotionPlans and Waves

<ConceptDiagram id="promotionplans-and-waves" />

A PromotionPlan is a PromotionRun plan. A wave is a stage inside that plan.

<div class="kapro-lesson">
  <img src="/img/logo.png" alt="Kapro mascot" />
  <div>
    <strong>A PromotionPlan is the route map.</strong>
    <p>It does not carry a version by itself. It tells Kapro which clusters are first, which clusters wait, which gates must pass, and how many targets may move at once.</p>
  </div>
</div>

Kapro uses PromotionPlans to answer:

```text
Which clusters should receive this version first, next, and last?
```

## How It Connects

<div class="kapro-map">
  <div class="kapro-map-row">
    <div class="kapro-map-item"><strong>FleetCluster labels</strong><span>Cluster facts: canary, prod, region, team.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>PromotionPlan stages</strong><span>Selectors turn labels into waves.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>Gates</strong><span>Policy, health, metrics, soak, approval.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>PromotionTargets</strong><span>Kapro creates one target per selected cluster.</span></div>
  </div>
</div>

<div class="kapro-impact">
  <div class="kapro-impact-item"><strong>Controls order</strong><span>`dependsOn` decides when later stages can start.</span></div>
  <div class="kapro-impact-item"><strong>Controls blast radius</strong><span>`maxParallel` limits how many clusters move together.</span></div>
  <div class="kapro-impact-item"><strong>Controls trust</strong><span>Gate config decides what must be checked before apply.</span></div>
</div>

## The Smallest PromotionPlan

A one-stage PromotionPlan selects every production cluster and promotes them:

```yaml
apiVersion: kapro.io/v1alpha1
kind: PromotionPlan
metadata:
  name: checkout-production
spec:
  stages:
    - name: production
      selector:
        matchLabels:
          kapro.io/tier: production
```

That is useful for demos, but most real fleets need waves.

## A Three-Wave PromotionPlan

<div class="kapro-diagram">
  <div class="kapro-lanes">
    <div class="kapro-lane">
      <div><strong>canary</strong><span>lowest risk</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">canary-eu</span></div>
      <div class="kapro-status">first</div>
    </div>
    <div class="kapro-lane">
      <div><strong>production-eu</strong><span>regional</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">prod-eu-1</span><span class="kapro-cluster">prod-eu-2</span></div>
      <div class="kapro-status">second</div>
    </div>
    <div class="kapro-lane">
      <div><strong>production-global</strong><span>rest of fleet</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster">prod-us</span><span class="kapro-cluster">prod-apac</span><span class="kapro-cluster">edge</span></div>
      <div class="kapro-status waiting">last</div>
    </div>
  </div>
</div>

YAML:

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
          strategy: all
      gate:
        mode: manual
        approval:
          required: true
          approvers: ["sre-team"]

    - name: production-global
      selector:
        matchLabels:
          kapro.io/tier: production
      strategy:
        maxParallel: 10
      dependsOn:
        - stage: production-eu
          requiredSoakTime: 1h
          strategy: all
```

## Labels Select Clusters

Stages do not list every target by hand. They select clusters by labels.

Example clusters:

```yaml
metadata:
  name: canary-eu
  labels:
    kapro.io/tier: canary
    kapro.io/region: europe-west3
---
metadata:
  name: prod-eu-1
  labels:
    kapro.io/tier: production
    kapro.io/region: europe-west3
```

Example selector:

```yaml
selector:
  matchLabels:
    kapro.io/tier: production
    kapro.io/region: europe-west3
```

This is the same mental model as Kubernetes labels and selectors.

## Dependencies Control Order

`dependsOn` says one stage must wait for another stage.

```yaml
dependsOn:
  - stage: canary
    requiredSoakTime: 30m
    strategy: all
```

Read it as:

> Start this stage only after canary has completed and stayed healthy for 30 minutes.

## Parallelism Controls Blast Radius

`maxParallel` limits how many targets in a stage can run at the same time:

```yaml
strategy:
  maxParallel: 5
```

Use small values for risky stages and larger values for low-risk or edge waves.

## Common PromotionPlan Shapes

| Shape | Use it for |
|---|---|
| `canary -> production` | Simple two-step production rollout. |
| `canary -> region -> global` | Multi-region platforms. |
| `dev -> staging -> production` | Environment-style promotion. |
| `pilot stores -> region -> all stores` | Edge or retail fleets. |
| `shadow -> canary -> production` | AI or data-plane changes where observation comes first. |

## Debugging a PromotionPlan

When a PromotionPlan does not progress, check:

1. Did the stage selector match any `FleetCluster` objects?
2. Is the dependency stage complete?
3. Is `requiredSoakTime` still running?
4. Is `maxParallel` already full?
5. Is a gate blocking a target?

Useful commands:

```bash
kubectl get fleetclusters --show-labels
kubectl describe PromotionPlan checkout-progressive
kubectl get promotiontargets -l kapro.io/promotionrun=checkout-v1-8-2 -o wide
```
