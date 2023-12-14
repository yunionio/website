---
sidebar_position: 1
---

# Query API

Overview of the query interface for the `unifiedmonitor` monitoring service provided by monitor.

## Query Request

Currently, the backend of the monitoring service interfaces with InfluxDB. Query requests are converted to InfluxDB query requests, and then related metrics are returned.

- Method: `POST`
- Path: `/api/v1/unifiedmonitors/query/`
- Body: See example below

### Query Example

The following query request will be converted to an InfluxDB query request:

1. Query CPU usage of a virtual machine

```javascript
{
    "metric_query": [
        {
            "model": {
                "measurement": "vm_cpu", // Corresponding to measurement in InfluxDB
                "select": [ // Corresponding to `SELECT`
                    [
                        {
                            "type": "field",
                            "params": [
                                "usage_active" // The queried indicator field
                            ]
                        },
                        {
                            "type": "mean", // Take the average value, other supported types please refer to: https://github.com/yunionio/cloudpods/blob/v3.10.0-rc2/pkg/monitor/tsdb/driver/influxdb/query_part.go#L36-L116
                            "params": []
                        },
                        {
                            "type": "alias", // Set the alias
                            "params": [
                                "CPU usage"
                            ]
                        }
                    ]
                ],
                "tags": [ // Corresponding to `WHERE`
                    {
                        "key": "vm_id",
                        "value": "49d1f759-138e-4495-8e35-94c2128374f1",
                        "operator": "="
                    },
                    {
                        "condition": "OR", // Can be set to `OR` and `AND`
                        "key": "hostname",
                        "value": "vm1",
                        "operator": "="
                    }
                ],
                "group_by": [ // Corresponding to `GROUP BY`
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
    "scope": "system", // Query resource scope: system represents global scope, domain represents domain scope, project represents project scope
        "from": "1h", // Query metrics from the past 1 hour
        "to": "now", // Until now, not required, default is from to now
        "interval": "1m", // Metric interval
        "skip_check_series": false, // Whether to skip resource check by cloud platform and supplement missing tag
        "signature": "3be888cf6e45cb72cc1103ec0fd789572e2f3dc93566a8fe86694518e83625e8" // Signature calculated based on the above fields
}
```

The converted InfluxDB request is:

```sql
SELECT mean("usage_active") AS "CPU Usage" FROM "vm_cpu"
WHERE ("vm_id" = '49d1f759-138e-4495-8e35-94c2128374f1' OR "hostname" = 'vm1') and time > now() - 1h
GROUP BY "vm_id", time(1m) fill(none)
````

More supported queries can be found here:

 [https://github.com/yunionio/cloudpods/blob/v3.10.0-rc2/pkg/monitor/tsdb/driver/influxdb/query_test.go](https://github.com/yunionio/cloudpods/blob/v3.10.0-rc2/pkg/monitor/tsdb/driver/influxdb/query_test.go)

```
# The following request body corresponds to the InfluxDB query: "SELECT mean(\"free\") / mean(\"total\") FROM \"disk\" WHERE (\"path\" = '/') AND time > now() - 1h GROUP BY *, time(2m) fill(none)"

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

2. Customized query time range

By setting the `from` and `to` parameters, the query time range can be customized. InfluxDB retains metrics for 30 days by default.

The `from` and `to` parameters need to be converted to a Unix Epoch format. For example:

```javascript
{
  "metric_query": [...],
  "from": "1474973725473", // Tuesday, September 27, 2016, 6:55:25 PM GMT+08:00
  "to":   "1474975757930", // Tuesday, September 27, 2016, 7:29:17 PM GMT+08:00
}
```

## SDK

The following SDK can be used to construct monitoring query requests:

