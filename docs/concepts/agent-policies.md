---
sidebar_position: 16
---

import ConceptDiagram from '@site/src/components/ConceptDiagram';

# AgentPolicies

<ConceptDiagram id="agent-policies" />

`AgentPolicy` defines the boundary for future policy-bound agent workflows.

<div class="kapro-lesson">
  <img src="/img/logo.png" alt="Kapro mascot" />
  <div>
    <strong>An AgentPolicy keeps helpers helpful.</strong>
    <p>Agents can explain, summarize, and recommend. The controller still enforces policy, gates, approvals, and the state machine.</p>
  </div>
</div>

Kapro can expose rich PromotionRun state, gate evidence, planner decisions, events,
and audit history to external agents. Those agents must remain advisory unless
explicit policy allows a bounded action.

<div class="kapro-map">
  <div class="kapro-map-row">
    <div class="kapro-map-item"><strong>Kapro status</strong><span>PromotionRun, targets, gates, events, evidence.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>Agent</strong><span>Explains or recommends within policy.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>AgentPolicy</strong><span>Allowed identities, actions, stages, and targets.</span></div>
    <div class="kapro-arrow">-></div>
    <div class="kapro-map-item"><strong>Controller enforcement</strong><span>Kapro remains deterministic and auditable.</span></div>
  </div>
</div>

## What Agents May Do

Under policy, an agent may:

- explain why a PromotionRun is stuck;
- summarize gate evidence;
- draft a recommendation;
- request approval;
- suggest a rollback PromotionRun;
- route context to an incident or ticketing workflow.

## Example Policy Shape

```yaml
apiVersion: kapro.io/v1alpha1
kind: AgentPolicy
metadata:
  name: promotion-explainer
spec:
  allowedActions:
    - explain
    - recommend
  scope:
    stages:
      - canary
      - production-eu
    targets:
      selector:
        matchLabels:
          kapro.io/team: checkout
  enforcement:
    controllerAuthoritative: true
```

Read that as: the agent can explain and recommend for checkout targets, but the
controller still owns the real rollout decision.

## What Agents Must Not Do

Agents must not bypass:

- gates;
- approvals;
- RBAC;
- admission policy;
- plugin compatibility checks;
- Kapro's deterministic PromotionRun state machine.

## Why This Exists

Fleet promotion has useful context for assistants, but the rollout authority
should stay deterministic and auditable. `AgentPolicy` is the place to describe
allowed identities, stages, targets, actions, and guardrails.

Core Kapro rollout execution continues to work when no agent is installed.
