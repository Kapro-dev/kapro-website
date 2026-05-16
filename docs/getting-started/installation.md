---
sidebar_position: 1
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# Install Kapro

<ConceptDiagram id="installation" />

Kapro runs as an operator in a hub cluster.

Install it first, then add fleet configuration such as `FleetCluster`,
`BackendProfile`, `PromotionSource`, `PromotionPlan`, `PromotionTrigger`,
`PluginRegistration`, and `PromotionRun` objects.

## Before You Start

You need:

- a Kubernetes cluster for the Kapro hub
- permission to create CRDs and cluster-scoped RBAC
- Helm 3
- cert-manager if admission webhooks are enabled

For a local test cluster, you can disable webhooks.

## Install with Helm

From the Kapro repository:

```bash
helm upgrade --install kapro charts/kapro-operator \
  --namespace kapro-system \
  --create-namespace
```

For local clusters without cert-manager:

```bash
helm upgrade --install kapro charts/kapro-operator \
  --namespace kapro-system \
  --create-namespace \
  --set webhook.enabled=false
```

## Configure Public URLs

Set these when approvals or spokes need to reach the hub:

```bash
helm upgrade --install kapro charts/kapro-operator \
  --namespace kapro-system \
  --create-namespace \
  --set externalURL=https://kapro.example.com \
  --set hubAPIURL=https://hub.example.com:6443
```

| Value | Meaning |
|---|---|
| `externalURL` | Used for approval links and Decision API callbacks. |
| `hubAPIURL` | Kubernetes API endpoint reachable from spoke clusters. |

## Verify the Install

```bash
kubectl -n kapro-system rollout status deployment/kapro-kapro-operator
kubectl get crd | grep kapro.io
kubectl -n kapro-system get deploy,svc,sa
```

Check the operator can read Kapro PromotionRuns:

```bash
kubectl auth can-i get PromotionRuns.kapro.io \
  --as=system:serviceaccount:kapro-system:kapro-kapro-operator
```

For clean-clone verification from the Kapro source repo:

```bash
scripts/verify-install.sh render
scripts/verify-install.sh cluster
```

Render-only checks that do not require a cluster:

```bash
helm lint charts/kapro-operator
helm template kapro charts/kapro-operator --namespace kapro-system --include-crds
kubectl kustomize config/default
```

## What Comes Next

After the operator is running, create the objects that define your fleet:

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node"><strong>FleetCluster</strong><span>Register target clusters.</span></div>
    <div class="kapro-node"><strong>BackendProfile</strong><span>Select Argo, Flux, or an external backend.</span></div>
    <div class="kapro-node"><strong>PromotionSource</strong><span>Define promotion units and write fields.</span></div>
    <div class="kapro-node"><strong>PromotionPlan</strong><span>Define the rollout waves.</span></div>
    <div class="kapro-node"><strong>PromotionTrigger</strong><span>Optionally observe trusted OCI artifacts.</span></div>
    <div class="kapro-node"><strong>PromotionRun</strong><span>Promote a version.</span></div>
  </div>
</div>

For a quick local walkthrough, use the [Kind demo](/docs/getting-started/kind-demo).

For a production-style setup, use a [hub config repository](/docs/guides/hub-config).

For GKE Fleet onboarding, use [fleet discovery](/docs/guides/fleet-discovery).

For Argo or Flux brownfield validation, use [E2E validation](/docs/guides/e2e-validation).

## Optional Plugin Gateway

The plugin gateway is an opt-in runtime preview. Enabling it sets
`KAPRO_ENABLE_PLUGIN_GATEWAY=true`; it does not install plugin services for you.

```bash
helm upgrade --install kapro charts/kapro-operator \
  --namespace kapro-system \
  --create-namespace \
  --set pluginGateway.enabled=true
```

Then apply a plugin service and `PluginRegistration`, for example:

```bash
kubectl apply -f examples/plugins/slo-gate-registration.yaml
kubectl -n kapro-system rollout restart deployment/kapro-kapro-operator
```

Ready backend adapter and gate registrations are loaded at startup when the
gateway is enabled. Run the matching KAI, KGI, or KPI conformance package
before enabling a new plugin image in production.

## Kustomize Install Path

The Kapro source repo also keeps a Kustomize install path for simple local installs:

```bash
kubectl apply -k config/default
kubectl -n kapro-system rollout status deployment/kapro-operator
```

Use Helm for configurable production installs.

## Upgrade

Apply CRDs first, then roll the operator:

```bash
kubectl apply -f charts/kapro-operator/crds
helm upgrade kapro charts/kapro-operator --namespace kapro-system
kubectl -n kapro-system rollout status deployment/kapro-kapro-operator
```

Read the release notes before upgrading a production hub. Some APIs are still
pre-stable.

## Uninstall

```bash
helm uninstall kapro --namespace kapro-system
```

Helm does not delete CRDs. Delete them only after backing up or removing Kapro
custom resources:

```bash
kubectl delete -f charts/kapro-operator/crds
kubectl delete namespace kapro-system
```
