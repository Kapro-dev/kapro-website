---
sidebar_position: 3
sidebar_label: Backend Adapters
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# Backend Adapters

<ConceptDiagram id="actuators" />

A backend adapter connects Kapro to the tool that applies a selected version.

<div class="kapro-lesson">
  <img src="/img/logo.png" alt="Kapro mascot" />
  <div>
    <strong>A backend adapter is the translator.</strong>
    <p>Kapro speaks in promotion decisions. Argo, Flux, and internal platforms speak their own APIs and files. The adapter translates one selected target into the backend's language.</p>
  </div>
</div>

Kapro decides **when** a target may receive a version. The adapter translates
that decision into backend-specific work for Argo CD, Flux, or an external
backend.

## The Boundary

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node">
      <strong>Kapro decision</strong>
      <span>prod-eu may receive checkout:v1.8.2.</span>
    </div>
    <div class="kapro-node">
      <strong>Backend adapter</strong>
      <span>Patch the declared Git field or call the backend API.</span>
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

The adapter does not own PromotionRun ordering. It does not decide whether the next
cluster should start. It only applies one selected version to one selected
target.

## Why This Exists

Different platform teams use different delivery backends:

- Flux
- Argo CD
- Helm
- Flux Operator `ResourceSet`
- internal deployment systems

Kapro should not become a copy of every delivery backend. The adapter boundary
keeps Kapro focused on fleet promotion while still integrating with those
systems.

## Built-In Shape

Each `Kapro` workload or PromotionRun path declares delivery through
`spec.delivery`, and each backend is described by a `BackendProfile`:

| Field | Meaning |
|---|---|
| `mode` | Who initiates delivery, for example `push` or `pull`. |
| `backendRef` | The `BackendProfile` to use, such as `argo`, `flux`, or an external profile. |
| `parameters` | Backend-specific values that stay opaque to the shared API. |

`PromotionSource` and `PromotionUnit` objects then describe the specific
backend-native files, objects, and version fields Kapro may update.

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

## Plugin Adapters

External backend adapters use the Kapro Actuator Interface, or KAI.

The contract stays intentionally small:

```text
Apply(version, target)
IsConverged(version, target)
Rollback(previousVersion, target)
```

That makes plugins easy to reason about. A plugin can integrate a backend, but
it cannot take over Kapro PromotionRun state.

Platform teams register external adapters with `PluginRegistration` and should
run the KAI conformance harness before enabling a plugin image in production.
When the plugin gateway is enabled, ready adapter registrations can be loaded
at operator startup.
