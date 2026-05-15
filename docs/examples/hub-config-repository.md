---
sidebar_position: 5
---

# Hub Config Repository Example

Source repository:

- [Hub config example](https://github.com/Kapro-dev/kapro-example-hub-config)

This example shows how to store Kapro hub objects in Git and apply them in a
reviewable order.

## Layout

```text
clusters/   MemberCluster inventory
bundles/    KaproBundle component definitions
pipelines/  Pipeline rollout plans
releases/   Release objects
```

## Flow

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node"><strong>Pull request</strong><span>Change fleet config in Git.</span></div>
    <div class="kapro-node"><strong>Validate</strong><span>Check YAML and review the rollout intent.</span></div>
    <div class="kapro-node"><strong>Apply</strong><span>Apply clusters, bundles, pipelines, then releases.</span></div>
    <div class="kapro-node"><strong>Kapro hub</strong><span>Runs the promotion across member clusters.</span></div>
  </div>
</div>

## Apply Order

```bash
kubectl apply -f clusters/
kubectl apply -f bundles/
kubectl apply -f pipelines/
kubectl apply -f releases/
```

The source repo includes a manual GitHub Actions workflow that can apply the
same order to a hub cluster when a kubeconfig secret is configured.

