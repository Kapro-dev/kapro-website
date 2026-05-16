---
sidebar_position: 8
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# PromotionTargets

<ConceptDiagram id="promotion-targets" />

A `PromotionTarget` is one selected cluster inside one PromotionRun.

<div class="kapro-lesson">
  <img src="/img/logo.png" alt="Kapro mascot" />
  <div>
    <strong>A PromotionTarget is one landing attempt.</strong>
    <p>If a PromotionRun is "move checkout v1.8.2", then a PromotionTarget is "move checkout v1.8.2 to prod-eu-1 and prove it worked."</p>
  </div>
</div>

This is the most useful object for day-to-day debugging because it narrows the
question from "why is the PromotionRun stuck?" to "which target is blocked and why?"

## How It Connects

<div class="kapro-map">
  <div class="kapro-map-row">
    <div class="kapro-map-item"><strong>PromotionRun</strong><span>Parent intent and desired version.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>PromotionPlan stage</strong><span>The selected wave and gate rules.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>FleetCluster</strong><span>The concrete cluster being changed.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>Backend adapter</strong><span>Applies the version to Argo, Flux, or a plugin backend.</span></div>
  </div>
</div>

## What It Represents

```text
checkout-v1-8-2 / canary-eu -> Converged
checkout-v1-8-2 / prod-eu   -> WaitingApproval
checkout-v1-8-2 / prod-us   -> Pending
```

Each target moves independently through the lifecycle:

<div class="kapro-state-machine">
  <div class="kapro-state-row">
    <div class="kapro-state"><strong>Pending</strong><span>Selected but waiting.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-state"><strong>Checking</strong><span>Policy, health, metrics, soak.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-state waiting"><strong>WaitingApproval</strong><span>Human decision if required.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-state"><strong>Applying</strong><span>Backend receives version.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-state good"><strong>Converged</strong><span>Target is healthy on the version.</span></div>
  </div>
</div>

The exact path depends on the PromotionPlan stage and gate policy.

## What To Inspect

A target should explain:

- selected cluster;
- selected version;
- current phase;
- gate evidence;
- approval state;
- backend adapter status;
- backend convergence;
- failure reason, if any.

## Useful Commands

```bash
kubectl get promotiontargets -l kapro.io/promotionrun=<PromotionRun> -o wide
kubectl describe promotiontarget <target>
kubectl get promotiontarget <target> -o yaml
```

If a target is blocked, read the target phase first, then inspect the gate or
backend evidence recorded on the target.
