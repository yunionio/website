---
sidebar_position: 1
---

# Query API

Overview of the unifiedmonitor query interface of the monitor monitoring service, and some additional notes.

## Query Request

Currently, the backend of the monitoring service connects to InfluxDB. Query requests sent will be converted to InfluxDB query requests, and then return converted related metrics.

- Method: POST
- Path: /api/v1/unifiedmonitors/query/
- Body: Content reference examples below

### Query Examples

The following query requests will be converted to InfluxDB query requests:

1. Query virtual machine CPU usage rate

```javascript
{
    "metric_query": [
        {
            "model": {
                "measurement": "vm_cpu", // Corresponds to measurement in InfluxDB
                "select": [ // Corresponds to SELECT
                    [
                        {
                            "type": "field",
                            "params": [
                                "usage_active" // Metric field to query
                            ]
                        },
                        {
                            "type": "mean", // Get average value. For other supported types, refer to: https://github.com/yunionio/cloudpods/blob/v3.10.0-rc2/pkg/monitor/tsdb/driver/influxdb/query_part.go#L36-L116
                            "params": []
                        },
                        {
                            "type": "alias", // Set alias
                            "params": [
                                "CPU Usage Rate"
                            ]
                        }
                    ]
                ],
                "tags": [ // Corresponds to WHERE
                    {
                        "key": "vm_id",
                        "value": "49d1f759-138e-4495-8e35-94c2128374f1",
                        "operator": "="
                    },
                    {
                        "condition": "OR", // Can set OR and AND
                        "key": "hostname",
                        "value": "vm1",
                        "operator": "="
                    }
                ],
                "group_by": [ // Corresponds to GROUP BY
                    {
                        "type": "tag",
                        "params": [
                            "vm_id"
                        ]
                    }
                ]
            }
        }
    ],
    "scope": "system", // Query resource scope, system represents global scope, domain represents domain scope, project represents project scope
    "from": "1h", // Query metrics from the past 1h
    "to": "now", // To now, not required, default is from from to now
    "interval": "1m", // Metric interval
    "skip_check_series": false, // Whether to skip resource check with cloud platform and supplement missing tags
    "signature": "3be888cf6e45cb72cc1103ec0fd789572e2f3dc93566a8fe86694518e83625e8" // Signature calculated from the above fields
}
```

The converted InfluxDB request is:

```sql
SELECT mean("usage_active") AS "CPU Usage Rate" FROM "vm_cpu"
WHERE ("vm_id" = '49d1f759-138e-4495-8e35-94c2128374f1' OR "hostname" = 'vm1') and time > now() - 1h
GROUP BY "vm_id", time(1m) fill(none)
```

More supported query examples:

