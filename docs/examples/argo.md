---
sidebar_position: 2
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# Argo CD Brownfield Example

<ConceptDiagram id="argo" />

Argo CD is the current public example path for Kapro brownfield adoption.

Source repositories:

- [Argo CD pattern example](https://github.com/Kapro-dev/kapro-example-argo-pattern)
- [Hub config example](https://github.com/Kapro-dev/kapro-example-hub-config)
- [Progressive rollout example](https://github.com/Kapro-dev/kapro-example-progressive-rollout)
- [Retail fleet example](https://github.com/Kapro-dev/kapro-example-retail-fleet)

## What The Example Shows

The Argo pattern repository contains common objects users already have:

- a plain Argo `Application`;
- an `ApplicationSet` with Git file generator input;
- an app-of-apps root that should be observed but not promoted directly.

Kapro adds the promotion layer around that topology:

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node"><strong>BackendProfile</strong><span>Observe Argo Applications, ApplicationSets, and cluster Secrets.</span></div>
    <div class="kapro-node"><strong>PromotionSource</strong><span>Map units to targetRevision or Git generator fields.</span></div>
    <div class="kapro-node"><strong>PromotionPlan</strong><span>Define canary, regional, and production waves.</span></div>
    <div class="kapro-node"><strong>PromotionRun</strong><span>Promote one or more unit versions.</span></div>
  </div>
</div>

## Repository Layout

```text
argocd/     Existing Argo CD Application, ApplicationSet, and env files
backends/   Observe-first Argo BackendProfile
sources/    PromotionSource mappings generated from the Argo repo shape
promotionplans/  Kapro PromotionPlan that drives promotion
promotionruns/   PromotionRun intent
```

## Discover Existing Argo Topology

```bash
kapro adopt argo . --out kapro-connect --name checkout --force
```

This generates reviewable Kapro files:

```text
kapro-connect/backends/checkout-observe.yaml
kapro-connect/sources/checkout.yaml
kapro-connect/discovery/argo-discovery.yaml
kapro-connect/discovery/kapro-git-map.yaml
```

Start in observe mode. Review selected, skipped, and unsupported objects before
switching a backend profile to `managementPolicy: Adopt`.

## Promotion Units

An Argo `PromotionSource` can contain units like:

```yaml
apiVersion: kapro.io/v1alpha1
kind: PromotionSource
metadata:
  name: checkout
spec:
  backendRef: argo
  units:
    - name: api
      backendKind: ArgoApplicationSource
      namespace: argocd
      sourcePath: argocd/application.yaml
      versionField: spec.source.targetRevision
    - name: pos-server
      backendKind: GitJSONField
      namespace: argocd
      sourcePath: argocd/applicationset.yaml
      versionField: argocd/environments/*.json:posServerVersion
```

The first unit changes an Application revision. The second changes a Git file
that feeds an ApplicationSet generator.

## What Argo Still Owns

Argo CD still owns cluster Secrets, repository credentials, Projects, sync
policy, hooks, health, drift correction, and local rollout.

Kapro writes only reviewed promotion fields after adoption: selected
`targetRevision` fields or explicit Git generator input fields.

## E2E Proof

The Kapro source repo includes a live Argo E2E:

```bash
scripts/argo-e2e.sh run
```

It installs Argo CD and Kapro in Kind, serves a throwaway Git repo, runs
`kapro adopt argo`, applies generated mappings, promotes repo-native Argo
fields, creates a Kapro `PromotionRun`, and waits for selected Applications to
become `Synced` and `Healthy`.
