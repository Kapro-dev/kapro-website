---
sidebar_position: 5
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# BackendProfiles

<ConceptDiagram id="backend-profiles" />

`BackendProfile` is the selectable delivery backend contract.

<div class="kapro-lesson">
  <img src="/img/logo.png" alt="Kapro mascot" />
  <div>
    <strong>A BackendProfile tells Kapro which delivery tool it may talk to.</strong>
    <p>Kapro owns the promotion decision. Argo, Flux, or a plugin owns the local apply mechanics. BackendProfile is the bridge between those worlds.</p>
  </div>
</div>

It lets Kapro talk about Argo CD, Flux, or an external backend without hard
wiring backend-specific fields into every promotion object.

## How It Connects

<div class="kapro-map">
  <div class="kapro-map-row">
    <div class="kapro-map-item"><strong>FleetCluster</strong><span>Points to a backendRef.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>BackendProfile</strong><span>Defines driver, runtime, discovery, and parameters.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>PromotionSource</strong><span>Maps backend-native objects and write fields.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>Backend adapter</strong><span>Applies or verifies one PromotionTarget.</span></div>
  </div>
</div>

<div class="kapro-impact">
  <div class="kapro-impact-item"><strong>Impacts discovery</strong><span>`Observe` discovers without writing.</span></div>
  <div class="kapro-impact-item"><strong>Impacts adoption</strong><span>`Adopt` allows reviewed version-field writes.</span></div>
  <div class="kapro-impact-item"><strong>Impacts runtime</strong><span>Hub, spoke, or plugin runtime affects where apply happens.</span></div>
</div>

## What It Defines

```yaml
apiVersion: kapro.io/v1alpha1
kind: BackendProfile
metadata:
  name: argo
spec:
  driver: argo
  runtime: Hub
```

| Field | Meaning |
|---|---|
| `driver` | Backend family: `argo`, `flux`, or `external`. |
| `runtime` | Where the adapter can run: `Hub`, `Spoke`, or `Both`. |
| `pluginRef` | PluginRegistration name when `driver: external`. |
| `discovery` | Observe or adopt existing backend-native objects. |
| `parameters` | Backend-specific defaults, such as Argo namespace. |

## Observe Before Adopt

Brownfield connection starts in observe mode:

```yaml
spec:
  driver: argo
  runtime: Hub
  parameters:
    namespace: argocd
  discovery:
    enabled: true
    managementPolicy: Observe
    selector:
      matchLabels:
        kapro.io/import: "true"
```

`Observe` lets Kapro count and report backend-native objects without writing to
them. `Adopt` is the explicit step that lets Kapro write the documented version
field for selected promotion targets.

## Discovery Status

`BackendProfile.status` records bounded evidence:

- discovered clusters;
- discovered Applications and ApplicationSets;
- selected objects;
- skipped objects;
- unsupported patterns;
- discovery errors;
- `DiscoveryReady` conditions.

Counts are the scale signal. Samples help operators review what Kapro found.
