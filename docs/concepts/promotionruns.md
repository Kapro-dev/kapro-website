---
sidebar_position: 7
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# PromotionRuns

<ConceptDiagram id="promotionruns" />

A `PromotionRun` is one execution of a promotion plan.

<div class="kapro-lesson">
  <img src="/img/logo.png" alt="Kapro mascot" />
  <div>
    <strong>A PromotionRun is "move this version now."</strong>
    <p>The plan is reusable. The PromotionRun is one actual attempt. It points at the plan, names the version, and becomes the parent of the target-by-target work.</p>
  </div>
</div>

It says which version or unit versions should move and which PromotionPlan should
control the movement.

## What Happens Internally

<div class="kapro-sequence">
  <div class="kapro-sequence-row">
    <div class="kapro-step"><strong>1. Read intent</strong><span>PromotionRun says which version or unit versions should move.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-step"><strong>2. Resolve plan</strong><span>Kapro loads the PromotionPlan and its stages.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-step"><strong>3. Select clusters</strong><span>Stage selectors match FleetCluster labels.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-step"><strong>4. Create targets</strong><span>Each selected cluster gets a PromotionTarget.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-step"><strong>5. Aggregate status</strong><span>The PromotionRun summarizes target progress.</span></div>
  </div>
</div>

<div class="kapro-impact">
  <div class="kapro-impact-item"><strong>Impacts PromotionTarget</strong><span>Targets inherit the selected version and plan/stage context.</span></div>
  <div class="kapro-impact-item"><strong>Impacts backend</strong><span>The backend only runs after Kapro allows a target to apply.</span></div>
  <div class="kapro-impact-item"><strong>Impacts operators</strong><span>This is the object to watch for overall rollout status.</span></div>
</div>

## Mental Model

```text
promote checkout api=1.5.0 and web=main-20260515 using checkout-progressive
```

The `PromotionRun` is the owner of execution. Kapro reads it, resolves its PromotionPlan
and `PromotionSource`, selects target clusters, evaluates gates, calls the
backend adapter, and records status.

## Example

```yaml
apiVersion: kapro.io/v1alpha1
kind: PromotionRun
metadata:
  name: checkout-v1-8-2
spec:
  versions:
    api: "1.5.0"
    web: "main-20260515"
  promotionplans:
    - checkout-progressive
  suspended: false
  timeout: 4h
```

Use `spec.version` when every `PromotionUnit` should receive the same version.
Use `spec.versions` when units move independently.

## Manual and Automated Creation

PromotionRuns can be created directly from the hub config repository, or created by
a `PromotionTrigger` after an artifact observation passes policy.

Both paths use the same PromotionRun lifecycle. Automation creates PromotionRun intent; it
does not bypass planning, gates, approvals, backend apply, or convergence
checks.

## Debugging

Start with:

```bash
kubectl describe PromotionRun checkout-v1-8-2
kubectl get promotiontargets -l kapro.io/promotionrun=checkout-v1-8-2 -o wide
```

The PromotionRun tells you the overall outcome. PromotionTarget objects tell you where the
rollout is blocked.