- Go:
    - Construct query request: [MetricQueryInput](https://github.com/yunionio/cloudpods/blob/release/3.10/pkg/mcclient/modules/monitor/helper.go#L587-L672)
    - Send a request: [PerformQuery](https://github.com/yunionio/cloudpods/blob/release/3.10/pkg/mcclient/modules/monitor/mod_unifiedmonitor.go#L52-L54)
    - Usage examples:
        - [Command line parameters](https://github.com/yunionio/cloudpods/blob/release/3.10/pkg/mcclient/options/monitor/unifiedmonitor.go#L67-L116)
        - [Server-side Construction](https://github.com/yunionio/cloudpods/blob/release/3.10/pkg/monitor/models/unifiedmonitor.go#L533-L555)

- Java:
    - Construct query request: [MetricQueryInput](https://github.com/yunionio/mcclient_java/blob/v3.2.10/src/main/java/com/yunionyun/mcp/mcclient/managers/impl/monitor/MetricQueryInput.java)
    - Request initiation: [PerformQuery](https://github.com/yunionio/mcclient_java/blob/v3.2.10/src/main/java/com/yunionyun/mcp/mcclient/managers/impl/monitor/UnifiedMonitorManager.java#L30-L32)
    - Example usage: [Refer to this PR](https://github.com/yunionio/mcclient_java/pull/52/files#diff-64be3a95e81733de6ac3e486a4631b18b031c2720106473fbb16d25a9cae4dd9R19-R35)

## Signature

The purpose of a signature is to prevent tampering with query conditions. If this feature is not needed, the monitor service can be configured to disable it.

### Disabling Signature

Use the following method to disable signature verification:

```bash
# Edit the monitor service configmap
$ kubectl edit configmap -n onecloud default-monitor
...
    # Set this configuration to true
    disable_query_signature_check: true
...

# Restart the monitor service
$ kubectl rollout restart deployment -n onecloud default-monitor
```

### Calculation Method

If you need to use the signature verification feature, you can refer to the following method to calculate the signature:

The calculation method of the signature can refer to the frontend JavaScript code here: [https://github.com/yunionio/dashboard/blob/v3.10.0-rc2/src/utils/crypto.js#L11-L18](https://github.com/yunionio/dashboard/blob/v3.10.0-rc2/src/utils/crypto.js#L11-L18)

## Command-line Tool

The `climc monitor-unifiedmonitor-query` command can be used to query platform monitoring data.

```bash
# Query the `usage_active` indicator in the vm_cpu measurement
$ climc --debug monitor-unifiedmonitor-query vm_cpu usage_active

# Set the indicator interval to `1m` and filter using `--tags`
$ climc --debug monitor-unifiedmonitor-query --interval 1m --tags vm_id=e0d3c5ce-ec65-42ad-89d9-0b75953f841e --tags zone=YunionHQ vm_cpu usage_active

# Query data within a time period
$ climc --debug monitor-unifiedmonitor-query --from 2023-12-07T23:54:42.123Z --to 2023-12-08T13:54:42.123Z vm_cpu usage_active
```

## Directly Querying Monitoring Data

The platform now supports storing monitoring data in either VictoriaMetrics or InfluxDB. The following method can be used to query the monitoring data of the corresponding time series databases.

Regarding the switch from InfluxDB to VictoriaMetrics, refer to the document: [Switching from InfluxDB to VictoriaMetrics](../../operations/monitoring/migrating-to-vm.md).

### Querying VictoriaMetrics Data

If you use VictoriaMetrics as the monitoring backend, you can access the VictoriaMetrics frontend web interface through `https://control-node-IP:30428/vmui/`. VictoriaMetrics uses MetricsQL query syntax, please refer to the following documents for specific usage:

- [MetricsQL](https://docs.victoriametrics.com/MetricsQL.html)

:::tip
Currently, the format for reporting monitoring data is InfluxDB line format. When monitoring metrics are sent to VictoriaMetrics, they will be automatically converted to the corresponding format.

For example, the InfluxDB line format: `cpu,tag1=value1 usage_active=30`

Will be converted to VictoriaMetrics format: `cpu_usage_active{tag1="value1"} 30`

Please reference the following document for specific format conversions:

- [How to send data from InfluxDB-compatible agents such as Telegraf](https://docs.victoriametrics.com/Single-server-VictoriaMetrics.html#how-to-send-data-from-influxdb-compatible-agents-such-as-telegraf)
:::


### Query InfluxDB data

If you use InfluxDB as the monitoring backend, you can directly enter the InfluxDB container to use the command line for querying metrics using the following method:

```bash
$ kubectl exec -ti -n onecloud $(kubectl get pods -n onecloud | grep default-influxdb | awk '{print $1}') -- influx -host 127.0.0.1 -port 30086 -type influxql -ssl  -precision rfc3339 -unsafeSsl

# Use telegraf database
use telegraf

# View available measurements
show measurements
```