You can refer to: [https://github.com/yunionio/cloudpods/blob/v3.10.0-rc2/pkg/monitor/tsdb/driver/influxdb/query_test.go](https://github.com/yunionio/cloudpods/blob/v3.10.0-rc2/pkg/monitor/tsdb/driver/influxdb/query_test.go)

```
# The following request body corresponds to InfluxDB SQL: "SELECT mean(\"free\") / mean(\"total\") FROM \"disk\" WHERE (\"path\" = '/') AND time > now() - 1h GROUP BY *, time(2m) fill(none)"

{
	"database": "telegraf",
	"measurement": "disk",
	"select": [
		[
			{
				"type": "field",
				"params": [
					"free"
				]
			},
			{
				"type": "mean"
			},
			{
				"type": "math",
				"params": [
					"/ mean(\"total\")"
				]
			}
		]
	],
	"tags": [
		{
			"key": "path",
			"value": "/",
			"operator": "="
		}
	]
}
```

2. Custom query time range

By setting the from and to parameters, you can define the query time range. Metrics in InfluxDB are retained for 30 days by default.

Both from and to need to be converted to Unix epoch format, for example:

```javascript
{
  "metric_query": [...],
  "from": "1474973725473", // Tuesday, September 27, 2016, 6:55 PM GMT+08:00
  "to":   "1474975757930", // Tuesday, September 27, 2016, 7:29 PM GMT+08:00
}
```

## SDK

You can use the following SDKs to construct monitoring query requests in a convenient way:

- Go:
    - Construct query request: [MetricQueryInput](https://github.com/yunionio/cloudpods/blob/release/3.10/pkg/mcclient/modules/monitor/helper.go#L587-L672)
    - Make request: [PerformQuery](https://github.com/yunionio/cloudpods/blob/release/3.10/pkg/mcclient/modules/monitor/mod_unifiedmonitor.go#L52-L54)
    - Usage examples:
        - [Command line parameters](https://github.com/yunionio/cloudpods/blob/release/3.10/pkg/mcclient/options/monitor/unifiedmonitor.go#L67-L116)
        - [Server-side construction](https://github.com/yunionio/cloudpods/blob/release/3.10/pkg/monitor/models/unifiedmonitor.go#L533-L555)

- Java:
    - Construct query request: [MetricQueryInput](https://github.com/yunionio/mcclient_java/blob/v3.2.10/src/main/java/com/yunionyun/mcp/mcclient/managers/impl/monitor/MetricQueryInput.java)
    - Make request: [PerformQuery](https://github.com/yunionio/mcclient_java/blob/v3.2.10/src/main/java/com/yunionyun/mcp/mcclient/managers/impl/monitor/UnifiedMonitorManager.java#L30-L32)
    - Usage examples: [Refer to this PR](https://github.com/yunionio/mcclient_java/pull/52/files#diff-64be3a95e81733de6ac3e486a4631b18b031c2720106473fbb16d25a9cae4dd9R19-R35)

## Signature

The signature is used to prevent query conditions from being tampered with. If this function is not needed, you can configure the monitor service to disable it.

### Disable Signature

Use the following method to disable signature verification:

```bash
# Modify monitor service configmap configuration
$ kubectl edit configmap -n onecloud default-monitor
...
    # Change this configuration to true
    disable_query_signature_check: true
...

# Restart monitor service
$ kubectl rollout restart deployment -n onecloud default-monitor
```

### Calculation Method

If you need to use the signature verification function, you can refer to the following method to calculate signature:

The signature calculation method can refer to this frontend JavaScript code: [https://github.com/yunionio/dashboard/blob/v3.10.0-rc2/src/utils/crypto.js#L11-L18](https://github.com/yunionio/dashboard/blob/v3.10.0-rc2/src/utils/crypto.js#L11-L18)

## Command Line Tool

Use the `climc monitor-unifiedmonitor-query` command to query platform monitoring data.

```bash
# Query usage_active metric in vm_cpu measurement
$ climc --debug monitor-unifiedmonitor-query vm_cpu usage_active

# Set metric interval to 1m, and use --tags for filtering
$ climc --debug monitor-unifiedmonitor-query --interval 1m --tags vm_id=e0d3c5ce-ec65-42ad-89d9-0b75953f841e --tags zone=YunionHQ vm_cpu usage_active

# Query data within time range
$ climc --debug monitor-unifiedmonitor-query --from 2023-12-07T23:54:42.123Z --to 2023-12-08T13:54:42.123Z vm_cpu usage_active
```

## Direct Query Monitoring Data

The platform now supports storing monitoring data in VictoriaMetrics or InfluxDB. You can use the following methods to query related time-series database monitoring data.

For switching from InfluxDB to VictoriaMetrics, refer to the document: [Switch from InfluxDB to VictoriaMetrics](../../../onpremise/operations/monitoring/migrating-to-vm).

### Query VictoriaMetrics Data {#query-victoric-metrics-data}

If using VictoriaMetrics as the monitoring backend, you can access the VictoriaMetrics frontend web interface through `https://Control Node IP:30428/vmui/`. VictoriaMetrics uses MetricsQL query syntax. Here are some query examples:

```bash
# Query cpu usage_active metric
cpu_usage_active

# Query disk free metric, filter condition is host_id="32d41926-6038-42a3-8a31-40c08274823b"
disk_free{host_id="32d41926-6038-42a3-8a31-40c08274823b"}

# Query disk free metric, filter conditions are device="sda2",path="/opt/cloud"
disk_free{device="sda2",path="/opt/cloud"}

# Query metrics starting with mem_
{__name__=~"mem_.*"}

# Query mem used metric, filter condition uses regular expression host=~"ha-test0[1,2].*"
mem_used{host=~"ha-test0[1,2].*"}
```

For specific usage, refer to the documentation:

- [MetricsQL](https://docs.victoriametrics.com/MetricsQL.html)

- Description of telegraf reporting monitoring metric format is as follows:

:::tip
The current monitoring data reporting format is InfluxDB line format. When monitoring metrics are sent to VictoriaMetrics, they will be automatically converted to the related format.

For example, InfluxDB line format: `cpu,tag1=value1 usage_active=30` 

Will be converted to VictoriaMetrics format: `cpu_usage_active{tag1="value1"} 30`

For specific format conversion, refer to the following documentation:

- [How to send data from InfluxDB-compatible agents such as Telegraf](https://docs.victoriametrics.com/Single-server-VictoriaMetrics.html#how-to-send-data-from-influxdb-compatible-agents-such-as-telegraf)
:::


### Query InfluxDB Data

If using InfluxDB as the monitoring backend, you can use the following method to directly enter the InfluxDB container and use the command line to query metrics:

```bash
$ kubectl exec -ti -n onecloud $(kubectl get pods -n onecloud | grep default-influxdb | awk '{print $1}') -- influx -host 127.0.0.1 -port 30086 -type influxql -ssl  -precision rfc3339 -unsafeSsl

# Use telegraf database
use telegraf

# View available measurements
show measurements
```
