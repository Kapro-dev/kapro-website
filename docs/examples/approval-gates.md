---
sidebar_position: 4
---

# Approval and Gate Example

This example shows how Kapro pauses a target until automated evidence and human
approval are both present.

Source repositories:

- [Progressive rollout example](https://github.com/Kapro-dev/kapro-example-progressive-rollout)
- [Retail fleet example](https://github.com/Kapro-dev/kapro-example-retail-fleet)

## Goal

Canary should move automatically. Production should wait.

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node"><strong>Canary</strong><span>Health and metrics pass automatically.</span></div>
    <div class="kapro-node"><strong>Soak</strong><span>Wait 30 minutes after canary.</span></div>
    <div class="kapro-node"><strong>Approval</strong><span>SRE approves production.</span></div>
    <div class="kapro-node"><strong>Production</strong><span>Actuator applies the version.</span></div>
  </div>
</div>

## Pipeline Snippet

```yaml
apiVersion: kapro.io/v1alpha1
kind: Pipeline
metadata:
  name: checkout-approval
spec:
  stages:
    - name: canary
      selector:
        matchLabels:
          kapro.io/tier: canary
      gate:
        mode: auto

    - name: production
      selector:
        matchLabels:
          kapro.io/tier: production
      dependsOn:
        - stage: canary
          requiredSoakTime: 30m
      strategy:
        maxParallel: 1
      gate:
        mode: manual
        approval:
          required: true
          approvers:
            - sre-team
```

## What Operators See

Before approval:

```text
checkout-canary -> Converged
prod-eu         -> WaitingApproval
prod-us         -> Pending
```

After approval:

```text
checkout-canary -> Converged
prod-eu         -> Applying -> Converged
prod-us         -> Applying -> Converged
```

`maxParallel: 1` means production targets move one at a time.

## Why Approval Is a CRD

Approval is not a hidden click in a web UI. It is Kubernetes state.

That means the release history can show:

- which target required approval
- who or what approved it
- when the approval arrived
- whether the release advanced or stopped afterward

## Gate Evidence

Kapro stores gate evidence with the target. A production target might have:

| Gate | Evidence |
|---|---|
| Signature | artifact digest and verification result |
| Health | target cluster heartbeat and workload readiness |
| Metrics | query, window, observed value, threshold |
| Soak | start time and required duration |
| Approval | approval object and decision |

This is what makes the release explainable.

## Failure Policy

When a gate fails, a stage policy can decide whether to:

- fail the release
- retry later
- continue with evidence
- roll back

For production, prefer conservative defaults:

```text
fail closed, require approval, use low maxParallel
```

For low-risk canary stages, you can automate more aggressively.
