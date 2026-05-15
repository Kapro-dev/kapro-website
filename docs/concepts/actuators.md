---
sidebar_position: 3
---

# Actuators

An actuator connects Kapro to the tool that applies a version inside a cluster.

Kapro decides **when** a target may receive a version. The actuator translates
that decision into backend-specific work.

## The Boundary

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node">
      <strong>Kapro decision</strong>
      <span>prod-eu may receive checkout:v1.8.2.</span>
    </div>
    <div class="kapro-node">
      <strong>Actuator</strong>
      <span>Patch the backend object or call the backend API.</span>
    </div>
    <div class="kapro-node">
      <strong>Backend</strong>
      <span>Flux, Argo CD, Helm, or an internal system reconciles locally.</span>
    </div>
    <div class="kapro-node">
      <strong>Status</strong>
      <span>The target reports whether the selected version converged.</span>
    </div>
  </div>
</div>

The actuator does not own release ordering. It does not decide whether the next
cluster should start. It only applies one selected version to one selected
target.

## Why This Exists

Different platform teams use different delivery backends:

- Flux
- Argo CD
- Helm
- Flux Operator `ResourceSet`
- internal deployment systems

Kapro should not become a copy of every delivery backend. The actuator boundary
keeps Kapro focused on fleet promotion while still integrating with those
systems.

## Built-In Shape

Each `MemberCluster` declares how Kapro should deliver to it:

| Field | Meaning |
|---|---|
| `mode` | Who initiates delivery, for example `push` or `pull`. |
| `backend` | Which system applies the change, for example `flux`. |
| backend config | The specific object, namespace, field, or parameter to patch. |

The reference backend is Flux-oriented.

## Push and Pull

Kapro supports two delivery shapes:

<div class="kapro-diagram">
  <div class="kapro-split">
    <div class="kapro-card">
      <strong>Push mode</strong>
      <span>The hub or spoke controller patches a backend object for the target, such as a Flux Operator ResourceSet input.</span>
    </div>
    <div class="kapro-card">
      <strong>Pull mode</strong>
      <span>The spoke's local GitOps controllers pull the selected OCI artifact and reconcile from inside the cluster.</span>
    </div>
  </div>
</div>

Both modes keep the same Kapro model: one target, one selected version, one
convergence result.

## Plugin Actuators

External actuators use the Kapro Actuator Interface, or KAI.

The contract stays intentionally small:

```text
Apply(version, target)
IsConverged(version, target)
Rollback(previousVersion, target)
```

That makes plugins easy to reason about. A plugin can integrate a backend, but
it cannot take over Kapro release state.
