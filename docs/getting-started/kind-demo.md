---
sidebar_position: 2
---

# Local Kind Demo

This demo runs Kapro in a local Kind cluster and walks the intended control-plane flow:

1. Install Kapro CRDs and the operator
2. Apply a small fleet config with `MemberCluster`, `Pipeline`, `PluginRegistration`, and `ReleaseTrigger`
3. Create a `Release`
4. Watch the planner bind targets, gates advance, approvals unblock production, and the push/Flux actuator patch a `ResourceSet`
5. Inspect rollout status through `Release` and `ReleaseTarget`

The path is intentionally local-only. It does not require production OCI credentials, a real Flux Operator install, real Helm charts, or cosign signatures.

## Quick Start

Prerequisites:

- Docker
- Kind
- kubectl
- Go and `make`

Run:

```bash
scripts/kind-demo.sh up
```

The script creates a `kapro-kind-demo` cluster, builds `kapro-operator:dev`, loads it into Kind, installs the CRDs, deploys the operator, applies local Flux fixture CRDs/resources, and starts the `checkout-kind` release.

Approve production:

```bash
scripts/kind-demo.sh approve
scripts/kind-demo.sh status
```

Clean up:

```bash
scripts/kind-demo.sh down
```

## What The Demo Shows

The demo defines three local fleet entries:

- `checkout-canary`
- `checkout-prod-eu`
- `checkout-prod-us`

Each target uses the built-in `push/flux` actuator pointed at a local fixture `ResourceSet`.

The pipeline defines two stages:

- **canary**: selects `kapro.io/tier=canary` and uses a short built-in soak gate.
- **prod**: selects `kapro.io/tier=production`, depends on canary, uses `maxParallel: 1`, and requires manual approval by `demo-sre`.

Before approval, production targets pause in `WaitingApproval`. After approval, production targets advance through the remaining gates.

## Observe

```bash
kubectl --context kind-kapro-kind-demo get releases,releasetargets,memberclusters
kubectl --context kind-kapro-kind-demo get release checkout-kind -o yaml
kubectl --context kind-kapro-kind-demo get releasetargets -o yaml
```

## Troubleshooting

Check the operator:

```bash
kubectl --context kind-kapro-kind-demo -n kapro-system logs deployment/kapro-operator
kubectl --context kind-kapro-kind-demo -n kapro-system describe pod -l app=kapro-operator
```

If a previous run left stale state, delete the cluster and start again:

```bash
scripts/kind-demo.sh down
scripts/kind-demo.sh up
```
