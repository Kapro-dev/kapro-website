---
sidebar_position: 5
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# Hub Config Repository Example

<ConceptDiagram id="hub-config-repository" />

Source repository:

- [Hub config example](https://github.com/Kapro-dev/kapro-example-hub-config)

This example shows how to store Kapro hub objects in Git and apply them in a
reviewable order.

## Layout

```text
clusters/       FleetCluster inventory
backends/       BackendProfile objects for Argo, Flux, or external backends
sources/        PromotionSource and PromotionUnit mappings
promotionplans/      PromotionPlan rollout plans
triggers/       PromotionTrigger automation rules
plugins/        PluginRegistration manifests
notifications/  NotificationProvider and NotificationPolicy manifests
policies/       AgentPolicy and future policy manifests
promotionruns/       PromotionRun objects
```

## Flow

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node"><strong>Pull request</strong><span>Change fleet config in Git.</span></div>
    <div class="kapro-node"><strong>Validate</strong><span>Check YAML and review the rollout intent.</span></div>
    <div class="kapro-node"><strong>Apply</strong><span>Apply inventory, backends, sources, integrations, PromotionPlans, triggers, then PromotionRuns.</span></div>
    <div class="kapro-node"><strong>Kapro hub</strong><span>Runs the promotion across member clusters.</span></div>
  </div>
</div>

## Apply Order

```bash
kubectl apply -f clusters/
kubectl apply -f backends/
kubectl apply -f sources/
kubectl apply -f plugins/
kubectl apply -f notifications/
kubectl apply -f policies/
kubectl apply -f promotionplans/
kubectl apply -f triggers/
kubectl apply -f promotionruns/
```

The source repo includes a manual GitHub Actions workflow that can apply the
same order to a hub cluster when a kubeconfig secret is configured.

The example repository is Argo-oriented: `backends/` declares the Argo backend,
`sources/` maps application units to Argo-native fields, and `promotionruns/`
contains the version intent that Kapro moves through the selected PromotionPlan.
