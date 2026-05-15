---
sidebar_position: 1
---

# API Stability

Kapro uses explicit API maturity levels for CRDs, Go extension packages, lifecycle events, and plugin contracts.

## Maturity Levels

| Level | Meaning | Compatibility |
|---|---|---|
| Alpha | Experimental surface. | May change or be removed between minor releases. |
| Preview | Implemented for early adopters. | Compatible within a minor release. Breaking changes require release notes. |
| Stable | Production contract. | Backward-compatible within the major version. |

## Current Surface Classification

| Surface | Level |
|---|---|
| Core promotion CRDs (KaproBundle, Pipeline, Release, ReleaseTarget, MemberCluster, Approval, AgentPolicy) | Alpha |
| ReleaseTrigger CRD | Preview |
| PluginRegistration CRD | Preview |
| Notification provider/policy CRDs | Preview |
| In-process actuator interface (pkg/actuator) | Preview |
| In-process gate interface (pkg/gate) | Preview |
| In-process planner interface (pkg/planner) | Preview |
| KAI/KGI/KPI plugin contracts | Preview |
| Conformance harnesses | Preview |
| Lifecycle event schema | Preview |

No public surface is Stable in v0.1.0-alpha.

## Compatibility Rules

**Schema-compatible changes** (allowed for Preview and Stable):

- Adding optional CRD fields with safe defaults
- Adding status fields, conditions, reasons, or events
- Widening validation

**Breaking changes** (require a new API version or migration):

- Removing or renaming CRD fields, proto fields, packages, or methods
- Changing the semantic meaning of an existing field
- Tightening validation
- Changing lifecycle event type names

## Upgrade Policy

- Upgrade one hub control plane at a time.
- Apply CRD updates before rolling operator pods.
- Keep leader election enabled for multi-replica deployments.
- Upgrade plugin servers before enabling a newer contract version.
- Run conformance harnesses before upgrading production hubs.

See the full [API stability document](https://github.com/Kapro-dev/kapro/blob/main/docs/api-stability.md) for details.
