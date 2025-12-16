---
sidebar_position: 4
---

# Automatic Migration

  Automatically migrate VMs on host machines based on host CPU usage or free memory.

## Use Cases

- When host CPU usage exceeds threshold or memory exceeds threshold, automatically migrate some VMs on the host to hosts within a specified range
- When host CPU usage exceeds threshold or memory exceeds threshold, automatically migrate some VMs on the host to the least loaded host

## Monitoring Metrics

Each host machine has corresponding cpu.usage_active and mem.available monitoring metrics, described as follows:

- cpu.usage_active: Total CPU core usage rate, upper limit is 100%, indicating all cores are in busy state
- mem.available: Available memory size, unit is Byte

## Implementation Principle

Create corresponding host monitoring alert metrics. When a host triggers an alert, the monitoring service selects corresponding VMs on the host for migration based on the difference between the metric's current value and threshold.

## Usage Instructions

### CPU

The following example shows migrating VMs to other hosts when host CPU exceeds threshold:

1. Create a migration rule for cpu.usage_active, named test-cpu, monitoring metrics on host test-66-onecloud02. When cpu.usage_active is greater than 60%, trigger automatic migration, check every 2 minutes

```bash
$ climc monitor-migrationalert-create \
    --period 2m \
    --source-host test-66-onecloud02 \
    test-cpu cpu.usage_active.gt 60
```

2. Create corresponding VMs for testing. Assuming the host has 40 CPU cores, to reach the threshold to trigger migration, the VM's CPU core count needs to be 24 (40 * 60%) cores. Then use the stress-ng stress testing tool in the VM to push all cores to 100%

```bash
# Create VM
$ climc server-create --disk CentOS-7.6.1810-20190430.qcow2 \
    --net your-net \
    --mem-spec 1g \
    --ncpu 24 \
    --allow-delete \
    --auto-start \
    --prefer-host test-66-onecloud02 \
    cpu-test-vm

# Log into VM, use stress-ng to stress test CPU
$ climc server-ssh cpu-test-vm
(cpu-test-vm)$ yum install -y stress-ng
(cpu-test-vm)$ stress-ng --cpu 24 --timeout 36000s
```

3. Check monitoring migration records after 2 minutes

