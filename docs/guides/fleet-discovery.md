---
sidebar_position: 3
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# Fleet Discovery

<ConceptDiagram id="fleet-discovery" />

Kapro's PromotionRun model starts with `FleetCluster` inventory.

You can manage that inventory directly in the hub config repository, or you can
use provider-specific onboarding helpers to discover existing clusters and turn
them into `FleetCluster` objects.

## GKE Fleet Discovery

For GKE fleets, Kapro can read Fleet memberships through the GKE Hub API.

```bash
kapro fleet list --project my-project
kapro fleet sync --project my-project
```

`kapro fleet list` prints memberships, location, backing GKE project, cluster
name, and labels.

`kapro fleet sync` is the bulk onboarding command for existing Fleet clusters.
It creates `FleetCluster` CRDs and kubeconfig Secrets for discovered members
and prepares spokes that do not already have the required local pieces.

The implementation uses Google Cloud Go SDK clients. It does not shell out to
`gcloud`.

## What Discovery Does Not Change

Discovery is an onboarding path, not a different runtime architecture.

After a cluster exists as a `FleetCluster`:

- PromotionPlans select it by labels;
- PromotionRuns create target state for it;
- gates and approvals decide when it can advance;
- the backend adapter or spoke controller applies the selected version;
- status reports heartbeat, observed versions, and convergence.

## Git After Discovery

The recommended production workflow is still Git-based hub configuration.

For long-lived fleets, keep discovered inventory reviewable:

1. Run discovery in a controlled environment.
2. Export or commit the resulting `FleetCluster` manifests into `clusters/`.
3. Let CI validate and apply the hub config repository.
4. Treat later label, backend, or topology changes as normal pull requests.

That keeps auto-discovery useful for bootstrap while preserving Git review for
fleet topology and promotion policy.

## Provider Boundaries

Kapro does not expose a generic cluster-provider plugin interface today.
Cluster onboarding is concrete. The current GCP path covers project, GKE
cluster, Fleet membership, and Artifact Registry discovery helpers, while the
runtime fleet model remains Kubernetes-native through `FleetCluster`.
