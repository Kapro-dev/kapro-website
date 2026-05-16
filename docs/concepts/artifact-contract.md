---
sidebar_position: 3
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# Version Contract

<ConceptDiagram id="artifact-contract" />

Kapro promotes one selected version across many clusters and backend objects.

<div class="kapro-lesson">
  <img src="/img/logo.png" alt="Kapro mascot" />
  <div>
    <strong>The version contract is the thing being carried.</strong>
    <p>Kapro can carry one version for every unit, or a different version per unit. Either way, the value must be explicit so every target can prove what it received.</p>
  </div>
</div>

For OCI-centered flows, the version is an immutable artifact reference published
by CI. For Git-native Argo CD and Flux flows, the version can be a specific
field value in a `PromotionUnit`, such as an Application `targetRevision`, Helm
chart version, Git revision, or Kustomize image tag. Kapro decides when and
where that exact value may move.

## How It Connects

<div class="kapro-map">
  <div class="kapro-map-row">
    <div class="kapro-map-item"><strong>CI or registry</strong><span>Produces an image, chart, digest, or tag.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>PromotionTrigger or human</strong><span>Chooses the version for a PromotionRun.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>PromotionUnit</strong><span>Maps the version to a backend field.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>PromotionTarget</strong><span>Records desired and observed versions.</span></div>
  </div>
</div>

## What Kapro Expects

A PromotionRun version should be explicit and inspectable:

```yaml
spec:
  version: "oci://registry.example.com/promotions/checkout@sha256:a1b2..."
```

Digest pinning matters because every target should converge to the same version.
Tags can be observed by `PromotionTrigger`, but the created `PromotionRun` should point
to the resolved digest.

Multi-unit applications can use per-unit versions:

```yaml
spec:
  versions:
    api: "v1.8.2"
    worker: "v1.8.1"
    checkout-web: "sha256:a1b2..."
```

Each key must match a `PromotionUnit` name in the selected `PromotionSource`.
Kapro writes the value to the unit's declared backend field and records target
status for that unit.

## What Kapro Does Not Do

Kapro does not:

- build images;
- render manifests;
- choose application dependencies;
- replace Helm, Flux, Argo CD, Flagger, or Argo Rollouts;
- manage in-cluster traffic shifting directly.

Those systems still own local delivery mechanics. Kapro owns the fleet-level
permission to move a version.

## Verification

Artifact verification can happen before a target advances. Gates and triggers
can require signature or provenance evidence before creating or progressing a
PromotionRun.

That evidence is recorded in status so operators can answer why a version moved
or why it was blocked.
