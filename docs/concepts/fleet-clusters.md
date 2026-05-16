---
sidebar_position: 4
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# FleetClusters

<ConceptDiagram id="fleet-clusters" />

A `FleetCluster` is one target cluster in the fleet.

<div class="kapro-lesson">
  <img src="/img/logo.png" alt="Kapro mascot" />
  <div>
    <strong>A FleetCluster is a named landing spot.</strong>
    <p>Kapro does not say "send this version everywhere." It looks at cluster labels, picks the matching landing spots, and then creates one PromotionTarget for each selected cluster.</p>
  </div>
</div>

PromotionPlans do not name every target by hand. They select `FleetCluster` objects
by label, the same way Kubernetes controllers select Pods by label.

## How It Connects

<div class="kapro-map">
  <div class="kapro-map-row">
    <div class="kapro-map-item"><strong>FleetCluster labels</strong><span>tier=production, region=europe-west3</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>PromotionPlan selector</strong><span>Choose clusters with matching labels.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>PromotionTarget</strong><span>One runtime state object per selected cluster.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>BackendProfile</strong><span>Argo, Flux, or plugin applies the version.</span></div>
  </div>
</div>

<div class="kapro-impact">
  <div class="kapro-impact-item"><strong>Impacts planning</strong><span>Wrong labels mean the cluster is skipped or selected in the wrong stage.</span></div>
  <div class="kapro-impact-item"><strong>Impacts safety</strong><span>Health and heartbeat tell Kapro whether a target is safe to use.</span></div>
  <div class="kapro-impact-item"><strong>Impacts backend writes</strong><span>`delivery.backendRef` decides which backend adapter is used.</span></div>
</div>

## What It Describes

A `FleetCluster` should answer:

- what the cluster is called;
- which region, tier, cloud, tenant, or compliance zone it belongs to;
- which backend profile should apply selected versions;
- whether the cluster is healthy;
- which versions are currently observed.

## Example

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

`mode` says where delivery runs. `backendRef` points to a `BackendProfile`.
`parameters` are backend-specific and follow the StorageClass pattern: Kapro
core does not interpret them directly.

## Selection

A PromotionPlan stage selects clusters with labels:

```yaml
selector:
  matchLabels:
    kapro.io/tier: production
    kapro.io/region: europe-west3
```

Every selected cluster becomes a PromotionTarget when the stage is eligible.

## Onboarding

You can create `FleetCluster` manifests in Git, or use provider-specific
onboarding helpers. For GKE Fleet, `kapro fleet sync` can discover Fleet
memberships and create `FleetCluster` resources for bulk onboarding.
