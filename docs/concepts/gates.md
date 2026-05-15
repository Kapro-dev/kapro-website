---
sidebar_position: 4
---

# Gates

A gate is a policy check that answers one question:

> May this target advance to the next phase?

Gates do not run the release. They evaluate evidence. The `ReleaseReconciler` owns timing, retries, failure policy, and phase transitions.

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node"><strong>Target selected</strong><span>A stage binds a cluster into the release.</span></div>
    <div class="kapro-node"><strong>Gate evaluates</strong><span>Signature, health, metrics, soak, approval, or custom policy.</span></div>
    <div class="kapro-node"><strong>Evidence recorded</strong><span>Result is stored in `ReleaseTarget.status.gates[]`.</span></div>
    <div class="kapro-node"><strong>Advance or stop</strong><span>Policy decides pass, retry, fail, continue, or rollback.</span></div>
  </div>
</div>

## Built-In Gates

| Gate | When it runs | What it protects |
|------|--------------|------------------|
| `verification` | Signature policy is configured. | Prevents unsigned or untrusted artifacts from promotion. |
| `health` | Target health is required. | Avoids sending changes to unhealthy or stale clusters. |
| `metrics` | Prometheus queries are configured. | Blocks promotion when error rates, latency, or SLO burn are unsafe. |
| `soak` | `soakTime` is set. | Requires observation time before a wave is considered safe. |
| `approval` | Approval is required. | Adds an explicit human decision before sensitive targets advance. |

## Gate Composition

<div class="kapro-diagram">
  <div class="kapro-grid">
    <div class="kapro-card"><strong>Automated evidence</strong><span>Metrics, health, signature checks, CEL expressions, Jobs, and webhooks.</span></div>
    <div class="kapro-card"><strong>Human judgment</strong><span>Approvals for regulated regions, production stages, or risky releases.</span></div>
    <div class="kapro-card"><strong>Failure policy</strong><span>Fail, continue with evidence, retry, or rollback depending on stage policy.</span></div>
  </div>
</div>

## Example Policy

```yaml
stages:
  - name: production
    clusterSelector:
      matchLabels:
        kapro.io/tier: production
    gate:
      soakTime: 30m
      metrics:
        - query: "rate(http_errors_total{cluster='{{.target}}'}[5m]) < 0.01"
          interval: 60s
      verification:
        cosign:
          keyRef: cosign-pub
    approval:
      required: true
      approvers:
        - sre-team
```

The important point is that gate evidence is persisted. A controller restart does not lose the fact that a target is waiting for approval, soaking, or blocked by a metric.

## Plugin Gates

External gates can be implemented through the Kapro Gate Interface (KGI). Use this when the safety decision depends on a system Kapro should not embed directly, such as a risk engine, change-management system, or internal SLO service.
