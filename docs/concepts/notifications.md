---
sidebar_position: 5
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# Events and Notifications

<ConceptDiagram id="notifications" />

Kapro records PromotionRun state in Kubernetes. It can also send lifecycle events to
systems outside the cluster.

<div class="kapro-lesson">
  <img src="/img/logo.png" alt="Kapro mascot" />
  <div>
    <strong>Events are Kapro telling the room what happened.</strong>
    <p>The controller writes status for machines and emits events for people, audit systems, dashboards, and automation that need to react.</p>
  </div>
</div>

Use events when another system needs to know what happened:

- chat or incident bots
- audit PromotionPlans
- dashboards
- SIEM systems
- custom platform controllers
- GitHub Actions or repository dispatch

## What Kapro Emits

Kapro emits semantic events for important lifecycle moments:

<div class="kapro-map">
  <div class="kapro-map-row">
    <div class="kapro-map-item"><strong>PromotionRun</strong><span>started, completed, failed, rollback started.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>Stage</strong><span>completed or blocked.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>Gate</strong><span>passed, failed, or approval required.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>Target</strong><span>pending, applying, converged, failed, skipped.</span></div>
  </div>
</div>

<div class="kapro-impact">
  <div class="kapro-impact-item"><strong>Impacts people</strong><span>Approval and incident channels receive the right context.</span></div>
  <div class="kapro-impact-item"><strong>Impacts audit</strong><span>CloudEvents can feed SIEM or Git audit streams.</span></div>
  <div class="kapro-impact-item"><strong>Impacts automation</strong><span>Downstream tests can react to stage or target completion.</span></div>
</div>

The event type is the stable integration signal. The phase tells you which
target lifecycle state caused it.

## Plain JSON or CloudEvents

Webhook notifications can be sent as plain JSON or CloudEvents v1.0 structured
JSON.

CloudEvents are useful when events flow through shared infrastructure such as
Knative Eventing, SIEM pipelines, or organization-wide event routers.

Example event:

```json
{
  "type": "kapro.PromotionRun.target.converged",
  "phase": "Converged",
  "PromotionRun": "checkout-v1-8-2",
  "PromotionPlan": "checkout-progressive",
  "stage": "production-eu",
  "target": "prod-eu",
  "version": "oci://registry.example.com/checkout@sha256:...",
  "message": "target converged"
}
```

## Notification Configuration

Inline gate notifications are the active runtime path today:

```yaml
gate:
  mode: manual
  notifications:
    - type: webhook
      events:
        - kapro.PromotionRun.failed
        - kapro.PromotionRun.gate.failed
        - kapro.PromotionRun.approval.required
      webhook:
        url: https://events.example.com/kapro
        format: cloudevents
```

## Provider and Policy APIs

Kapro also defines preview APIs for a Kubernetes-native notification model:

| Object | Meaning |
|---|---|
| `NotificationProvider` | Where events can go: webhook, Slack, email, Git, or another destination. |
| `NotificationPolicy` | When events go there: filters by event type, PromotionRun label, stage, target, and phase. |

These preview resources separate destination configuration from subscription
logic. Inline notifications remain the runtime path until provider/policy
dispatch is enabled.

## Common Patterns

| Goal | Pattern |
|---|---|
| Notify SRE before production | Send `kapro.PromotionRun.approval.required` to chat. |
| Keep an audit stream | Send CloudEvents to a SIEM or event broker. |
| Trigger downstream tests | Send `kapro.PromotionRun.stage.completed` to a webhook receiver. |
| Explain failed PromotionRuns | Include gate evidence in notifications and dashboards. |

See the [Events reference](/docs/reference/events) for the full event catalog.
