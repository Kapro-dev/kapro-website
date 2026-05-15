---
sidebar_position: 2
---

# Operations

This guide documents the operational posture for running Kapro as a fleet promotion controller.

## Metrics

The operator exposes Prometheus metrics on :8080. Key metrics:

| Metric | Type | Use |
|---|---|---|
| kapro_controller_reconciles_total | counter | Reconcile volume and error rate |
| kapro_controller_reconcile_duration_seconds | histogram | Reconcile latency |
| kapro_sync_transitions_total | counter | Target FSM phase transitions |
| kapro_gate_evaluations_total | counter | Gate pass, fail, inconclusive rate |
| kapro_stage_duration_seconds | histogram | Stage duration by pipeline |
| kapro_release_active_total | gauge | Non-terminal Releases |
| kapro_plugin_probe_ready | gauge | Plugin readiness |

## Alerts

| Alert | Signal |
|---|---|
| KaproReleaseStuck | Active Releases remain non-terminal for a sustained window |
| KaproGateFailureRateHigh | Gate failures exceed 10% of evaluations |
| KaproPluginProbeFailures | Plugin probe failures or readiness drops |
| KaproReleaseTriggerBlocked | ReleaseTrigger reconciles are failing |
| KaproControllerReconcileErrors | Sustained reconcile errors |

## Workqueue Tuning

- Start with 5 concurrent reconciles for hub clusters below 500 targets.
- Keep plugin timeouts short.
- Prefer gate interval values of at least 30s.

## Sharding

Set KAPRO_SHARD on an operator replica to enable shard selection:

- Run one shard per major environment or region.
- Assign objects using kapro.io/shard label.

## Runbook: Stuck Release

```bash
kubectl get releases,releasetargets,releasetriggers,pluginregistrations
kubectl describe release <release>
kubectl get releasetargets -l kapro.io/release=<release> -o wide
kubectl logs -n kapro-system deploy/kapro-operator --since=30m
```

| Phase | Likely blocker |
|---|---|
| Pending | Stage dependency, planner deferral, suspended Release |
| Verification | Artifact verification failure |
| HealthCheck | MemberCluster health not ready |
| Soaking | Normal soak delay |
| MetricsCheck | Prometheus query false or unreachable |
| WaitingApproval | Approval not created or rejected |
| Applying | Actuator backend not converging |

## Runbook: Rollback

Rollback is a delivery action, not a status edit.

1. Identify the last known good digest from ReleaseTarget.status.previousVersion.
2. Create a new Release pinned to that digest.
3. Use conservative maxParallel and approval gates.
4. Keep the failed Release for audit.
