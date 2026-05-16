---
sidebar_position: 1
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# Flux Brownfield Example

<ConceptDiagram id="flux" />

The old standalone Flux pull and push example repositories are retired because
they used an API that is no longer part of Kapro.

Flux support in the current backend-neutral architecture is documented through
the Kapro source tree and E2E scripts: `BackendProfile`, `PromotionSource`,
`PromotionUnit`, Git-native discovery, and observe-first adoption.

Retired repositories:

- [Flux pull example](https://github.com/Kapro-dev/kapro-example-flux-pull)
- [Flux push example](https://github.com/Kapro-dev/kapro-example-flux-push)

## Brownfield Shape

Existing Flux files stay native:

```text
platform-gitops/
  flux/
    sources/
    kustomizations/
    helmreleases/
  kapro/
    backends/flux-observe.yaml
    sources/checkout.yaml
    promotionplans/checkout.yaml
    promotionruns/
```

Kapro discovers Flux topology, generates a `PromotionSource`, and writes only
reviewed version fields after adoption.

## Discover Flux

```bash
kapro discover flux . \
  --out ./kapro-connect \
  --name checkout-flux \
  --namespace flux-system \
  --selector kapro.io/import=true,team=checkout
```

Flux `Kustomization` objects are discovered as topology, but they are not
universal PromotionRun-version fields. Promote the referenced source revision,
Kustomize image tag, Helm chart version, or another explicit field in the
generated `PromotionSource`.

## Promotion Unit Examples

```yaml
apiVersion: kapro.io/v1alpha1
kind: PromotionSource
metadata:
  name: checkout-flux
spec:
  backendRef: flux
  units:
    - name: api
      backendKind: GitYAMLField
      namespace: flux-system
      sourcePath: flux/sources/api-gitrepository.yaml
      versionField: spec.ref.tag
    - name: payments
      backendKind: GitYAMLField
      namespace: flux-system
      sourcePath: flux/helmreleases/payments.yaml
      versionField: spec.chart.spec.version
    - name: web-image
      backendKind: KustomizeImage
      sourcePath: apps/web/kustomization.yaml
      versionField: ghcr.io/example/checkout-web
```

## What Flux Still Owns

Flux still owns source credentials, reconciliation, inventory, health, drift
correction, workload apply behavior, and local readiness.

Kapro owns promotion order, gates, approvals, PromotionRun history, and evidence.

## E2E Proof

Run the Git-native mapping proof:

```bash
scripts/flux-git-e2e.sh
```

Run the live Flux controller proof:

```bash
scripts/verify-install.sh flux-e2e
```

The live E2E creates a disposable Kind cluster, installs real Flux controllers,
serves a Git fixture inside the cluster, runs `kapro adopt flux`, applies a
generated mapping from `v1` to `v2`, pushes the Git change, and waits for Flux
to reconcile the workload to `v2`.
