---
sidebar_position: 1
---

# Hub Configuration

For v1, hub config lives in a dedicated **git repository**. CI validates that repository and applies the rendered YAML to the Kapro hub cluster with kubectl apply.

Spoke clusters remain gitless. They consume OCI bundles and report status through MemberCluster.

## Two Sources of Truth

- **Hub config truth:** the git repository that defines fleet inventory, applications, rollout pipelines, and release intent.
- **Runtime artifact truth:** the OCI registry that stores immutable application bundles consumed by spoke clusters.

## Repository Layout

```
hub-config/
  clusters/
    canary-eu.yaml
    prod-eu.yaml
    prod-us.yaml
  apps/
    checkout.yaml
  pipelines/
    checkout-progressive.yaml
  releases/
    checkout-v1.2.3.yaml
```

| Directory | Contents |
|---|---|
| clusters/ | MemberCluster definitions (one per spoke) |
| apps/ | KaproApp definitions (component registry, waves, overrides) |
| pipelines/ | Pipeline definitions (stage DAG, selectors, gates) |
| releases/ | Release objects (version + pipeline references) |

## Apply Ordering

1. clusters/ -- registers MemberCluster inventory and labels used by selectors.
2. apps/ -- defines reusable application/component metadata.
3. pipelines/ -- defines stage DAGs, cluster selectors, and gate policy.
4. releases/ -- creates release intent that references pipelines and target versions.

## CI Workflow

Pull request checks:

```bash
kubectl apply --dry-run=server -f clusters/
kubectl apply --dry-run=server -f apps/
kubectl apply --dry-run=server -f pipelines/
kubectl apply --dry-run=server -f releases/
```

Merge-to-main apply:

```bash
kubectl apply -f clusters/
kubectl apply -f apps/
kubectl apply -f pipelines/
kubectl apply -f releases/
```

## Optional: Flux on Hub

Teams running Flux can point a Flux Kustomization at the hub config repository:

```
git push -> Flux on hub -> Kapro CRDs in hub etcd -> Kapro operator -> spokes
```

Flux-on-hub remains optional. The v1 default is git repository plus CI kubectl apply.
