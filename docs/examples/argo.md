---
sidebar_position: 2
---

# Argo CD Example

Kapro's current reference backend is Flux. The repo's typed actuator enum is
currently `flux`.

This page explains the Argo CD integration pattern so platform teams can see how
Argo fits the Kapro model. A production Argo integration should be implemented
as a Kapro actuator/plugin or added as a supported backend when the API surface
is ready.

## The Pattern

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node"><strong>Kapro</strong><span>Decides prod-eu may receive v1.8.2.</span></div>
    <div class="kapro-node"><strong>Argo actuator</strong><span>Updates the Application or ApplicationSet revision.</span></div>
    <div class="kapro-node"><strong>Argo CD</strong><span>Syncs and health-checks the app.</span></div>
    <div class="kapro-node"><strong>Kapro status</strong><span>Records converged, failed, or waiting.</span></div>
  </div>
</div>

The important boundary is the same as Flux:

- Kapro decides **when and where**.
- Argo CD decides **how the app syncs inside the cluster**.

## Example Argo Application

An Argo CD Application might point at an OCI-backed Helm chart or a Git path
whose version parameter is controlled by the actuator:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: checkout-prod-eu
  namespace: argocd
spec:
  project: checkout
  destination:
    server: https://kubernetes.default.svc
    namespace: checkout
  source:
    repoURL: oci://registry.example.com/platform/charts
    chart: checkout
    targetRevision: v1.8.2
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

An Argo actuator would update `spec.source.targetRevision` or another agreed
version field, then watch Argo health and sync status.

## Example MemberCluster Shape

Today, use the supported Flux backend in production. An Argo-capable actuator
would use a shape like this once the backend is registered:

```yaml
apiVersion: kapro.io/v1alpha1
kind: MemberCluster
metadata:
  name: prod-eu
  labels:
    kapro.io/tier: production
    kapro.io/region: europe-west3
spec:
  actuator:
    mode: push
    backend: argo
    push:
      namespace: argocd
      parameters:
        application: checkout-prod-eu
        revisionField: spec.source.targetRevision
```

Treat this as an integration design example, not a shipped backend guarantee.

## Pipeline Stays the Same

The pipeline does not need to know the backend details:

```yaml
apiVersion: kapro.io/v1alpha1
kind: Pipeline
metadata:
  name: checkout-argo-progressive
spec:
  stages:
    - name: canary
      selector:
        matchLabels:
          kapro.io/tier: canary

    - name: production
      selector:
        matchLabels:
          kapro.io/tier: production
      strategy:
        maxParallel: 1
      dependsOn:
        - stage: canary
          requiredSoakTime: 30m
      gate:
        mode: manual
        approval:
          required: true
          approvers: ["sre-team"]
```

That is the key design point. Stages, gates, approvals, and target status are
Kapro concepts. Backend mutation is an actuator detail.

## What the Argo Actuator Would Report

An Argo actuator should normalize Argo state into Kapro target status:

| Argo signal | Kapro meaning |
|---|---|
| Application synced and healthy | Target can become `Converged`. |
| Application progressing | Target remains `Applying`. |
| Sync failed | Target can become `Failed`. |
| Health degraded | Gate or apply result should block progression. |
| Unknown health | Return inconclusive or keep applying, depending on policy. |

## Why This Is Useful

Many organizations already use Argo CD for local reconciliation. Kapro does not
need to replace it. Kapro can add the missing fleet-level layer:

<div class="kapro-diagram">
  <div class="kapro-split">
    <div class="kapro-card kapro-good">
      <strong>Kapro owns</strong>
      <span>waves, approvals, evidence, target ordering, and release status.</span>
    </div>
    <div class="kapro-card">
      <strong>Argo CD owns</strong>
      <span>Application sync, drift correction, local health, and Kubernetes apply behavior.</span>
    </div>
  </div>
</div>
