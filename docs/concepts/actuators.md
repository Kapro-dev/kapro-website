---
sidebar_position: 3
---

# Actuators

An actuator is the bridge between Kapro's promotion decision and the delivery backend that applies the version.

Kapro decides **when** a cluster may receive a version. The actuator decides **how** to ask the local delivery system to converge.

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node"><strong>Kapro decision</strong><span>Target is allowed to receive version `v1.8.2`.</span></div>
    <div class="kapro-node"><strong>Actuator apply</strong><span>Patch Flux, Argo CD, Helm, or a plugin backend.</span></div>
    <div class="kapro-node"><strong>Local reconcile</strong><span>The backend applies manifests and workloads converge.</span></div>
    <div class="kapro-node"><strong>Status report</strong><span>Convergence is written back to Kapro status.</span></div>
  </div>
</div>

## Built-In Flow: Flux

The reference actuator flow is Flux-oriented:

1. Kapro writes the desired version for the target.
2. The spoke controller observes that desired version.
3. The spoke patches local Flux resources, such as `OCIRepository` and `Kustomization`.
4. Flux reconciles workloads in the target cluster.
5. The spoke reports the currently running version and convergence state.

This means Kapro does not replace Flux. It gives Flux a fleet-level promotion decision to execute.

## Backend Shape

Actuators are identified by a mode/backend pair:

| Part | Meaning |
|---|---|
| `mode` | How the version reaches the target, for example `push` or `pull`. |
| `backend` | The delivery system, for example `flux`, `argo`, or `helm`. |

The reference implementation is `push/flux`.

## Plugin Actuators

External actuators can be implemented through the Kapro Actuator Interface (KAI). Use plugins when the backend is internal, proprietary, or has a release protocol Kapro should not compile into the core operator.

The contract stays small:

- Apply this version.
- Report whether the target converged.
- Roll back if policy requires it.

That boundary keeps Kapro focused on promotion orchestration instead of becoming another delivery engine.
