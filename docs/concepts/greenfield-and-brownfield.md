---
sidebar_position: 15
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# Greenfield and Brownfield

<ConceptDiagram id="greenfield-and-brownfield" />

Kapro supports two onboarding paths.

<div class="kapro-lesson">
  <img src="/img/logo.png" alt="Kapro mascot" />
  <div>
    <strong>Greenfield starts clean. Brownfield starts respectful.</strong>
    <p>New teams can generate a Kapro-shaped repo. Existing teams can let Kapro observe Argo or Flux first, then adopt only reviewed version fields.</p>
  </div>
</div>

Greenfield starts a new promotion repository from Kapro conventions.
Brownfield connects to existing Argo CD or Flux topology without taking it over
on day one.

## Two Paths

<div class="kapro-map">
  <div class="kapro-map-row">
    <div class="kapro-map-item"><strong>Greenfield</strong><span>Generate clusters, backends, sources, plans, and starter runs.</span></div>
    <div class="kapro-arrow">|</div>
    <div class="kapro-map-item"><strong>Brownfield Observe</strong><span>Discover existing Argo/Flux objects without writes.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>Brownfield Adopt</strong><span>Allow reviewed version-field writes.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>Promotion flow</strong><span>Both paths end in PromotionSource, PromotionPlan, PromotionRun, and PromotionTarget.</span></div>
  </div>
</div>

## Greenfield Bootstrap

Use greenfield when a team wants Kapro to create starter promotion files:

```bash
kapro init ./promotion-repo --backend argo --name checkout
kapro init ./promotion-repo --backend flux --name checkout --mode pull
kapro init ./promotion-repo --backend argo --name checkout --clusters none
```

The generated repository can include backend profiles, cluster inventory,
promotion sources, PromotionPlans, gates, and a starter PromotionRun.

## Brownfield Connect

Use brownfield when a team already has Argo CD or Flux objects:

```bash
kapro discover argo . --out kapro-connect --name checkout --namespace argocd
kapro discover flux . --out kapro-connect --name checkout-flux --namespace flux-system
```

`kapro adopt argo` is the higher-level alias for teams thinking in migration
terms:

```bash
kapro adopt argo . --out kapro-connect --name checkout
```

Brownfield has three phases:

| Phase | Meaning |
|---|---|
| Observe | Discover and report existing backend objects. No backend writes. |
| Adopt | Write only the reviewed version field for selected promotion units. |
| Manage | Optionally use stronger Kapro conventions for teams that want generated wiring. |

## Trust Rule

Greenfield should be easy to start. Brownfield should be easy to trust.

That is why discovery generates reviewable files such as:

```text
backends/<name>-observe.yaml
sources/<name>.yaml
discovery/<backend>-discovery.yaml
discovery/kapro-git-map.yaml
```

Review those files before changing `managementPolicy` from `Observe` to
`Adopt`.
