---
sidebar_position: 1
---

# Install Kapro

Kapro runs as an operator in a hub cluster.

Install it first, then add fleet configuration such as `MemberCluster`,
`KaproApp`, `Pipeline`, and `Release` objects.

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

Check the operator can read Kapro releases:

```bash
kubectl auth can-i get releases.kapro.io \
  --as=system:serviceaccount:kapro-system:kapro-kapro-operator
```

## What Comes Next

After the operator is running, create the objects that define your fleet:

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node"><strong>MemberCluster</strong><span>Register target clusters.</span></div>
    <div class="kapro-node"><strong>KaproApp</strong><span>Define the application.</span></div>
    <div class="kapro-node"><strong>Pipeline</strong><span>Define the rollout waves.</span></div>
    <div class="kapro-node"><strong>Release</strong><span>Promote a version.</span></div>
  </div>
</div>

For a quick local walkthrough, use the [Kind demo](/docs/getting-started/kind-demo).

For a production-style setup, use a [hub config repository](/docs/guides/hub-config).

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
