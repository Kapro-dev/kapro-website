---
sidebar_position: 1
slug: /intro
---

# What is Kapro?

Kapro is a **Kubernetes-native promotion control plane for cluster fleets**.

It answers one question deterministically: *"Is it safe to promote this artifact version to this target cluster right now?"*

Kapro does not replace GitOps tools, rollout controllers, or traffic systems. It **orchestrates promotion across them** -- sitting above delivery systems to decide *when* and *in what order* clusters receive new versions, based on configurable gate policies: time soaks, Prometheus metrics, human approval, health checks, OCI signature verification, and custom CEL expressions.

**Analogy:** Kubernetes is to containers what Kapro is to delivery waves. Kubernetes manages the lifecycle of containers on nodes. Kapro manages the lifecycle of releases across target clusters in a fleet.

## The Problem

Platform engineering teams running 10 to 500 Kubernetes clusters have three bad options today:

- **Manual**: hand-deploy between clusters with no guardrails, no audit trail, no rollback.
- **Bespoke**: per-team promotion pipelines in CI (GitHub Actions, Tekton, Jenkins) with hard-coded targets, no reusable gate logic, brittle failure modes.
- **Partial**: Argo Rollouts, Flagger, Istio, and Gateway API handle in-cluster rollout and traffic mechanics but not cross-cluster promotion waves. Flux and Argo CD apply desired state but do not own the fleet-level "should this target advance now?" decision.

No CNCF-native tool manages the **fleet promotion loop**: artifact to gates to multi-target wave to local backend convergence to rollback decision -- across a fleet, with an auditable per-release history.

## Core Mental Model

```
Release
  Pipeline DAG (pipeline -> pipeline via dependsOn)
    Stage DAG (stage -> stage via dependsOn inside a pipeline)
      clusterSelector -> MemberCluster set -> per-target promotion
```

- **Release** owns execution end-to-end and terminates when all pipelines/stages have converged or failed.
- **Pipeline** is a reusable template of stages (no status, no live fields).
- **Stage** selects clusters and carries the gate policy that applies to those clusters.
- **MemberCluster** is pure inventory plus observed state.
- **Approval** is a separate CRD that carries a human approve/reject signal.

## How Kapro Compares

| | Kapro | Flux | ArgoCD | Kargo |
|---|---|---|---|---|
| **Multi-cluster promotion** | Native | Manual | App-of-apps | Native |
| **Fleet promotion orchestration** | Native | Manual | App-of-apps | Native |
| **OCI-first** | Yes | Partial | Git-centric | Yes |
| **Sovereign fleet support** | Designed for it | No | No | Limited |
| **Flux compatibility** | Built on Flux | N/A | No | Separate |
| **Health gates** | Pluggable | No | No | Yes |
| **Manual approvals** | CRD-based | No | External | Yes |

Kapro sits **above** local rollout and GitOps systems, not replacing them, and **alongside** Kargo as a complementary tool. Kapro focuses on horizontal wave ordering across sovereign fleets, while local systems handle namespace-level rollout, sync, traffic shifting, and workload health.

## Next Steps

- [Install Kapro](/docs/getting-started/installation) on your cluster
- [Run the Kind demo](/docs/getting-started/kind-demo) locally
- Learn about the [architecture](/docs/concepts/architecture)
