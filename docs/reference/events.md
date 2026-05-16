---
sidebar_position: 2
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# Events

<ConceptDiagram id="events" />

Kapro emits semantic lifecycle events through configured notifications. These
events are intended for audit systems, chat/incident bots, dashboards, SIEM
PromotionPlans, and custom platform controllers.

`Event.Type` is the stable integration contract. `Event.Phase` is the internal
FSM state that caused the event.

## Configure a CloudEvents Webhook

```yaml
gate:
  mode: manual
  notifications:
    - type: webhook
      events:
        - kapro.PromotionRun.failed
        - kapro.PromotionRun.stage.completed
        - kapro.PromotionRun.gate.failed
        - kapro.PromotionRun.approval.required
      webhook:
        url: https://events.example.com/kapro
        format: cloudevents
```

Use `format: json` or omit `format` to receive the plain Kapro event payload.
Use `format: cloudevents` to receive CloudEvents v1.0 structured JSON.

## Event Types

| Event type | Emitted when | Scope |
|---|---|---|
| `kapro.PromotionRun.started` | A PromotionRun transitions from Pending to Progressing. | PromotionRun |
| `kapro.PromotionRun.completed` | All PromotionPlans in a PromotionRun complete. | PromotionRun |
| `kapro.PromotionRun.failed` | A PromotionRun reaches Failed, including timeout. | PromotionRun |
| `kapro.PromotionRun.rollback.started` | A rollback target is created for a previously converged target. | Target |
| `kapro.PromotionRun.stage.completed` | A stage first reaches Complete. | Stage |
| `kapro.PromotionRun.gate.passed` | A verification, soak, metrics, or template gate passes. | Target |
| `kapro.PromotionRun.gate.failed` | A verification, metrics, or template gate fails. | Target |
| `kapro.PromotionRun.approval.required` | A target reaches WaitingApproval and approval links are sent. | Target |
| `kapro.PromotionRun.target.pending` | A target enters Pending. | Target |
| `kapro.PromotionRun.target.verification` | A target enters Verification. | Target |
| `kapro.PromotionRun.target.health_check` | A target enters HealthCheck. | Target |
| `kapro.PromotionRun.target.soaking` | A target enters Soaking. | Target |
| `kapro.PromotionRun.target.metrics_check` | A target enters MetricsCheck. | Target |
| `kapro.PromotionRun.target.applying` | A target enters Applying. | Target |
| `kapro.PromotionRun.target.converged` | A target reaches Converged. | Target |
| `kapro.PromotionRun.target.failed` | A target reaches Failed. | Target |
| `kapro.PromotionRun.target.skipped` | A target is skipped after `onFailure=continue`. | Target |

## Plain JSON Payload

Plain webhook notifications send the `data` object directly:

```json
{
  "type": "kapro.PromotionRun.target.converged",
  "phase": "Converged",
  "version": "oci://registry.example.com/checkout@sha256:...",
  "target": "prod-eu",
  "PromotionRun": "checkout-v1-2-3",
  "PromotionPlan": "main",
  "stage": "production-eu",
  "message": "target converged"
}
```

## CloudEvents Payload

CloudEvents webhooks use structured content mode:

```json
{
  "specversion": "1.0",
  "type": "kapro.PromotionRun.target.converged",
  "source": "/kapro/promotionruns/checkout-v1-2-3",
  "id": "PromotionRun/checkout-v1-2-3/type/kapro.PromotionRun.target.converged/PromotionPlan/main/stage/production-eu/target/prod-eu/phase/Converged",
  "time": "2026-05-14T10:23:00Z",
  "subject": "PromotionPlan/main/stage/production-eu/target/prod-eu",
  "data": {
    "type": "kapro.PromotionRun.target.converged",
    "phase": "Converged",
    "version": "oci://registry.example.com/checkout@sha256:...",
    "target": "prod-eu",
    "PromotionRun": "checkout-v1-2-3",
    "PromotionPlan": "main",
    "stage": "production-eu",
    "message": "target converged"
  }
}
```

The CloudEvents `id` is stable for a given PromotionRun, event type, PromotionPlan, stage,
target, and phase. Consumers can use it for best-effort de-duplication.

## Integration Patterns

| Integration | Recommended pattern |
|---|---|
| Slack or Teams bot | Receive CloudEvents and render selected event types. |
| Git audit log | Commit a compact YAML record on `kapro.PromotionRun.completed`. |
| SIEM / audit sink | Ingest all CloudEvents and index by `source`, `subject`, and `type`. |
| GitHub Actions | Use a small webhook receiver to trigger `repository_dispatch`. |
| Knative Eventing | Point the webhook at a broker-compatible ingress adapter. |

## Core Boundary

Kapro core emits events; it does not own every downstream integration. Prefer
small external consumers for Git commits, ticketing systems, SIEM routing, and
organization-specific policy workflows.
