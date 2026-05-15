---
slug: introducing-kapro
title: Introducing Kapro
authors: [kapro]
tags: [release, announcement]
---

# Introducing Kapro

We are excited to announce **Kapro** -- a Kubernetes-native promotion control plane for cluster fleets.

{/* truncate */}

## The Problem

Platform engineering teams running multi-cluster Kubernetes environments face a gap: GitOps tools like Flux and ArgoCD handle in-cluster delivery well, but no CNCF-native tool manages the full cross-cluster promotion pipeline -- from artifact verification through gates to multi-target wave delivery with rollback.

Teams end up building bespoke promotion pipelines in CI, with hard-coded targets, no reusable gate logic, and brittle failure modes.

## What Kapro Does

Kapro sits above your delivery system and orchestrates it. It answers one question deterministically: *Is it safe to deliver this artifact version to this target cluster right now?*

Key capabilities:

- **Wave-based promotion**: Roll out across clusters in ordered waves. Canary first, then regional production, then global. Each wave gates on the previous before proceeding.
- **Composable gates**: Combine soak timers, Prometheus metric checks, OCI signature verification, manual approvals, and custom CEL expressions into per-stage gate policies.
- **Backend-agnostic**: Kapro orchestrates Flux, ArgoCD, Helm, and other delivery backends through a pluggable actuator interface. It decides *when* to deliver; your GitOps tool decides *how*.
- **OCI-first**: The OCI artifact is the contract. Immutable tags only. Any CI pipeline can produce them. Runtime git dependency drops to zero.

## Architecture

Kapro uses a hub-and-spoke model:

- The **hub** cluster runs the Kapro operator and owns all promotion state.
- **Spoke** clusters run a lightweight controller that reports health and converges workloads through Flux or other backends.

Releases progress through a per-target finite state machine: Pending, Verification, HealthCheck, MetricsCheck, Soaking, WaitingApproval, Applying, and finally Converged or Failed.

## Get Started

- [Install Kapro](/docs/getting-started/installation)
- [Run the Kind demo](/docs/getting-started/kind-demo)
- [Read the architecture docs](/docs/concepts/architecture)
- [Browse the source on GitHub](https://github.com/Kapro-dev/kapro)
