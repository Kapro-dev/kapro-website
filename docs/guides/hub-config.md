---
sidebar_position: 1
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# Hub Configuration

<ConceptDiagram id="hub-config" />

The hub cluster stores Kapro objects. A hub config repository is the recommended
way to manage those objects.

Use Git for desired promotion configuration. Use the OCI registry for immutable
runtime artifact versions.

## Two Sources of Truth

<div class="kapro-diagram">
  <div class="kapro-split">
    <div class="kapro-card">
      <strong>Hub config Git repo</strong>
      <span>Fleet inventory, backend profiles, promotion sources, PromotionPlans, triggers, plugins, notifications, policies, and PromotionRuns.</span>
    </div>
    <div class="kapro-card">
      <strong>OCI registry</strong>
      <span>Immutable images, charts, or release artifacts that clusters can run.</span>
    </div>
  </div>
</div>

Spoke clusters do not need to watch the hub config repo. They consume selected
artifact versions and report status through Kapro.

The default path is CI-driven:

```text
pull request -> validate -> merge -> kubectl apply -> Kapro hub
```

If your platform already runs Flux on the hub, Flux can replace the merge-time
`kubectl apply` step. The source-of-truth split stays the same.

## Repository Layout

Keep the repository boring and reviewable:

```text
hub-config/
  clusters/
    canary-eu.yaml
    prod-eu.yaml
    prod-us.yaml
  backends/
    argo-observe.yaml
  sources/
    checkout.yaml
  promotionplans/
    checkout-progressive.yaml
  triggers/
    checkout-oci.yaml
  plugins/
    slo-gate.yaml
    argocd-adapter.yaml
  notifications/
    PromotionRun-webhook.yaml
    production-failures.yaml
  policies/
    sre-agent-policy.yaml
  promotionruns/
    checkout-v1.8.2.yaml
  .github/
    workflows/
      apply-kapro-hub-config.yaml
```

| Directory | What lives there |
|---|---|
| `clusters/` | `FleetCluster` objects. One file per cluster is easiest to review. |
| `backends/` | `BackendProfile` objects. Built-in Argo/Flux profiles or external plugin-backed profiles. |
| `sources/` | `PromotionSource` objects. Promotion units and backend-native write fields. |
| `promotionplans/` | `PromotionPlan` objects. Stage order, selectors, gates, and concurrency. |
| `triggers/` | `PromotionTrigger` objects. OCI observation, signature requirement, cooldown, max-active, and PromotionRun template. |
| `plugins/` | `PluginRegistration` objects. External backend adapter, gate, and planner endpoint declarations. |
| `notifications/` | `NotificationProvider` and `NotificationPolicy` objects. Event destinations and subscriptions. |
| `policies/` | `AgentPolicy` and future policy objects. Guardrails around assisted workflows. |
| `promotionruns/` | `PromotionRun` objects. The intent to promote a version. |

## Apply Order

Apply objects in dependency order:

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node"><strong>1. Clusters</strong><span>Register targets and labels.</span></div>
    <div class="kapro-node"><strong>2. Backends</strong><span>Observe or adopt Argo, Flux, or external backends.</span></div>
    <div class="kapro-node"><strong>3. Sources</strong><span>Define promotion units and version fields.</span></div>
    <div class="kapro-node"><strong>4. Integrations</strong><span>Register plugins, notifications, and policies.</span></div>
    <div class="kapro-node"><strong>5. PromotionPlans</strong><span>Define the rollout plan.</span></div>
    <div class="kapro-node"><strong>6. Triggers</strong><span>Enable guarded artifact observation.</span></div>
    <div class="kapro-node"><strong>7. PromotionRuns</strong><span>Start promotion only after the inputs exist.</span></div>
  </div>
</div>

This prevents a PromotionRun from starting before its clusters or PromotionPlan exist.

Recommended dependency order:

1. `clusters/`
2. `backends/`
3. `sources/`
4. `plugins/`
5. `notifications/`
6. `policies/`
7. `promotionplans/`
8. `triggers/`
9. `promotionruns/`

## Example Backend And Source

```yaml
apiVersion: kapro.io/v1alpha1
kind: BackendProfile
metadata:
  name: argo
spec:
  driver: argo
  runtime: Hub
  parameters:
    namespace: argocd
  discovery:
    enabled: true
    managementPolicy: Observe
    selector:
      matchLabels:
        kapro.io/import: "true"
---
apiVersion: kapro.io/v1alpha1
kind: PromotionSource
metadata:
  name: checkout
spec:
  backendRef: argo
  units:
    - name: api
      backendKind: ArgoApplicationSource
      namespace: argocd
      sourcePath: argocd/applications/api.yaml
      versionField: spec.source.targetRevision
```

Read that as: observe Argo objects first, then promote the `api` unit only
through the reviewed Application revision field.

## Example PromotionPlan

```yaml
apiVersion: kapro.io/v1alpha1
kind: PromotionPlan
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

## Example Trigger

```yaml
apiVersion: kapro.io/v1alpha1
kind: PromotionTrigger
metadata:
  name: checkout-oci
spec:
  suspended: true
  source:
    type: oci
    oci:
      repository: oci://registry.example.com/platform/checkout
      tagPattern: "^v[0-9]+\\.[0-9]+\\.[0-9]+$"
      requireSignature: true
      pollInterval: 5m
  promotionrunTemplate:
    promotionplans:
      - name: production
        promotionplan: checkout-progressive
    suspended: true
    scope:
      targets:
        - checkout-canary-eu
  cooldown: 30m
  maxActive: 1
  dryRun: true
```

Read that as: observe only semver tags, require signature verification, create a
digest-pinned PromotionRun from the template, keep the PromotionRun suspended by default,
and start in dry-run mode while the trigger is being validated.

## CI Checks

On pull requests, validate with server-side dry run:

```bash
kubectl apply --dry-run=server -f clusters/
kubectl apply --dry-run=server -f backends/
kubectl apply --dry-run=server -f sources/
kubectl apply --dry-run=server -f plugins/
kubectl apply --dry-run=server -f notifications/
kubectl apply --dry-run=server -f policies/
kubectl apply --dry-run=server -f promotionplans/
kubectl apply --dry-run=server -f triggers/
kubectl apply --dry-run=server -f promotionruns/
```

After merge, apply in the same order:

```bash
kubectl apply -f clusters/
kubectl apply -f backends/
kubectl apply -f sources/
kubectl apply -f plugins/
kubectl apply -f notifications/
kubectl apply -f policies/
kubectl apply -f promotionplans/
kubectl apply -f triggers/
kubectl apply -f promotionruns/
```

Then inspect:

```bash
kubectl get fleetclusters.kapro.io
kubectl get backendprofiles.kapro.io,promotionsources.kapro.io
kubectl get PromotionPlans.kapro.io,promotiontriggers.kapro.io,PromotionRuns.kapro.io
kubectl get pluginregistrations.kapro.io,notificationproviders.kapro.io,notificationpolicies.kapro.io
kubectl describe PromotionRun checkout-v1-8-2
```

## Optional: Flux on the Hub

If your platform already uses Flux to manage cluster configuration, Flux can
apply the hub config repository:

```text
git push -> Flux on hub -> Kapro objects -> Kapro operator -> member clusters
```

The model stays the same. Git owns hub config. OCI owns runtime artifacts.
