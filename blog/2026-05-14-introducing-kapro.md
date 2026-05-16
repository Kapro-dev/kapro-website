---
slug: introducing-kapro
title: Kapro in Five Minutes
authors: [kapro]
tags: [promotionrun, announcement]
---

# Kapro in Five Minutes

Kapro is a Kubernetes-native control plane for fleet promotion.

It answers one question:

> Which clusters may receive this artifact version now, and why?

{/* truncate */}

## The Problem

A single cluster rollout is usually understood:

- build an artifact
- update a GitOps object or Helm value
- let the cluster reconcile
- watch health and metrics

A fleet rollout is harder.

You may need to promote to canary clusters first, wait for evidence, ask for
approval, move one region at a time, pause when telemetry is unclear, and keep an
audit trail for every target.

Without a shared control plane, that logic becomes custom CI scripts.

## The Kapro Model

Kapro turns promotion into Kubernetes objects.

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node">
      <strong>FleetCluster</strong>
      <span>A cluster in the fleet.</span>
    </div>
    <div class="kapro-node">
      <strong>PromotionPlan</strong>
      <span>A reusable wave plan.</span>
    </div>
    <div class="kapro-node">
      <strong>PromotionRun</strong>
      <span>Promote one version.</span>
    </div>
    <div class="kapro-node">
      <strong>PromotionTarget</strong>
      <span>One selected cluster moving through the promotionrun.</span>
    </div>
  </div>
</div>

If you know Kubernetes, this is the key analogy:

| Kubernetes | Kapro |
|---|---|
| Node | FleetCluster |
| Deployment | PromotionPlan |
| Pod | PromotionTarget |
| Job | PromotionRun |

Kubernetes schedules Pods onto Nodes. Kapro schedules promotion targets onto
clusters.

## What Happens During a PromotionRun

<div class="kapro-diagram">
  <div class="kapro-lanes">
    <div class="kapro-lane">
      <div><strong>1. Canary</strong><span>small blast radius</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">signature</span><span class="kapro-cluster active">health</span><span class="kapro-cluster active">metrics</span></div>
      <div class="kapro-status">passed</div>
    </div>
    <div class="kapro-lane">
      <div><strong>2. Region</strong><span>controlled expansion</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">soak</span><span class="kapro-cluster">approval</span></div>
      <div class="kapro-status waiting">waiting</div>
    </div>
    <div class="kapro-lane">
      <div><strong>3. Fleet</strong><span>limited parallelism</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster">edge-a</span><span class="kapro-cluster">edge-b</span><span class="kapro-cluster">edge-c</span></div>
      <div class="kapro-status waiting">queued</div>
    </div>
  </div>
</div>

Each cluster has its own phase: pending, verification, health check, metrics
check, soaking, waiting for approval, applying, converged, failed, or rolled
back.

That status is the product. It lets operators answer what moved, what stopped,
and why.

## What Kapro Does Not Replace

Kapro does not replace:

- CI
- Flux
- Argo CD
- Helm
- Flagger
- Argo Rollouts
- service mesh traffic shifting

Those systems still do their jobs. Kapro coordinates when a selected version may
advance across the fleet.

## Why This Matters

Fleet promotion needs shared rules:

- canary before production
- labels to select target clusters
- evidence before expansion
- manual approval where needed
- backend convergence before the next wave
- events for audit and notification

Kapro makes those rules explicit in Kubernetes APIs.

## Start Here

- [What is Kapro?](/docs/intro)
- [Architecture](/docs/concepts/architecture)
- [Promotion lifecycle](/docs/concepts/promotionrun-fsm)
- [Hub configuration](/docs/guides/hub-config)
- [Run the local Kind demo](/docs/getting-started/kind-demo)
