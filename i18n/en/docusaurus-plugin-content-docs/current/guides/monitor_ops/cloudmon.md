---
sidebar_position: 2
---

# Monitoring Pull Service

The platform has a monitoring pull service called cloudmon, which can be considered a cronjob periodic task. It collects monitoring data from various cloud platforms through API calls and stores it in the platform's backend time-series database for the monitor service to query and alert.

## Collection Types

Collection is generally divided into two types: **Get monitoring by resource ID** and **Get by monitoring item** type

### Resource ID Type

For this type of monitoring data collection, each API call requires passing in the resource ID, and may even require passing in monitoring items, thus consuming a large number of API calls.
Assuming there are 100 resources to get 4 types of monitoring data, it requires calling 100 or even 400 APIs

### Monitoring Item Type

For this type of monitoring data collection, each API call only needs to pass in the monitoring item to return monitoring data for multiple resources, thus
Assuming there are 100 resources to get 4 types of monitoring data, it only requires calling 4 APIs at minimum. If pagination occurs, it only requires a few more calls

:::tip
Tencent Cloud is a combination of these two types. It requires passing in monitoring items, but limits each query to a maximum of 10 instances' monitoring data, thus
Assuming there are 100 resources to get 4 types of monitoring data, it requires calling 40 APIs

Increasing the collection period can reduce the number of API calls for resource ID type
:::

## Collection Period

cloudmon collects monitoring every 6 minutes by default (within one period, it calls different cloud platforms' APIs multiple times based on the number of resources)
You can change the collection period through the following command

```shell
# Changing the collection period will affect the timeliness of viewing monitoring
$ climc service-config --config collect_metric_interval=12 cloudmon
```

## Ignore Monitoring Pull for Certain Cloud Platforms

cloudmon supports ignoring monitoring pull for certain cloud platforms, but does not support ignoring monitoring pull for a specific cloud account

```shell
# Cloud platform types are separated by commas
$ climc service-config --config 'skip_metric_pull_providers=Aliyun,Azure' cloudmon
```

## Concurrency Control

By default, it pulls cloud monitoring data for 10 accounts simultaneously. If there are too many cloud accounts, you can appropriately increase the concurrency

```shell
$ climc service-config --config cloud_account_collect_metrics_batch_count=15 cloudmon
```

By default, each account pulls monitoring for 40 resources at once. You can control resource concurrency through the following command

```shell
# This command only takes effect for monitoring collection by resource ID
$ climc service-config --config cloud_resource_collect_metrics_batch_count=20 cloudmon
```


## Common Cloud Platform Monitoring APIs

### Alibaba Cloud (Monitoring Item Type)

[DescribeMetricList](https://next.api.aliyun.com/api/Cms/2019-01-01/DescribeMetricList?lang=GO)

### Feitian (Monitoring Item Type)

DescribeMetricList
GetOrganizationTree

### AWS (Resource ID Type)

[GetMetricStatistics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_GetMetricStatistics.html)

### Azure (Resource ID Type)

[Metric List](https://learn.microsoft.com/en-us/rest/api/monitor/metrics/list?tabs=HTTP)
[Metric Definitions](https://learn.microsoft.com/en-us/rest/api/monitor/metric-definitions/list?tabs=HTTP)
[Workspaces - Get](https://learn.microsoft.com/en-us/rest/api/loganalytics/workspaces/get?tabs=HTTP)
[Workspaces Query](https://learn.microsoft.com/en-us/rest/api/loganalytics/dataaccess/query/get?tabs=HTTP)

:::tip
Except for the Metric List interface, the other three interfaces are used to obtain VM memory and disk usage, but will incur additional costs, so they are not collected by default
You can enable them through the following command

```shell
$ climc service-config --config 'support_azure_table_storage_metric=true' cloudmon
```
:::

### BingoCloud (Resource ID Type)

GetMetricStatistics

### Esxi (Monitoring Item Type)

[PerfQuerySpec](https://vdc-repo.vmware.com/vmwb-repository/dcr-public/da47f910-60ac-438b-8b9b-6122f4d14524/16b7274a-bf8b-4b4c-a05e-746f2aa93c8c/doc/vim.PerformanceManager.QuerySpec.html)

:::tip

Disk usage for esxi only has data every half hour, and usage may exceed 100% (the esxi console can see that used disk size exceeds allocated size)

:::

### Google (Monitoring Item Type)

[Metrics](https://cloud.google.com/monitoring/api/metrics_gcp)

### Huawei Cloud (Resource ID Type)

[batch-query-metric-data](https://support.huaweicloud.com/intl/en-us/api-ces/ces_03_0034.html)

### Tencent Cloud

[DescribeStatisticData](https://cloud.tencent.com/document/api/248/51845)
[GetMonitorData](https://cloud.tencent.com/document/product/248/31014) 
