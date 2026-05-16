---
sidebar_position: 6
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# Retail Fleet Example

<ConceptDiagram id="retail-fleet" />

Source repository:

- [Retail fleet example](https://github.com/Kapro-dev/kapro-example-retail-fleet)

This example is a richer, domain-specific rollout for store clusters.

```text
pilot stores -> Germany stores -> global stores
```

## Why This Example Exists

Retail fleets often have many clusters, different country risk profiles, and
shared infrastructure components. Kapro lets the platform team encode those
rules once as labels, stages, gates, and concurrency limits.

The example keeps the existing Argo CD ApplicationSet files as the delivery
source of truth. Kapro adds a `BackendProfile` for Argo and a `PromotionSource`
that maps store-facing units, such as `pos-server`, to reviewed Git generator
fields.

## Flow

<div class="kapro-diagram">
  <div class="kapro-lanes">
    <div class="kapro-lane">
      <div><strong>pilot-stores</strong><span>small blast radius</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">pilot-store-berlin</span></div>
      <div class="kapro-status">first</div>
    </div>
    <div class="kapro-lane">
      <div><strong>germany-stores</strong><span>manual approval</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster">store-de-001</span></div>
      <div class="kapro-status waiting">after soak</div>
    </div>
    <div class="kapro-lane">
      <div><strong>global-stores</strong><span>maxParallel: 25</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster">store-us-001</span><span class="kapro-cluster">more stores</span></div>
      <div class="kapro-status waiting">last</div>
    </div>
  </div>
</div>

## What It Demonstrates

- label-based cluster selection
- Argo CD brownfield adoption with backend-native files left in place
- `PromotionSource` units for store application components
- manual approval for a country wave
- shared release artifacts across store clusters
- component-level ordering with waves and dependencies
- fleet rollout speed control with `maxParallel`
