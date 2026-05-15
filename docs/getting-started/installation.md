---
sidebar_position: 1
---

# Installation

The recommended install path is the Helm chart in `charts/kapro-operator`. It installs the CRDs, controller Deployment, ServiceAccount, RBAC, admission webhooks, and baseline approval service together.

## Prerequisites

- Kubernetes cluster access with permission to create CRDs and cluster-scoped RBAC.
- Helm 3.
- cert-manager when `webhook.enabled=true` (the default).

For local clusters without cert-manager, set `webhook.enabled=false`.

## Install

```bash
helm upgrade --install kapro charts/kapro-operator \
  --namespace kapro-system \
  --create-namespace
```

Local install without admission webhooks:

```bash
helm upgrade --install kapro charts/kapro-operator \
  --namespace kapro-system \
  --create-namespace \
  --set webhook.enabled=false
```

Useful baseline settings:

```bash
helm upgrade --install kapro charts/kapro-operator \
  --namespace kapro-system \
  --create-namespace \
  --set externalURL=https://kapro.example.com \
  --set hubAPIURL=https://hub.example.com:6443
```

`externalURL` is used in approval links and Decision API callbacks. `hubAPIURL` should be the hub API server URL reachable from spoke clusters.

## Verify

```bash
kubectl -n kapro-system rollout status deployment/kapro-kapro-operator
kubectl get crd | grep kapro.io
kubectl -n kapro-system get deploy,svc,sa
kubectl auth can-i get releases.kapro.io \
  --as=system:serviceaccount:kapro-system:kapro-kapro-operator
```

## Upgrade

Apply CRD changes first, then upgrade the chart:

```bash
kubectl apply -f charts/kapro-operator/crds
helm upgrade kapro charts/kapro-operator --namespace kapro-system
kubectl -n kapro-system rollout status deployment/kapro-kapro-operator
```

## Uninstall

```bash
helm uninstall kapro --namespace kapro-system
```

Helm does not delete CRDs on uninstall. After backing up or deleting Kapro custom resources, remove CRDs explicitly:

```bash
kubectl delete -f charts/kapro-operator/crds
kubectl delete namespace kapro-system
```

## Kustomize Bundle

The repository also keeps a Kustomize bundle for simple local installs:

```bash
kubectl apply -k config/default
kubectl -n kapro-system rollout status deployment/kapro-operator
```

The Kustomize bundle disables admission webhooks and uses the published operator image. Use Helm for configurable production installs.
