---
sidebar_position: 1
---

# 监控介绍

## 监控服务架构

主要由以下几个组件构成：

- 监控Agent（telegraf）: 部署在宿主机或者虚拟机内部的监控数据采集agent，目前使用开源的telegraf。

- cloudmon: 主动从各个平台拉取监控数据，采集一些使用量指标，以及进行ping监控。

- influxdb 或者 VictoriaMetrics: 监控时序数据存储后端。

- monitor： 提供监控服务API，屏蔽后端监控的差异。同时提供查询监控指标和报警的功能。


## 监控数据采集

监控数据通过几个途径采集获得：

- 私有云宿主机: 通过在宿主机的telegraf采集监控数据。

- 私有云虚拟机: 通过在虚拟机里面部署 telegraf 监控 agent 上报数据。

- 云平台虚拟机: 通过cloudmon服务，周期性地调用各个平台的API，采集监控数据。

