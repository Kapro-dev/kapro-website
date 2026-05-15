---
sidebar_position: 3
---

# Actuators

An actuator drives the "apply this version to this cluster" step. It is the bridge between Kapro's promotion decisions and the actual delivery backend.

## Interface

```go
type Actuator interface {
    Apply(ctx context.Context, req ApplyRequest) error
    IsConverged(ctx context.Context, cluster *MemberCluster, version, appKey string) (bool, error)
    Rollback(ctx context.Context, cluster *MemberCluster, previousVersion, appKey string) error
    ApplyDelta(ctx context.Context, req DeltaApplyRequest) (int, error)
    IsAllConverged(ctx context.Context, cluster *MemberCluster, desiredVersions map[string]string) (bool, error)
}
```

## Mode and Backend

Actuators are identified by a `mode/backend` string:

- **mode** describes _how_ the version reaches the target: `push` (hub writes to the spoke) or `pull` (spoke observes and converges).
- **backend** identifies the delivery system: `flux`, `argo`, `helm`, etc.

The reference implementation is `push/flux`.

## Flux Actuator (push/flux)

The built-in Flux actuator:

1. Writes `MemberCluster.spec.desiredVersion` on the hub cluster.
2. The spoke's `kapro-cluster-controller` observes the change.
3. The spoke controller patches the local Flux `OCIRepository` + `Kustomization` to point at the new version.
4. Flux reconciles the workloads.
5. The spoke reports convergence back through `MemberCluster.status.currentVersions`.

Kapro then checks `IsConverged` to confirm the target has reached the desired version.

## Plugin Actuators

External actuators can be implemented as gRPC plugins using the KAI (Kapro Actuator Interface) contract:

- Proto definition: `spec/kai/v1alpha1/actuator.proto`
- Conformance suite: `conformance/actuator/`

Register a plugin by creating a `PluginRegistration` resource with `spec.type: actuator` and the gRPC endpoint.

The in-process actuator contract is a Preview surface. See the [API stability](/docs/reference/api-stability) page before depending on it across minor releases.
