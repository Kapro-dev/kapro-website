---
sidebar_position: 9
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# Plugins and Conformance

<ConceptDiagram id="plugins-and-conformance" />

Kapro keeps extension points narrow so plugins can integrate delivery systems
without owning PromotionRun state.

<div class="kapro-lesson">
  <img src="/img/logo.png" alt="Kapro mascot" />
  <div>
    <strong>Plugins answer small questions.</strong>
    <p>A plugin may say how to apply, whether a gate passes, or which target should go first. Kapro still owns the PromotionRun state machine.</p>
  </div>
</div>

The core controller owns ordering, retries, failures, approvals, stage
dependencies, target state, and status. Plugins answer bounded questions and
return bounded results.

## Extension Surfaces

| Surface | Contract | Question |
|---|---|---|
| Backend adapter | KAI | How do I apply this version to this target and report convergence? |
| Gate | KGI | May this target advance now? |
| Planner | KPI | Which eligible targets should bind first? |

<div class="kapro-diagram">
  <div class="kapro-flow">
    <div class="kapro-node"><strong>PromotionRunReconciler</strong><span>Owns the PromotionRun FSM and state.</span></div>
    <div class="kapro-node"><strong>Plugin gateway</strong><span>Normalizes calls, timeouts, probes, and errors.</span></div>
    <div class="kapro-node"><strong>External plugin</strong><span>Talks to the backend or policy service.</span></div>
    <div class="kapro-node"><strong>Status</strong><span>Kapro records normalized result and evidence.</span></div>
  </div>
</div>

## PluginRegistration

`PluginRegistration` is the Kubernetes API preview for out-of-process plugins.
It declares the plugin endpoint, plugin type, TLS or Secret references,
contract versions, and timeout behavior.

When `pluginGateway.enabled=true`, the operator sets
`KAPRO_ENABLE_PLUGIN_GATEWAY=true`. Ready backend adapter and gate registrations with a
fresh observed generation can be loaded when the operator starts. Planner
registrations are probed and reported in status as part of the KPI preview.

Dynamic hot reload is future work, so restart the operator after applying or
changing runtime plugin registrations.

## Compatibility Status

Kapro reports plugin readiness and compatibility on `PluginRegistration`
status. Unsupported or missing KAI, KGI, or KPI contract versions should show a
non-ready or incompatible condition instead of failing later during a rollout.

Plugin authors should document:

- backend permissions required by the plugin;
- idempotency behavior;
- timeout behavior;
- failure modes;
- tested Kapro version and contract version;
- image digest and registration manifest.

## Conformance

The Kapro source repo ships conformance packages for plugin authors:

```text
conformance/actuator
conformance/gate
conformance/planner
```

Use them before enabling a plugin image in a production hub. Passing
conformance does not give a plugin authority over Kapro state; it only verifies
that the plugin behaves according to the published contract shape.

## Built-In and Example Plugins

The Kapro repository includes example external plugins for common integration
patterns:

| Example | Purpose |
|---|---|
| Argo CD adapter | Applies selected versions through Argo CD Application-style backends. |
| Argo CD ApplicationSet adapter | Integrates with ApplicationSet-based fleet delivery. |
| SLO gate | Evaluates service-level evidence before a target advances. |
| Capacity planner | Influences target ordering and admission using planner logic. |

These examples are integration references. The stable boundary is the contract:
backend adapter, gate, planner, registration, readiness, and conformance.
