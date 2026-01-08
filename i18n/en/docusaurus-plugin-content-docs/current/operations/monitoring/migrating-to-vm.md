---
sidebar_position: 2
---

# Switch from Influxdb to VictoriaMetrics

VictoriaMetrics has less resource usage and faster query speed compared to Influxdb. Starting from version v3.10.8, the monitoring backend TSDB (time-series database) can be switched from Influxdb to VictoriaMetrics.

:::tip
We will use VictoriaMetrics as the TSDB by default in version 3.11.
So the following operations only take effect for versions before 3.11.
:::

## Deploy VictoriaMetrics

As long as you upgrade to v3.10.8, the VictoriaMetrics service will be automatically deployed in kubernetes clusters deployed using ocboot. You can use the following command to check pod running status:

```bash
$ kubectl get pods -n onecloud | grep victoria
default-victoria-metrics-6d6fcc68d5-q68mj            1/1     Running            0          25d
```

If the pod starting with `default-victoria-metrics-` has status Running, it means the VictoriaMetrics service deployment is complete.

## Switch

Now both Influxdb and VictoriaMetrics services exist in the cluster. You can use the following command to check pod running status:

```bash
$ kubectl get pods -n onecloud | egrep 'victoria|influxdb'
default-influxdb-5dcfc8964d-5csrw                    1/1     Running            0          23d
default-victoria-metrics-6d6fcc68d5-q68mj            1/1     Running            0          25d
```

Now use the following steps to make the platform use VictoriaMetrics as the default TSDB.

### Disable operator Management of influxdb Service

First disable the operator service's management of influxdb, as follows:

```bash
$ kubectl patch onecloudcluster -n onecloud default --type='json' -p='[{op: replace, path: /spec/influxdb/disable, value: true}]'
```

### Delete influxdb Registration Address in Platform

Then delete the influxdb endpoint in the platform, as follows:

```bash
$ climc endpoint-list --service influxdb | awk '{print $2}' | xargs -I {} sh -c 'climc endpoint-update --disable {} && climc endpoint-delete {}'
```

Delete the platform's influxdb service, as follows:

```bash
$ climc service-update --disabled influxdb && climc service-delete influxdb
```

### Restart Platform Services

When there is only the `victoria-metrics` endpoint in the platform, it will automatically use the VictoriaMetrics corresponding to the endpoint as the TSDB backend. You can use the following command to view the endpoint registered by VictoriaMetrics in the platform:

```bash
$ climc endpoint-list --search victoria-metrics --details
```

:::warning
Here you must ensure there are no infludb-type addresses in the endpoint, otherwise the platform will default to using influxdb as the backend TSDB.
You can use the following command to check if there are any influxdb-type endpoints.

```bash
$ climc endpoint-list --search influxdb --details
```
:::

Restart platform services that will connect to TSDB through the following command:

```bash
$ kubectl get deployment -n onecloud | egrep 'region|monitor|meter|cloudmon|suggestion' | awk '{print $1}' | xargs kubectl rollout restart deployment -n onecloud
```

Restart host service (if it's a multi-cloud management version, skip this step):

```bash
$ kubectl -n onecloud rollout restart daemonset default-host
```

Finally, you can use the following command to check if the monitor service is using VictoriaMetrics as the backend TSDB:

```bash
$ kubectl logs -n onecloud $(kubectl get pods -n onecloud | grep monitor | awk '{print $1}') | grep 'TSDB data source'
```

If the following log appears, it means the monitor service has successfully used VictoriaMetrics as the backend TSDB.

```
[info 2023-12-04 07:01:53 datasource.(*dataSourceManager).setDataSource(datasource.go:116)] set TSDB data source "victoria-metrics": "https://default-victoria-metrics:30428"
```

## Migrate Influxdb Monitoring Data (Optional)

:::tip
If the monitoring data previously in Influxdb is not important, you don't need to migrate the data. The following operations apply to environments that want to migrate Influxdb historical monitoring data to VictoriaMetrics.

Also, data migration must ensure both Influxdb and VictoriaMetrics services are running simultaneously.
:::

### Download vmctl Migration Tool

Mainly download the vmctl tool to import Influxdb historical data into VictoriaMetrics. Please download the corresponding version according to your environment. Download addresses are as follows:

- x86_64: [https://github.com/zexi/VictoriaMetrics/releases/download/v1.94.0-vmctl-https-import/vmctl-linux-amd64](https://github.com/zexi/VictoriaMetrics/releases/download/v1.94.0-vmctl-https-import/vmctl-linux-amd64)
- arm64: [https://github.com/zexi/VictoriaMetrics/releases/download/v1.94.0-vmctl-https-import/vmctl-linux-arm64](https://github.com/zexi/VictoriaMetrics/releases/download/v1.94.0-vmctl-https-import/vmctl-linux-arm64)

The following uses x86_64 environment as an example:

:::tip
All the following commands are executed after logging into the platform's control node.
:::

```bash
# Download vmctl-linux-amd64 tool
$ wget https://github.com/zexi/VictoriaMetrics/releases/download/v1.94.0-vmctl-https-import/vmctl-linux-amd64

# Add executable permission
$ chmod a+x ./vmctl-linux-amd64

# Put in /opt/yunion/bin directory
$ mv ./vmctl-linux-amd64 /opt/yunion/bin
```

### Migrate Data

Write the following migration script. Assume the control node's ip is 192.168.222.171, then the Influxdb and VictoriaMetrics service addresses in the environment are:

- Influxdb: https://192.168.222.171:30086
- VictoriaMetrics: https://192.168.222.171:30428

Save the following shell script to the `./vm-mig.sh` file.

```bash
#!/bin/bash

# Specify Influxdb and VictoriaMetrics service addresses
IP=192.168.222.171
VM_URL="https://$IP:30428"
INFLUX_URL="https://$IP:30086"

# Specify the start and end time period for migrating Influxdb data
START_TIME='2023-11-10T00:00:00Z'
END_TIME='2023-12-10T00:00:00Z'

/opt/yunion/bin/vmctl-linux-amd64 influx -s \
        --influx-retention-policy 30day_only \
        --influx-addr $INFLUX_URL --influx-database telegraf \
        --influx-concurrency 4 \
        --influx-filter-time-start $START_TIME \
        --influx-filter-time-end $END_TIME \
        --vm-addr $VM_URL
```

Finally execute the migration script. The migration time depends on the amount of data in Influxdb.

```bash
$ bash -x ./vm-mig.sh
```

## Delete influxdb Service

After using VictoriaMetrics as TSDB, you can delete the Influxdb service, as follows:

```bash
$ kubectl delete deployment -n onecloud default-influxdb
```

## Access VictoriaMetrics Frontend

By default, you can access the VictoriaMetrics frontend web interface via `https://control node IP:30428/vmui/` to check if data is being reported.

For specific usage, please refer to the documentation: [Query VictoriaMetrics Data](../../development/monitor/query.md#query-victoric-metrics-data).

