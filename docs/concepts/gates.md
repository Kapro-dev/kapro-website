---
sidebar_position: 4
---

# Gates

A gate is a stateless evaluator that answers: "May this target advance to the next FSM phase?"

## Interface

```go
type Gate interface {
    Evaluate(ctx context.Context, req Request) (Result, error)
}
```

`Result.Phase` is one of `Passed`, `Failed`, `Running`, or `Inconclusive`. All timing, retry, and failure policy live in the ReleaseReconciler -- the gate just evaluates and returns.

## Built-in Gates

| Gate | Activation | Description |
|------|-----------|-------------|
| `soak` | `Stage.gate.soakTime` is set | Time-based gate. Target must remain in the Soaking phase for the configured duration. |
| `metrics` | `Stage.gate.metrics` has queries | Evaluates Prometheus queries. All queries must return passing values. |
| `approval` | `Stage.approval.required` is true | Checks for an `Approval` CR with the deterministic name `<release>-<target>`. |
| `verification` | `Stage.gate.verification` is configured | Validates OCI artifact signatures using cosign. |

## Template Gates

Template gates use a `GateTemplate` CRD and support multiple dispatch mechanisms:

| Type | Description |
|------|-------------|
| `cel` | Evaluate a CEL expression against target and release context. |
| `job` | Run a Kubernetes Job and check its exit code. |
| `webhook` | Call an external HTTP endpoint and check the response. |

## Gate Policy

Gates are configured per-stage in the Pipeline:

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

## Failure Handling

Each gate supports failure policies:

- **onFailure: fail** (default) -- The target transitions to Failed.
- **onFailure: continue** -- The gate failure is recorded but the target advances.
- **onFailure: rollback** -- The target is rolled back to the previous version.

Gate state is persisted in `ReleaseTarget.status.gates[]` in etcd. Controller restarts do not lose gate progress.

## Plugin Gates

External gates can be implemented as gRPC plugins using the KGI (Kapro Gate Interface) contract:

- Proto definition: `spec/kgi/v1alpha1/gate.proto`
- Conformance suite: `conformance/gate/`
