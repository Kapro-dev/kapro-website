---
sidebar_position: 1
---

# Architecture

Kapro uses a hub-and-spoke architecture. The hub cluster runs the Kapro operator and owns all promotion state. Spoke clusters run a lightweight cluster controller that reports health and converges workloads.

## Hub Cluster

```
 Hub cluster
  kapro-operator
    ReleaseReconciler      -- drives the Pipeline DAG, owns the
                              inline per-target FSM, resolves
                              gates via gate.Registry
    ApprovalReconciler     -- watches Approval objects, unblocks
                              targets in WaitingApproval
    CSRApprovalReconciler  -- approves spoke-cluster CSRs based
                              on BootstrapToken

  kapro-webhook-server
    POST /approve/:token   -- creates Approval(release-target)
    POST /reject/:token    -- creates Approval(release-target)
    GET  /status/:release  -- returns Release.status
```

## Spoke Clusters

Each spoke runs the `kapro-cluster-controller`:

- Polls `MemberCluster.spec.desiredVersion` on the hub
- Patches the local delivery system (Flux/Argo) accordingly
- Writes `MemberCluster.status` (heartbeat + currentVersions)
- Outbound-only HTTPS; authenticates via CSR-issued cert or GCP WIF

## CRD Inventory

| CRD | Kind | Purpose |
|-----|------|---------|
| `kaproes.kapro.io` | `Kapro` | Global configuration |
| `kaproapps.kapro.io` | `KaproApp` | Application/component metadata |
| `pipelines.kapro.io` | `Pipeline` | Reusable stage DAG template |
| `releases.kapro.io` | `Release` | Execution owner for a rollout |
| `releasetargets.kapro.io` | `ReleaseTarget` | Per-target execution state |
| `releasetriggers.kapro.io` | `ReleaseTrigger` | Autonomous release creation from OCI changes |
| `memberclusters.kapro.io` | `MemberCluster` | Fleet inventory and observed state |
| `approvals.kapro.io` | `Approval` | Human approve/reject signal |
| `notificationproviders.kapro.io` | `NotificationProvider` | Notification destination config |
| `notificationpolicies.kapro.io` | `NotificationPolicy` | Notification subscription logic |
| `pluginregistrations.kapro.io` | `PluginRegistration` | External plugin registration |
| `agentpolicies.kapro.io` | `AgentPolicy` | Agent-driven promotion policy |

`Pipeline`, `KaproApp`, `NotificationProvider`, and `NotificationPolicy` are spec-only templates. Execution state lives in `Release`, `ReleaseTarget`, `MemberCluster`, `Approval`, and `ReleaseTrigger` status.

## Two-Level DAG

```
Release
  Pipeline DAG (pipeline -> pipeline via dependsOn)
    Stage DAG (stage -> stage via dependsOn inside a pipeline)
      clusterSelector -> MemberCluster set -> per-target rollout
```

- **Release** owns execution end-to-end and terminates when all pipelines/stages have converged or failed.
- **Pipeline** is a reusable template of stages. It has no status and no live fields.
- **Stage** selects clusters via `clusterSelector` labels and carries a gate policy.
- **MemberCluster** is pure inventory plus observed state: heartbeat and current versions.

## Extension Interfaces

Kapro has narrow pluggable interfaces for backend execution, safety evaluation, and rollout planning:

| Interface | Package | Question |
|-----------|---------|----------|
| Actuator (KAI) | `pkg/actuator` | "Apply this version to this cluster" |
| Gate (KGI) | `pkg/gate` | "May this target advance?" |
| Planner (KPI) | `pkg/planner` | "Which targets should this stage bind, and in what order?" |

Each interface has a conformance suite and supports both in-process and gRPC plugin implementations.

## Fleet Onboarding

Spoke onboarding uses two concrete paths:

1. **CSR-based (default):** The spoke submits a Kubernetes CertificateSigningRequest with a bootstrap token. The hub's CSRApprovalReconciler validates the token and approves the CSR.
2. **GCP Workload Identity Federation (optional):** When `MemberCluster.spec.bootstrap.gcp` is set, the spoke exchanges a GCP ID token for hub credentials.

Both paths are concrete implementations, not pluggable extension points.
