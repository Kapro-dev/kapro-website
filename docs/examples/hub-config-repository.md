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

<div class="kapro-diagram">
  <div class="kapro-grid">
    <div class="kapro-card"><strong>clusters/</strong><span>FleetCluster inventory and labels.</span></div>
    <div class="kapro-card"><strong>backends/</strong><span>BackendProfile objects for Argo, Flux, or plugins.</span></div>
    <div class="kapro-card"><strong>sources/</strong><span>PromotionSource and PromotionUnit mappings.</span></div>
    <div class="kapro-card"><strong>promotionplans/</strong><span>Reusable rollout stages, waves, and gates.</span></div>
    <div class="kapro-card"><strong>triggers/</strong><span>PromotionTrigger automation rules.</span></div>
    <div class="kapro-card"><strong>promotionruns/</strong><span>Reviewed version intent that starts movement.</span></div>
    <div class="kapro-card"><strong>plugins/</strong><span>PluginRegistration manifests.</span></div>
    <div class="kapro-card"><strong>notifications/</strong><span>Notification providers and policies.</span></div>
    <div class="kapro-card"><strong>policies/</strong><span>AgentPolicy and future policy manifests.</span></div>
  </div>
</div>

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
