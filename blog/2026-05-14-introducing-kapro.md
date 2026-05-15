---
slug: introducing-kapro
title: Introducing Kapro
authors: [kapro]
tags: [release, announcement]
---

# Introducing Kapro

Kapro is a Kubernetes-native control plane for promoting immutable artifact versions across multi-cluster fleets.

It answers the question platform teams eventually have to standardize:

> Which clusters are allowed to receive this artifact version now, and why?

{/* truncate */}

## The Gap

Modern platform teams usually already have good tools at both ends of the delivery chain:

- CI builds artifacts.
- Registries store immutable versions.
- Flux, Argo CD, Helm, and rollout controllers reconcile workloads inside clusters.
- Observability systems report health and SLO signals.

The hard part is the fleet-level decision between those systems: canary first, then regional groups, then the broader fleet, with evidence recorded at every step.

## What Kapro Does

Kapro owns the promotion loop:

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node"><strong>Plan</strong><span>Select targets, order waves, and enforce dependencies.</span></div>
    <div class="kapro-node"><strong>Evaluate</strong><span>Run signature, health, metrics, soak, and approval gates.</span></div>
    <div class="kapro-node"><strong>Apply</strong><span>Ask a backend actuator to converge one chosen version.</span></div>
    <div class="kapro-node"><strong>Record</strong><span>Persist target phase, gate evidence, approvals, and outcome.</span></div>
  </div>
</div>

Kapro does not replace Flux, Argo CD, Argo Rollouts, Flagger, Kargo, Tekton, or your CI system. It coordinates them by making the fleet promotion decision explicit and auditable.

## Why OCI Matters

The artifact is the contract. A CI pipeline can produce an immutable OCI image or bundle, but CI should not have to stay in the runtime promotion path forever.

Kapro lets the runtime control plane promote a pinned version across clusters without turning every team’s CI workflow into a custom deployment orchestrator.

## A Simple Mental Model

<div class="kapro-diagram">
  <div class="kapro-lanes">
    <div class="kapro-lane">
      <div><strong>Wave 1</strong><span>canary</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">de-1</span><span class="kapro-cluster active">fi-1</span><span class="kapro-cluster">us-1</span><span class="kapro-cluster">jp-1</span></div>
      <div class="kapro-status">verified</div>
    </div>
    <div class="kapro-lane">
      <div><strong>Wave 2</strong><span>regional</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">eu</span><span class="kapro-cluster active">us</span><span class="kapro-cluster">apac</span><span class="kapro-cluster">latam</span></div>
      <div class="kapro-status">soaking</div>
    </div>
    <div class="kapro-lane">
      <div><strong>Wave 3</strong><span>fleet</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster">edge-a</span><span class="kapro-cluster">edge-b</span><span class="kapro-cluster">edge-c</span><span class="kapro-cluster">edge-d</span></div>
      <div class="kapro-status waiting">waiting</div>
    </div>
  </div>
</div>

Each selected cluster gets its own target state. A release can move safely because Kapro knows which target is pending, verifying, soaking, waiting for approval, applying, converged, failed, or rolled back.

## Get Started

- [Read the introduction](/docs/intro)
- [Install Kapro](/docs/getting-started/installation)
- [Run the Kind demo](/docs/getting-started/kind-demo)
- [Understand the architecture](/docs/concepts/architecture)
