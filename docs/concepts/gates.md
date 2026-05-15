---
sidebar_position: 4
---

# Gates

A gate is a safety check for one target.

It answers:

```text
May this cluster continue now?
```

Gates do not run the rollout. The `ReleaseReconciler` runs the lifecycle.
Gates only return a decision with evidence.

## The Gate Model

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node">
      <strong>Evidence</strong>
      <span>Metric value, signature result, approval state, soak timer, webhook answer.</span>
    </div>
    <div class="kapro-node">
      <strong>Analysis</strong>
      <span>Kapro compares evidence with the configured rule.</span>
    </div>
    <div class="kapro-node">
      <strong>Phase</strong>
      <span>The gate returns passed, failed, running, or inconclusive.</span>
    </div>
    <div class="kapro-node">
      <strong>Policy</strong>
      <span>The release either advances, waits, retries, fails, continues, or rolls back.</span>
    </div>
  </div>
</div>

The phase controls rollout. Evidence explains the decision.

## Built-In Gate Types

| Gate | Use it when | Example |
|---|---|---|
| Verification | You only want trusted artifacts to move. | Cosign signature or provenance check. |
| Health | You do not want to deploy into a broken cluster. | MemberCluster heartbeat is fresh and workloads are ready. |
| Metrics | You want telemetry to block bad versions. | Error rate below threshold, SLO burn rate safe. |
| Soak | You want time between waves. | Wait 30 minutes after canary before production. |
| Approval | You need a human decision. | SRE approves production or regulated regions. |
| CEL / Job / Webhook | You need custom policy. | Ask an internal risk service or run a Kubernetes Job. |

## Gate Outcomes

| Result | Meaning |
|---|---|
| `Passed` | The target may move to the next phase. |
| `Running` | The gate is still waiting or collecting evidence. |
| `Inconclusive` | The gate cannot decide safely yet. Missing data should not become success. |
| `Failed` | The target must stop or follow failure policy. |

Kapro is conservative by default. If evidence is missing, stale, or unsafe to
interpret, the gate should not silently pass.

## Example: Canary to Production

<div class="kapro-diagram">
  <div class="kapro-lanes">
    <div class="kapro-lane">
      <div><strong>canary</strong><span>automated</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">signature</span><span class="kapro-cluster active">health</span><span class="kapro-cluster active">metrics</span></div>
      <div class="kapro-status">passed</div>
    </div>
    <div class="kapro-lane">
      <div><strong>production</strong><span>manual</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">soak 30m</span><span class="kapro-cluster">approval</span></div>
      <div class="kapro-status waiting">waiting</div>
    </div>
  </div>
</div>

The canary stage can be fully automated. Production can require a soak window
and a human approval before Kapro asks the backend to apply the version.

## Example Gate Policy

```yaml
stages:
  - name: production-eu
    selector:
      matchLabels:
        kapro.io/tier: production
        kapro.io/region: europe-west3
    dependsOn:
      - stage: canary
        requiredSoakTime: 30m
    gate:
      mode: manual
      approval:
        required: true
        approvers:
          - sre-team
```

In plain language:

1. Select production clusters in `europe-west3`.
2. Wait for the `canary` stage.
3. Require 30 minutes of soak.
4. Require an approval from `sre-team`.

## Evidence Is Part of the API

Gate evidence is stored in target status. It can include:

- provider name
- query
- window
- observed value
- threshold
- sample count
- reason
- confidence
- baseline value

Evidence must not include tokens, headers, secrets, or raw webhook payloads.

That evidence is useful for humans, dashboards, notifications, and future agent
workflows. It explains why Kapro moved or stopped.
