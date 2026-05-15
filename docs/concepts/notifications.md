---
sidebar_position: 5
---

# Events and Notifications

Kapro records release state in Kubernetes. It can also send lifecycle events to
systems outside the cluster.

Use events when another system needs to know what happened:

- chat or incident bots
- audit pipelines
- dashboards
- SIEM systems
- custom platform controllers
- GitHub Actions or repository dispatch

## What Kapro Emits

Kapro emits semantic events for important lifecycle moments:

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node">
      <strong>Release</strong>
      <span>started, completed, failed, rollback started.</span>
    </div>
    <div class="kapro-node">
      <strong>Stage</strong>
      <span>completed or blocked.</span>
    </div>
    <div class="kapro-node">
      <strong>Gate</strong>
      <span>passed, failed, or approval required.</span>
    </div>
    <div class="kapro-node">
      <strong>Target</strong>
      <span>pending, applying, converged, failed, skipped.</span>
    </div>
  </div>
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
  "type": "kapro.release.target.converged",
  "phase": "Converged",
  "release": "checkout-v1-8-2",
  "pipeline": "checkout-progressive",
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
        - kapro.release.failed
        - kapro.release.gate.failed
        - kapro.release.approval.required
      webhook:
        url: https://events.example.com/kapro
        format: cloudevents
```

## Provider and Policy APIs

Kapro also defines preview APIs for a Kubernetes-native notification model:

| Object | Meaning |
|---|---|
| `NotificationProvider` | Where events can go: webhook, Slack, email, Git, or another destination. |
| `NotificationPolicy` | When events go there: filters by event type, release label, stage, target, and phase. |

These preview resources separate destination configuration from subscription
logic. Inline notifications remain the runtime path until provider/policy
dispatch is enabled.

## Common Patterns

| Goal | Pattern |
|---|---|
| Notify SRE before production | Send `kapro.release.approval.required` to chat. |
| Keep an audit stream | Send CloudEvents to a SIEM or event broker. |
| Trigger downstream tests | Send `kapro.release.stage.completed` to a webhook receiver. |
| Explain failed releases | Include gate evidence in notifications and dashboards. |

See the [Events reference](/docs/reference/events) for the full event catalog.
