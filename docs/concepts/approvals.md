---
sidebar_position: 10
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# Approvals

<ConceptDiagram id="approvals" />

An `Approval` is the explicit human decision for a target that is waiting at a
manual gate.

<div class="kapro-lesson">
  <img src="/img/logo.png" alt="Kapro mascot" />
  <div>
    <strong>An Approval is a signed permission slip.</strong>
    <p>The target is already selected, but Kapro pauses before applying. A human or trusted approval workflow says yes or no, and Kapro records that decision.</p>
  </div>
</div>

Kapro keeps approvals as their own object so the decision is auditable and can
be governed by RBAC, admission, and policy.

## Sequence

<div class="kapro-sequence">
  <div class="kapro-sequence-row">
    <div class="kapro-step"><strong>Target reaches gate</strong><span>PromotionTarget enters WaitingApproval.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-step"><strong>Person reviews</strong><span>Evidence, stage, version, and target are inspected.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-step"><strong>Approval object</strong><span>A decision is created with approver and reason.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-step"><strong>Target continues</strong><span>Kapro moves to apply or fails on rejection.</span></div>
  </div>
</div>

<div class="kapro-impact">
  <div class="kapro-impact-item"><strong>Impacts PromotionTarget</strong><span>Unblocks or rejects one selected target.</span></div>
  <div class="kapro-impact-item"><strong>Impacts audit</strong><span>The decision is a Kubernetes object with metadata.</span></div>
  <div class="kapro-impact-item"><strong>Impacts RBAC</strong><span>Teams can limit who may approve production stages.</span></div>
</div>

## When It Is Used

A stage can require manual approval:

```yaml
gate:
  mode: manual
  approval:
    required: true
    approvers: ["sre-team"]
```

When a selected target reaches that stage, Kapro moves the target to
`WaitingApproval` and waits for the matching approval decision.

## Decision Shape

An approval answers:

- which PromotionRun is being approved;
- which target is being approved;
- who approved or rejected it;
- why the decision was made;
- when it happened.

## What Approval Does Not Do

Approval does not apply the artifact directly. It only unblocks the Kapro state
machine. After approval, the target still goes through backend apply and
backend convergence checks.

## Debugging

```bash
kubectl get approvals
kubectl describe approval <approval>
kubectl get promotiontargets -l kapro.io/promotionrun=<PromotionRun> -o wide
```

If a target remains in `WaitingApproval`, confirm the approval exists, refers to
the expected PromotionRun and target, and was not rejected.
