---
sidebar_position: 16
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# Backend Ownership

<ConceptDiagram id="backend-ownership" />

Kapro is a promotion control plane. It does not replace Argo CD, Flux, rollout
controllers, service meshes, or Kubernetes workload controllers.

<div class="kapro-lesson">
  <img src="/img/logo.png" alt="Kapro mascot" />
  <div>
    <strong>Kapro asks permission before touching backend-owned things.</strong>
    <p>Observe mode lets Kapro look. Adopt mode lets Kapro write only the reviewed version fields. The backend still owns sync, credentials, hooks, and local rollout behavior.</p>
  </div>
</div>

The backend ownership contract is intentionally small: Kapro may write only the
documented version field after adoption. The backend keeps local delivery
authority.

<div class="kapro-state-machine">
  <div class="kapro-state-row">
    <div class="kapro-state"><strong>Observe</strong><span>Discover and report. No writes.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-state waiting"><strong>Review</strong><span>Human checks discovered units and fields.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-state good"><strong>Adopt</strong><span>Kapro may update selected version fields.</span></div>
  </div>
</div>

## Management Policies

| Policy | Meaning | Writes |
|---|---|---|
| `Observe` | Kapro discovers backend-native objects and reports them in `BackendProfile.status`. | None |
| `Adopt` | Kapro may promote selected units. | Only reviewed version fields. |

Use `Observe` first. Move to `Adopt` only after the discovered graph and
`PromotionSource` mappings are correct.

Example:

```yaml
apiVersion: kapro.io/v1alpha1
kind: BackendProfile
metadata:
  name: checkout-argo
spec:
  driver: argo
  runtime: Hub
  discovery:
    enabled: true
    managementPolicy: Observe
    selector:
      matchLabels:
        kapro.io/import: "true"
```

When the discovered units look right, change only the policy:

```yaml
spec:
  discovery:
    managementPolicy: Adopt
```

## Argo CD Ownership

Argo CD keeps:

- cluster Secrets;
- repo credentials;
- Projects;
- sync policy;
- hooks;
- health assessment;
- local rollout behavior.

Kapro may update selected `Application.spec.source.targetRevision`, request a
refresh/sync where supported, or update explicit Git generator input files for
ApplicationSets. App-of-apps roots are normally observed as packaging evidence,
not promoted directly.

Live Argo Application adoption requires explicit delegation labels or
annotations such as `kapro.io/managed-by: kapro`,
`kapro.io/authorized-source`, or `kapro.io/authorized-unit`.

## Flux Ownership

Flux keeps:

- GitRepository, OCIRepository, Bucket, Kustomization, and HelmRelease
  reconciliation;
- source credentials;
- drift correction;
- inventory;
- health and readiness;
- workload apply behavior.

Kapro may update a reviewed source revision, Helm chart version, image tag, or
Kustomize image tag. Flux `Kustomization.spec.path` and `sourceRef` are topology
fields and are not treated as universal PromotionRun-version fields.

## Evidence

Backend discovery records selected, skipped, and unsupported objects in
`BackendProfile.status`. PromotionTarget objects record backend objects, desired
version, observed version, sync status, health status, and convergence where
the backend adapter provides it.