:::tip
The following method of viewing underlying monitoring data only applies to Influxdb. If using VictoriaMetrics to store underlying monitoring data, please refer to the documentation: [Query VictoriaMetrics Data](../../development/monitor/query.md#query-victoric-metrics-data).
:::

```bash
# You can first log into influxdb to view current host monitoring metrics
$ kubectl exec -ti -n onecloud $(kubectl get pods -n onecloud | grep default-influxdb | awk '{print $1}') -- influx -host 127.0.0.1 -port 30086 -type influxql -ssl  -precision rfc3339 -unsafeSsl
Connected to https://127.0.0.1:30086 version 1.7.7
InfluxDB shell version: 1.7.7
> use telegraf

# Get host_id as 6fc10297-eb20-4a96-86a8-4b65260d6016 through climc host-list --search test-66-onecloud02
# Below shows that the host's cpu.usage_active metric in the past 2m has exceeded the 60% threshold
> select usage_active from cpu where host_id = '6fc10297-eb20-4a96-86a8-4b65260d6016' and time > now() - 2m  GROUP BY "host_id"
name: cpu
tags: host_id=6fc10297-eb20-4a96-86a8-4b65260d6016
time                 usage_active
----                 ------------
2022-06-28T03:55:00Z 62.90831581190119
2022-06-28T03:56:00Z 70.15669899594904

# View alert migration records
# Find id as a7a92f4a-fed1-49bb-880b-59eae5185acc
$ climc monitor-migrationalert-list --scope system
+--------------------------------------+----------+------------------+
||                  id                  |   name   |   metric_type    |
+--------------------------------------+----------+------------------+
|| a7a92f4a-fed1-49bb-880b-59eae5185acc | test-cpu | cpu.usage_active |
+--------------------------------------+----------+------------------+

# View migration record events
$ climc monitor-migrationalert-event a7a92f4a-fed1-49bb-880b-59eae5185acc --scope system
+--------+-----------------------------+--------------------------------------+----------------+----------+--------------+--------+------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
||   id   |          ops_time           |                obj_id                |    obj_type    | obj_name |     user     | tenant |      action      |                                                                                                                                                                         notes                                                                                                                                                                          |
+--------+-----------------------------+--------------------------------------+----------------+----------+--------------+--------+------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|| 428124 | 2022-06-28T07:40:02.000000Z | a7a92f4a-fed1-49bb-880b-59eae5185acc | migrationalert | test-cpu | monitoradmin | system | find_result_fail | find result to migrate: not found target for guest &balancer.cpuCandidate{guestResource:(*balancer.guestResource)(0xc001963c20), usageActive:99.46995000000001, guestCPUCount:24, hostCPUCount:40}: [host:test-69-onecloud01:current(55.313408) + guest:cpu-test-vm:score(59.681970) >= threshold(60.000000), host:a15:current(62.305391) + guest:cpu-test-vm:score(59.681970) >= threshold(60.000000)] |
|| 427991 | 2022-06-28T03:56:57.000000Z | a7a92f4a-fed1-49bb-880b-59eae5185acc | migrationalert | test-cpu | sysadmin     | system | create           | {"id":"a7a92f4a-fed1-49bb-880b-59eae5185acc","name":"test-cpu","res_name":"migrationalert"}                                                                                                                                                                                                                                                            |
+--------+-----------------------------+--------------------------------------+----------------+----------+--------------+--------+------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
# Found a find_result_fail record, indicating that although an alert occurred, no corresponding target host was found for migration
# The reason is that the other two hosts in the cluster test-69-onecloud01 currently have metrics of 55.313408%, a15 is 59.681970%. If migrating cpu-test-vm's 59.681970% CPU load to the other two hosts
# Would cause the other two hosts to exceed the threshold, so it failed


# If cluster node load is reduced or new hosts are added, VMs with high load are expected to migrate. Below is a successful migration record
# Assuming I recreated a migration rule for host a15 using climc monitor-migrationalert-create, trigger when greater than 60, id is afc9468c-2cd7-4be8-83c7-92d7535a53cf
$ climc monitor-migrationalert-event afc9468c-2cd7-4be8-83c7-92d7535a53cf --scope system
+--------+-----------------------------+--------------------------------------+----------------+----------+--------------+--------+-----------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
||   id   |          ops_time           |                obj_id                |    obj_type    | obj_name |     user     | tenant |  action   |                                                                                                                                                        notes                                                                                                                                                         |
+--------+-----------------------------+--------------------------------------+----------------+----------+--------------+--------+-----------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|| 428147 | 2022-06-28T07:56:01.000000Z | afc9468c-2cd7-4be8-83c7-92d7535a53cf | migrationalert | test-cpu | monitoradmin | system | migrating | {"guest":{"host":"a15","host_id":"733b10fa-bd33-4503-836d-2ccd225bf12f","id":"a3107d1f-c46e-43cf-8aa8-55743d1533b1","name":"aisenzhe","score":10.769393333333335,"vcpu_count":8,"vmem_size":8192},"target_host":{"id":"6fc10297-eb20-4a96-86a8-4b65260d6016","name":"test-66-onecloud02","score":22.65071999099409}} |
+--------+-----------------------------+--------------------------------------+----------------+----------+--------------+--------+-----------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
# The above information indicates migrating VM aisenzhe (cpu.usage_active 10.76%) on a15 to target host test-66-onecloud02 (cpu.usage_active 22.65%)

# View VM status shows it's migrating
$ climc server-list --search aisenzhe --scope system
+--------------------------------------+----------+--------------+-----------+------------+-----------+-----------+-----------------------------+------------+---------+-----------+
||                  ID                  |   Name   | Billing_type |  Status   | vcpu_count | vmem_size | Secgrp_id |         Created_at          | Hypervisor | os_type | is_system |
+--------------------------------------+----------+--------------+-----------+------------+-----------+-----------+-----------------------------+------------+---------+-----------+
|| a3107d1f-c46e-43cf-8aa8-55743d1533b1 | aisenzhe | postpaid     | migrating | 8          | 8192      | default   | 2022-01-06T08:34:45.000000Z | kvm        | Linux   | false     |
+--------------------------------------+----------+--------------+-----------+------------+-----------+-----------+-----------------------------+------------+---------+-----------+

# Hot migration will continue for a period of time, specific time depends on VM memory and disk size. After migration completes, a successful migration log will be recorded
```

### Other Operations

```bash
# Automatically adjust cluster host CPU load, i.e., do not specify --source-host parameter
$ climc monitor-migrationalert-create --period 5m all-host-cpu cpu.usage_active.gt 80

# Specify target hosts. When host cpu.usage_active is greater than 80, can only migrate to target hosts host1 and host2
$ climc monitor-migrationalert-create --period 5m --target-host host1 --target-host host2 target-host-cpu cpu.usage_active.gt 80

# Specify monitored source hosts, only care about monitoring for src-host1 and src-host2
$ climc monitor-migrationalert-create --period 5m --source-host src-host1 --source-host src-host2 src-host-cpu cpu.usage_active.gt 80

# Specify source VMs for migration. When host cpu.usage_active is greater than 80, can only migrate VMs gst1 and gst2
$ climc monitor-migrationalert-create --period 5m --source-guest gst1 --source-guest gst2 host-gst-cpu cpu.usage_active.gt 80
```

## Notes

This feature is currently only an alpha version and may not be stable, limited to testing use only.

Additionally, to prevent inaccurate migration condition judgment causing VMs on hosts to migrate to each other, eventually causing a cascade effect.

Currently, at the same time, only one alert-triggered migration logic will migrate a batch of machines at once. If another migrationalert alert rule triggers at this moment, it will abandon this migration. It must wait until there are no other migrationalert-triggered migrations globally before starting its own migration logic.
