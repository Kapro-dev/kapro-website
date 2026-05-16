---
sidebar_position: 4
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# E2E Validation

<ConceptDiagram id="e2e-validation" />

Kapro includes local scripts that prove the current greenfield and brownfield
paths against real repository or controller behavior.

Run these from the Kapro source repository.

## Flux Git-Native E2E

```bash
scripts/flux-git-e2e.sh
```

This creates a disposable Git repo, runs `kapro discover flux`, applies the
generated `PromotionSource`, and verifies the intended fields changed:

- `GitRepository.spec.ref.tag`;
- `OCIRepository.spec.ref.tag`;
- `HelmRelease.spec.chart.spec.version`;
- HelmRelease image tag values;
- Kustomize `images[].newTag`;
- Helm `Chart.yaml` `version` and `appVersion`.

## Live Flux Controller E2E

```bash
scripts/verify-install.sh flux-e2e
```

This creates a disposable Kind cluster, installs real Flux controllers, serves a
Git fixture inside the cluster, runs `kapro adopt flux`, applies a generated
mapping from `v1` to `v2`, pushes the Git change, and waits for Flux to
reconcile the workload to `v2`.

## Live Argo CD E2E

```bash
scripts/argo-e2e.sh run
```

This creates a Kind cluster, installs Argo CD and Kapro, serves a throwaway Git
repo, runs `kapro adopt argo`, applies the generated mapping, promotes
repo-native Argo fields with `kapro source apply`, creates a Kapro `PromotionRun`,
and waits for selected Argo Applications to become `Synced` and `Healthy`.

It covers plain Applications, multi-source Applications, ApplicationSet child
patterns backed by JSON or YAML generator inputs, and app-of-apps child
promotion. Root app-of-apps Applications are discovered as packaging evidence
but are not write targets.

## PromotionRun Smoke

```bash
make PromotionRun-smoke
```

This is the lightweight CI PromotionRun smoke path. Use it with the render and
install checks before publishing or documenting a PromotionRun candidate.
