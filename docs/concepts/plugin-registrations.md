---
sidebar_position: 14
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# PluginRegistrations

<ConceptDiagram id="plugin-registrations" />

`PluginRegistration` is the platform-owned declaration for an external Kapro
plugin.

<div class="kapro-lesson">
  <img src="/img/logo.png" alt="Kapro mascot" />
  <div>
    <strong>A PluginRegistration is how a plugin raises its hand.</strong>
    <p>The plugin says what it can do, where it listens, and which contract version it speaks. Kapro checks readiness before using it.</p>
  </div>
</div>

It lets platform teams register backend adapter, gate, or planner plugin endpoints
without letting plugins own Kapro PromotionRun state.

<div class="kapro-map">
  <div class="kapro-map-row">
    <div class="kapro-map-item"><strong>PluginRegistration</strong><span>Endpoint, type, TLS, timeouts, versions.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>Probe</strong><span>Kapro checks readiness and compatibility.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>Runtime call</strong><span>Backend adapter, gate, or planner question.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>Status</strong><span>Kapro records normalized result and evidence.</span></div>
  </div>
</div>

## What It Declares

A registration describes:

- plugin type: backend adapter, gate, or planner;
- endpoint and transport details;
- TLS or Secret references;
- timeout behavior;
- supported KAI, KGI, or KPI contract versions;
- readiness and compatibility status.

## Runtime Boundary

When the plugin gateway is enabled, ready backend adapter and gate registrations can be
loaded at operator startup. Planner registrations are probed and reported in
status as part of the KPI preview.

Plugins answer bounded questions:

| Plugin | Question |
|---|---|
| Backend adapter | How do I apply this version to this target? |
| Gate | May this target advance now? |
| Planner | Which eligible target should bind first? |

Kapro still owns PromotionRun ordering, retries, failures, approvals, and status.

## Conformance

Plugin authors should run the matching conformance harness before enabling a
new image in production:

```text
conformance/actuator
conformance/gate
conformance/planner
```

Conformance checks the contract behavior. It does not grant the plugin
authority over Kapro state.
