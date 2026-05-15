---
sidebar_position: 5
---

# Notifications

Kapro emits lifecycle events at every phase transition. These events drive integrations with chat systems, audit pipelines, incident management tools, and custom controllers.

## Delivery Methods

### Webhook

Send events as HTTP POST requests to any endpoint. Supports plain JSON and CloudEvents v1.0 structured JSON format.

### Slack

Send formatted messages to Slack channels via incoming webhooks.

### Email

Send email notifications for approval requests and release lifecycle events.

## CloudEvents Support

When `format: cloudevents` is set, webhooks send CloudEvents v1.0 structured JSON. CloudEvents IDs are stable for de-duplication.

## NotificationProvider and NotificationPolicy (Preview)

Kubernetes-native APIs for separating notification destination from subscription logic:

- **NotificationProvider**: Declares _where_ events can be sent (webhook, slack, email, git).
- **NotificationPolicy**: Declares _when_ events should be sent. Filters by event type, Release labels, pipelines, stages, targets, and phases.

These APIs are in preview. Inline gate notifications continue to be the active runtime configuration path.

## Integration Patterns

| Integration | Recommended pattern |
|---|---|
| Slack or Teams bot | Receive CloudEvents and render selected event types |
| Git audit log | Commit a compact YAML record on kapro.release.completed |
| SIEM / audit sink | Ingest all CloudEvents and index by source, subject, and type |
| GitHub Actions | Use a small webhook receiver to trigger repository_dispatch |

See the [Events reference](/docs/reference/events) for the complete event catalog.
