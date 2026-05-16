---
sidebar_position: 7
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# PromotionUnits

<ConceptDiagram id="promotion-units" />

A `PromotionUnit` is one deployable unit inside a `PromotionSource`.

<div class="kapro-lesson">
  <img src="/img/logo.png" alt="Kapro mascot" />
  <div>
    <strong>A PromotionUnit is one thing inside the app that can move.</strong>
    <p>Checkout may have an API, worker, web image, and chart version. Kapro needs names for those pieces so a PromotionRun can say exactly which versions move.</p>
  </div>
</div>

This is the concept that lets Kapro promote more than one application component
without inventing a backend-specific model for every tool.

## Mental Model

<div class="kapro-map">
  <div class="kapro-map-row">
    <div class="kapro-map-item"><strong>PromotionSource checkout</strong><span>The app contract.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>unit api</strong><span>Argo Application targetRevision.</span></div>
    <div class="kapro-map-item"><strong>unit worker</strong><span>Argo Application targetRevision.</span></div>
    <div class="kapro-map-item"><strong>unit web-image</strong><span>Kustomize image tag.</span></div>
  </div>
</div>

A PromotionRun can set one default version, or specific versions per unit.

<div class="kapro-impact">
  <div class="kapro-impact-item"><strong>Impacts PromotionRun</strong><span>`spec.versions` keys must match unit names.</span></div>
  <div class="kapro-impact-item"><strong>Impacts backend writes</strong><span>Each unit maps to one reviewed field Kapro may change.</span></div>
  <div class="kapro-impact-item"><strong>Impacts debugging</strong><span>Status can show which unit/version mapping converged.</span></div>
</div>

## Example Unit

```yaml
units:
  - name: pos-server
    backendKind: GitJSONField
    namespace: argocd
    sourcePath: argocd/applicationsets/store-checkout.yaml
    versionField: argocd/environments/*.json:posServerVersion
```

Read that as: the `pos-server` unit is promoted by changing the
`posServerVersion` field in selected Argo ApplicationSet generator input files.

## PromotionRun Versions

Use `spec.version` when every unit should receive the same version:

```yaml
spec:
  version: 1.5.0
```

Use `spec.versions` when units move independently:

```yaml
spec:
  promotionplans:
    - checkout
  versions:
    api: 1.5.0
    web: main-20260515
    pos-server: 5.28.0
```

Kapro records target status for the PromotionRun, and backend evidence should show
which unit/version mappings converged.

## Common Unit Kinds

| Unit kind | Where it comes from |
|---|---|
| `ArgoApplicationSource` | Existing Argo CD Application source revision. |
| `GitJSONField` | JSON file field used by an ApplicationSet generator or other Git-native backend config. |
| `GitYAMLField` | YAML file field used by Flux, Argo, Helm, or platform config. |
| `KustomizeImage` | `images[].newTag` in a Kustomize file. |
| Generated Helm unit | Greenfield source unit rendered for Flux-style pull mode. |

The unit name is the stable API. Backend-specific file paths and fields are the
write contract that Kapro must not exceed.
