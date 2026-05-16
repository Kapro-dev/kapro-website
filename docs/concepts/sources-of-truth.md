---
sidebar_position: 2
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# Sources of Truth

<ConceptDiagram id="sources-of-truth" />

Kapro separates the fleet configuration from the runtime artifact.

<div class="kapro-lesson">
  <img src="/img/logo.png" alt="Kapro mascot" />
  <div>
    <strong>Different places own different truths.</strong>
    <p>Git owns the map, OCI owns immutable artifacts, Argo or Flux owns local reconciliation, and the hub cluster owns live Kapro status.</p>
  </div>
</div>

This is the first concept to understand because it explains why Kapro does not
act like a CI pipeline and does not require spoke clusters to watch the hub
config repository.

## Ownership Map

<div class="kapro-map">
  <div class="kapro-map-row">
    <div class="kapro-map-item"><strong>Hub config Git</strong><span>Clusters, plans, sources, triggers, policies, plugins.</span></div>
    <div class="kapro-join">+</div>
    <div class="kapro-map-item"><strong>OCI registry</strong><span>Immutable images, charts, or artifacts.</span></div>
    <div class="kapro-join">+</div>
    <div class="kapro-map-item"><strong>Backend Git</strong><span>Argo and Flux native objects and version fields.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>Hub status</strong><span>What Kapro is doing now and what happened.</span></div>
  </div>
</div>

## The Split

| Source | Owns |
|---|---|
| Hub config Git repository | Clusters, backend profiles, promotion sources, promotion units, PromotionPlans, triggers, plugins, notification policy, agent policy, and PromotionRun intent. |
| Backend-native Git repositories | Argo CD Applications, ApplicationSets, Flux objects, HelmRelease files, and version fields that remain native to those systems. |
| OCI registry | Immutable image, chart, or release artifact digests. |
| Hub cluster etcd | Applied desired state and observed status. |

Git answers what the fleet should look like and where each backend-native
version field lives. OCI answers which immutable artifact version can be
promoted when teams use OCI release artifacts. The hub cluster records what
Kapro is currently doing and what has already happened.

## Hub Config Git

The hub config repository should contain reviewable Kubernetes manifests:

```text
clusters/
backends/
sources/
promotionplans/
triggers/
plugins/
notifications/
policies/
promotionruns/
```

CI validates those manifests and applies them to the hub cluster. Teams that
already run Flux on the hub can let Flux apply the same repository.

`BackendProfile` objects tell Kapro which backend it is allowed to observe,
adopt, or drive. `PromotionSource` objects define the deployable
`PromotionUnit` list and the backend-native fields Kapro may change.

## OCI Runtime Artifacts

Kapro PromotionRuns point to immutable OCI references, usually by digest:

```text
oci://registry.example.com/promotions/checkout@sha256:a1b2...
```

The artifact can represent the packaging model your delivery backend expects:
an image, chart, manifest artifact, or another immutable runtime artifact.
Git-native backends can also promote explicit fields such as a Git revision,
Helm chart version, or Kustomize image tag through `PromotionUnit` mappings.

## Spokes Stay Simple

Spoke clusters do not need to watch the hub config repository. They consume the
selected version through Argo CD, Flux, or a plugin-backed backend adapter and
report heartbeat, current version, and convergence status back to the hub.
