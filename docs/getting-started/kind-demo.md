---
sidebar_position: 2
---

# Local Kind Demo

The Kind demo is the fastest way to see the Kapro model without production
credentials.

It creates a local hub, installs Kapro, creates a small fake fleet, starts a
release, pauses production for approval, and shows the resulting status.

## What You Will See

<div class="kapro-diagram">
  <div class="kapro-lanes">
    <div class="kapro-lane">
      <div><strong>canary</strong><span>auto gate</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster active">checkout-canary</span></div>
      <div class="kapro-status">converged</div>
    </div>
    <div class="kapro-lane">
      <div><strong>production</strong><span>manual gate</span></div>
      <div class="kapro-lane-line"></div>
      <div class="kapro-clusters"><span class="kapro-cluster">checkout-prod-eu</span><span class="kapro-cluster">checkout-prod-us</span></div>
      <div class="kapro-status waiting">approval</div>
    </div>
  </div>
</div>

The demo uses fixture resources instead of real cloud infrastructure. It does
not require:

- production OCI credentials
- a real Flux Operator installation
- real Helm charts
- cosign signatures

## Prerequisites

- Docker
- Kind
- kubectl
- Go and `make`

## Run It

From the Kapro repository:

```bash
scripts/kind-demo.sh up
```

The script:

1. creates a `kapro-kind-demo` Kind cluster
2. builds `kapro-operator:dev`
3. loads the image into Kind
4. installs Kapro CRDs
5. deploys the operator
6. applies local Flux fixture CRDs and resources
7. creates the `checkout-kind` release

## Approve Production

The production stage waits for approval.

```bash
scripts/kind-demo.sh approve
scripts/kind-demo.sh status
```

This shows the main Kapro loop:

```text
canary passes -> production waits -> approval arrives -> production applies
```

## Inspect the Objects

```bash
kubectl --context kind-kapro-kind-demo get releases,releasetargets,memberclusters
kubectl --context kind-kapro-kind-demo get release checkout-kind -o yaml
kubectl --context kind-kapro-kind-demo get releasetargets -o yaml
```

Look for:

- target phase
- gate evidence
- approval state
- selected version
- backend convergence state

## Clean Up

```bash
scripts/kind-demo.sh down
```

If a previous run left stale state:

```bash
scripts/kind-demo.sh down
scripts/kind-demo.sh up
```

## What To Read Next

- [Promotion lifecycle](/docs/concepts/release-fsm)
- [Gates](/docs/concepts/gates)
- [Hub configuration](/docs/guides/hub-config)
