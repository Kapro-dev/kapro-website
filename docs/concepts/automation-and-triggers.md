---
sidebar_position: 8
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# Automation and Triggers

<ConceptDiagram id="automation-and-triggers" />

Kapro automation is intentionally guarded.

<div class="kapro-lesson">
  <img src="/img/logo.png" alt="Kapro mascot" />
  <div>
    <strong>A PromotionTrigger is a doorbell, not a deploy button.</strong>
    <p>When a new artifact appears, the trigger can ring the bell and create a PromotionRun. The normal plan, gates, approvals, and backend checks still decide what happens next.</p>
  </div>
</div>

A `PromotionTrigger` can observe an OCI artifact source and create a `PromotionRun`,
but it does not bypass the normal Kapro PromotionPlan. The created PromotionRun still
passes through target planning, gates, approvals, backend apply, convergence
checks, notifications, and status.

## Safe Flow

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node"><strong>OCI source</strong><span>A tag appears in the registry.</span></div>
    <div class="kapro-node"><strong>Trigger policy</strong><span>Tag pattern, signature, cooldown, max-active, and scope are checked.</span></div>
    <div class="kapro-node"><strong>Digest-pinned PromotionRun</strong><span>Kapro creates PromotionRun intent from a template.</span></div>
    <div class="kapro-node"><strong>Normal PromotionPlan</strong><span>Stages, gates, approvals, plugins, and backend apply run as usual.</span></div>
  </div>
</div>

## Sequence

<div class="kapro-sequence">
  <div class="kapro-sequence-row">
    <div class="kapro-step"><strong>Artifact appears</strong><span>OCI tag or digest is observed.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-step"><strong>Trigger checks policy</strong><span>Pattern, signature, cooldown, max-active, dry-run.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-step"><strong>PromotionRun is created</strong><span>Usually digest-pinned and initially suspended.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-step"><strong>Plan takes over</strong><span>Stages, gates, approvals, targets, backend apply.</span></div>
  </div>
</div>

Detection does not equal deployment. Triggers are suspended by default, and the
PromotionRuns they create are suspended by default unless the template says
otherwise.

## What PromotionTrigger Controls

| Field area | Purpose |
|---|---|
| `source.type` | Source backend. The current preview source is `oci`. |
| `source.oci.repository` | OCI repository to observe. |
| `source.oci.tagPattern` | Regular expression for tags that may create PromotionRuns. |
| `source.oci.requireSignature` | Requires signature verification before PromotionRun creation. |
| `promotionrunTemplate` | PromotionPlans, scope, labels, annotations, timeout, and suspended state for created PromotionRuns. |
| `cooldown` | Minimum time between PromotionRuns from the same trigger. |
| `maxActive` | Limit on non-terminal PromotionRuns created by this trigger. |
| `dryRun` | Records what would happen without creating a PromotionRun. |

## Example

```yaml
apiVersion: kapro.io/v1alpha1
kind: PromotionTrigger
metadata:
  name: checkout-oci
spec:
  suspended: true
  source:
    type: oci
    oci:
      repository: oci://registry.example.com/platform/checkout
      tagPattern: "^v[0-9]+\\.[0-9]+\\.[0-9]+$"
      requireSignature: true
      pollInterval: 5m
  promotionrunTemplate:
    nameTemplate: "checkout-{{ .ShortDigest }}"
    promotionplans:
      - name: production
        promotionplan: checkout-production
    suspended: true
    scope:
      targets:
        - checkout-canary-eu
    labels:
      kapro.io/team: checkout
  cooldown: 30m
  maxActive: 1
  dryRun: true
```

Use `dryRun: true` and `suspended: true` while validating a trigger. After the
observed artifact, status conditions, and generated PromotionRun template are correct,
the platform team can make an intentional change to enable creation or
unsuspend created PromotionRuns.

## Why OCI Is the Runtime Contract

Kapro uses Git for hub configuration and OCI for runtime artifacts.

Git answers:

- which clusters exist;
- which labels and rollout stages select them;
- which gates, plugins, notifications, and policies are active;
- which PromotionRuns or triggers are allowed.

OCI answers:

- which immutable artifact digest should run;
- whether the artifact satisfies signature policy;
- which exact version all selected clusters should converge to.

This keeps CI from becoming the deployment orchestrator. CI publishes an
artifact; Kapro decides when and where that artifact may move.
