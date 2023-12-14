---
sidebar_position: 2
---

# Switching Influxdb to VictoriaMetrics

VictoriaMetrics has fewer resource requirements and faster query speed than Influxdb. Starting from version v3.10.8, the monitoring backend TSDB (time-series database) can be switched from Influxdb to VictoriaMetrics.

:::tip
We will use VictoriaMetrics as the default TSDB starting from version 3.11. So the following steps only apply to versions before 3.11.
:::

## Deploy VictoriaMetrics

Once upgraded to v3.10.8, the VictoriaMetrics service will be automatically deployed in the kubernetes cluster deployed using ocboot. You can use the following command to check the status of the pod:

```bash
$ kubectl get pods -n onecloud | grep victoria
default-victoria-metrics-6d6fcc68d5-q68mj            1/1     Running            0          25d
```

If the pod starting with `default-victoria-metrics-` has the status of Running, then the VictoriaMetrics service has been deployed successfully.

## Switching

Both Influxdb and VictoriaMetrics services now exist in the cluster. You can run the following command to check the status of the pods:

```bash
$ kubectl get pods -n onecloud | egrep 'victoria|influxdb'
default-influxdb-5dcfc8964d-5csrw                    1/1     Running            0          23d
default-victoria-metrics-6d6fcc68d5-q68mj            1/1     Running            0          25d
```

Now follow these steps to make VictoriaMetrics the default TSDB for the platform.

### Disable operator management of the influxdb service

First, disable the operator's management of the influxdb service as follows:

```bash
$ kubectl patch onecloudcluster -n onecloud default --type='json' -p='[{op: replace, path: /spec/influxdb/disable, value: true}]'
```

### Delete the registration address of influxdb in the platform

Then delete the influxdb endpoint in the platform as follows:

```bash
$ climc endpoint-list --service influxdb | awk '{print $2}' | xargs -I {} sh -c 'climc endpoint-update --disable {} && climc endpoint-delete {}'
```

Delete the influxdb service in the platform as follows:

```bash
$ climc service-update --disabled influxdb && climc service-delete influxdb
```

### Restart platform services

When there is only the `victoria-metrics` endpoint in the platform, the platform will automatically use the VictoriaMetrics corresponding to the endpoint as the TSDB backend. You can use the following command to check the endpoint registered in the platform for VictoriaMetrics:

```bash
$ climc endpoint-list --search victoria-metrics --details
```

:::warning
Make sure there are no endpoints with an influxdb type address here. Otherwise, the platform will default to using influxdb as the TSDB backend. You can run the following command to check if there are any endpoints with an influxdb type address.

```bash
$ climc endpoint-list --search influxdb --details
```
:::

Use the following command to restart the platform service that connects to the TSDB:

```bash
kubectl get deployment -n onecloud | egrep 'region|monitor|meter|cloudmon|suggestion' | awk '{print $1}' | xargs kubectl rollout restart deployment -n onecloud
```

Restart the `host` service (if it is a multi-cloud deployment, skip this step):

```bash
$ kubectl -n onecloud rollout restart daemonset default-host
```

Finally, you can check whether the `monitor` service is using VictoriaMetrics as its backend TSDB with the command below:

```bash
$ kubectl logs -n onecloud $(kubectl get pods -n onecloud | grep monitor | awk '{print $1}') | grep 'TSDB data source'
```

If the following log appears, it indicates that the `monitor` service has successfully used VictoriaMetrics as its backend TSDB.

```
[info 2023-12-04 07:01:53 datasource.(*dataSourceManager).setDataSource(datasource.go:116)] set TSDB data source "victoria-metrics": "https://default-victoria-metrics:30428"
```

## Migrating Influxdb monitoring data (optional)

:::tip
If the monitoring data in Influxdb is not important, you can skip this step. The following operation is to migrate historical monitoring data in Influxdb to the environment where VictoriaMetrics is located.

In addition, the migration of data must ensure that both Influxdb and VictoriaMetrics services are running at the same time.
:::

### Download vmctl migration tool

The main purpose is to download the `vmctl` tool, which is used to import historical data from Influxdb to VictoriaMetrics. Please download the corresponding version according to your own environment from the following download address:

- x86_64: [https://github.com/zexi/VictoriaMetrics/releases/download/v1.94.0-vmctl-https-import/vmctl-linux-amd64](https://github.com/zexi/VictoriaMetrics/releases/download/v1.94.0-vmctl-https-import/vmctl-linux-amd64)
- arm64: [https://github.com/zexi/VictoriaMetrics/releases/download/v1.94.0-vmctl-https-import/vmctl-linux-arm64](https://github.com/zexi/VictoriaMetrics/releases/download/v1.94.0-vmctl-https-import/vmctl-linux-arm64)

Here, we take x86_64 environment as an example:

:::tip
All the following commands should be executed on the control node of the platform.
:::

```bash
# Download vmctl-linux-amd64 tool
$ wget https://github.com/zexi/VictoriaMetrics/releases/download/v1.94.0-vmctl-https-import/vmctl-linux-amd64

# Add executable permission
$ chmod a+x ./vmctl-linux-amd64

# Place it under the /opt/yunion/bin directory
$ mv ./vmctl-linux-amd64 /opt/yunion/bin
```

### Migrate data

Write the migration script below. Assuming the IP of the control node is `192.168.222.171`, the addresses of Influxdb and VictoriaMetrics services in the environment are:

- Influxdb: https://192.168.222.171:30086
- VictoriaMetrics: https://192.168.222.171:30428

Save the following shell script to the `./vm-mig.sh` file.

```bash
#!/bin/bash

# Specify the service address of Influxdb and VictoriaMetrics
IP=192.168.222.171
VM_URL="https://$IP:30428"
INFLUX_URL="https://$IP:30086"

# Specify the start and end time periods for migrating Influxdb data
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

Finally, run the migration script, the length of time taken for migration depends on the amount of data in Influxdb.

```bash
$ bash -x ./vm-mig.sh
```

## Delete the Influxdb Service

After using VictoriaMetrics as TSDB, the Influxdb service can be deleted, as follows:

```bash
$ kubectl delete deployment -n onecloud default-influxdb
```

## Access VictoriaMetrics Frontend

By default, you can access the VictoriaMetrics frontend web interface through `https://control node IP:30428/vmui/`, and check whether the data has been reported.

For specific usage, please refer to the documentation: [Query VictoriaMetrics Data](../../development/monitor/query.md#query-victoriametrics-data).