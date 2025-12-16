---
sidebar_position: 1
---

# Monitoring Introduction

## Monitoring Service Architecture

Mainly consists of the following components:

- Monitoring Agent (telegraf): Monitoring data collection agent deployed on host machines or inside VMs, currently using open-source telegraf.

- cloudmon: Actively pulls monitoring data from various platforms, collects usage metrics, and performs ping monitoring.

- influxdb or VictoriaMetrics: Time-series data storage backend for monitoring.

- monitor: Provides monitoring service API, shielding differences in backend monitoring. Also provides functions for querying monitoring metrics and alerts.


## Monitoring Data Collection

Monitoring data is collected through several channels:

- Private cloud host machines: Collect monitoring data through telegraf deployed on host machines.

- Private cloud VMs: Report data by deploying telegraf monitoring agent inside VMs.

- Cloud platform VMs: Periodically call APIs of various platforms through cloudmon service to collect monitoring data.
