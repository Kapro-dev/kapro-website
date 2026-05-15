---
sidebar_position: 1
---

# Hub Configuration

The hub cluster stores Kapro objects. A hub config repository is the recommended
way to manage those objects.

Use Git for the desired promotion configuration. Use the OCI registry for the
runtime artifact versions.

## Two Sources of Truth

<div class="kapro-diagram">
  <div class="kapro-split">
    <div class="kapro-card">
      <strong>Hub config Git repo</strong>
      <span>Fleet inventory, applications, pipelines, and releases.</span>
    </div>
    <div class="kapro-card">
      <strong>OCI registry</strong>
      <span>Immutable images or bundles that clusters can run.</span>
    </div>
  </div>
</div>

Spoke clusters do not need to watch the hub config repo. They consume selected
artifact versions and report status through Kapro.

## Repository Layout

Keep the repository boring and reviewable:

```text
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
    checkout-v1.8.2.yaml
  .github/
    workflows/
      apply-kapro-hub-config.yaml
```

| Directory | What lives there |
|---|---|
| `clusters/` | `MemberCluster` objects. One file per cluster is easiest to review. |
| `apps/` | `KaproApp` objects. Application metadata and component definitions. |
| `pipelines/` | `Pipeline` objects. Stage order, selectors, gates, and concurrency. |
| `releases/` | `Release` objects. The intent to promote a version. |

## Apply Order

Apply objects in dependency order:

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node"><strong>1. Clusters</strong><span>Register targets and labels.</span></div>
    <div class="kapro-node"><strong>2. Apps</strong><span>Define the application and components.</span></div>
    <div class="kapro-node"><strong>3. Pipelines</strong><span>Define the rollout plan.</span></div>
    <div class="kapro-node"><strong>4. Releases</strong><span>Start promotion only after the inputs exist.</span></div>
  </div>
</div>

This prevents a release from starting before its clusters or pipeline exist.

## Example Pipeline

```yaml
apiVersion: kapro.io/v1alpha1
kind: Pipeline
metadata:
  name: checkout-progressive
spec:
  stages:
    - name: canary
      selector:
        matchLabels:
          kapro.io/tier: canary

    - name: production-eu
      selector:
        matchLabels:
          kapro.io/tier: production
          kapro.io/region: europe-west3
      dependsOn:
        - stage: canary
          requiredSoakTime: 30m
      gate:
        mode: manual
        approval:
          required: true
          approvers: ["sre-team"]
```

Read that as:

1. Promote canary clusters first.
2. Wait for canary and 30 minutes of soak.
3. Promote European production clusters after approval from `sre-team`.

## CI Checks

On pull requests, validate with server-side dry run:

```bash
kubectl apply --dry-run=server -f clusters/
kubectl apply --dry-run=server -f apps/
kubectl apply --dry-run=server -f pipelines/
kubectl apply --dry-run=server -f releases/
```

After merge, apply in the same order:

```bash
kubectl apply -f clusters/
kubectl apply -f apps/
kubectl apply -f pipelines/
kubectl apply -f releases/
```

Then inspect:

```bash
kubectl get memberclusters.kapro.io
kubectl get kaproapps.kapro.io,pipelines.kapro.io,releases.kapro.io
kubectl describe release checkout-v1-8-2
```

## Optional: Flux on the Hub

If your platform already uses Flux to manage cluster configuration, Flux can
apply the hub config repository:

```text
git push -> Flux on hub -> Kapro objects -> Kapro operator -> member clusters
```

The model stays the same. Git owns hub config. OCI owns runtime artifacts.
