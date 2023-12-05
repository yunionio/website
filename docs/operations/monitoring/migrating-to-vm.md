---
sidebar_position: 2
---

# 切换 Influxdb 到 VictoriaMetrics

VictoriaMetrics 相比较 Influxdb 有更少的资源占用和更快的查询速度。 从 v3.10.8 版本开始，监控后端 TSDB(时序数据库) 可以从 Influxdb 切换到 VictoriaMetrics。

:::tip
我们将在 3.11 版本默认使用 VictoriaMetrics 作为 TSDB。
所以下面的操作只对 3.11 之前的版本生效。
:::

## 部署 VictoriaMetrics

只要升级到 v3.10.8，使用 ocboot 部署的 kubernetes 集群里面就会自动部署好 VictoriaMetrics 服务，可以使用下面的命令查看 pod 运行情况：

```bash
$ kubectl get pods -n onecloud | grep victoria
default-victoria-metrics-6d6fcc68d5-q68mj            1/1     Running            0          25d
```

如果 `default-victoria-metrics-` 开头的 pod 状态为 Running，则表示 VictoriaMetrics 服务部署完成。

## 切换

现在集群里面同时存在 Influxdb 和 VictoriaMetrics 服务，用下面的命令可以查看 pod 运行情况：

```bash
$ kubectl get pods -n onecloud | egrep 'victoria|influxdb'
default-influxdb-5dcfc8964d-5csrw                    1/1     Running            0          23d
default-victoria-metrics-6d6fcc68d5-q68mj            1/1     Running            0          25d
```

现在通过下面的步骤让平台使用 VictoriaMetrics 作为默认 TSDB。

### 禁用 operator 管理 influxdb 服务

首先禁用 operator 服务对 influxdb 的管理，操作如下：

```bash
$ kubectl patch onecloudcluster -n onecloud default --type='json' -p='[{op: replace, path: /spec/influxdb/disable, value: true}]'
```

### 删除 influxdb 在平台的注册地址

然后删除平台里面的 influxdb endpoint，操作如下：

```bash
$ climc endpoint-list --service influxdb | awk '{print $2}' | xargs -I {} sh -c 'climc endpoint-update --disable {} && climc endpoint-delete {}'
```

删除平台的 influxdb service，操作如下：

```bash
$ climc service-update --disabled influxdb && climc service-delete influxdb
```

### 重启平台服务

当平台里面只有 `victoria-metrics` 的 endpoint 的时候，就会自动使用 endpoint 对应的 VictoriaMetrics 作为 TSDB 后端，可以通过下面的命令查看 VictoriaMetrics 在平台注册的 endpoint：

```bash
$ climc endpoint-list --search victoria-metrics --details
```

:::warning
这里一定要确保 endpoint 没有 infludb 类型的地址，否则平台会默认优先使用 influxdb 作为后端 TSDB。
可以用下面的命令查看有没有 influxdb 类型的 endpoint。

```bash
$ climc endpoint-list --search influxdb --details
```
:::

通过下面的命令重启会连接 TSDB 的平台服务：

```bash
$ kubectl get deployment -n onecloud | egrep 'region|monitor|meter|cloudmon|suggestion' | awk '{print $1}' | xargs kubectl rollout restart deployment -n onecloud
```

重启 host 服务，(如果是多云管理版本，不用执行此步骤) ：

```bash
$ kubectl -n onecloud rollout restart daemonset default-host
```

最后可以通过下面的命令查看 monitor 服务是否使用 VictoriaMetrics 作为后端 TSDB：

```bash
$ kubectl logs -n onecloud $(kubectl get pods -n onecloud | grep monitor | awk '{print $1}') | grep 'TSDB data source'
```

如果出现下面的日志，则说明 monitor 服务已经成功使用 VictoriaMetrics 作为后端 TSDB。

```
[info 2023-12-04 07:01:53 datasource.(*dataSourceManager).setDataSource(datasource.go:116)] set TSDB data source "victoria-metrics": "https://default-victoria-metrics:30428"
```

## 迁移 Influxdb 监控数据（可选）

:::tip
如果之前在 Influxdb 里面的监控数据不重要，可以不做数据的迁移。下面的操作适用于想要把 Influxdb 历史监控数据迁移到 VictoriaMetrics 的环境。

另外迁移数据必须保证 Influxdb 和 VictoriaMetrics 两个服务同时运行。
:::

### 下载 vmctl 迁移工具

主要是下载 vmctl 工具，用于把 Influxdb 的历史数据导入到 VictoriaMetrics，请根据自己的环境下载对应的版本，下载地址如下：

- x86_64: [https://github.com/zexi/VictoriaMetrics/releases/download/v1.94.0-vmctl-https-import/vmctl-linux-amd64](https://github.com/zexi/VictoriaMetrics/releases/download/v1.94.0-vmctl-https-import/vmctl-linux-amd64)
- arm64: [https://github.com/zexi/VictoriaMetrics/releases/download/v1.94.0-vmctl-https-import/vmctl-linux-arm64](https://github.com/zexi/VictoriaMetrics/releases/download/v1.94.0-vmctl-https-import/vmctl-linux-arm64)

下面以 x86_64 环境举例：

:::tip
以下的所有命令都是登录到平台的控制节点上执行。
:::

```bash
# 下载 vmctl-linux-amd64 工具
$ wget https://github.com/zexi/VictoriaMetrics/releases/download/v1.94.0-vmctl-https-import/vmctl-linux-amd64

# 添加可执行权限
$ chmod a+x ./vmctl-linux-amd64

# 放到 /opt/yunion/bin 目录
$ mv ./vmctl-linux-amd64 /opt/yunion/bin
```

### 迁移数据

编写下面的迁移脚本，假设控制节点的 ip 为 192.168.222.171，那么环境中 Influxdb 和 VictoriaMetrics 服务的地址就为：

- Influxdb: https://192.168.222.171:30086
- VictoriaMetrics: https://192.168.222.171:30428

将下面的 shell 脚本保存到 `./vm-mig.sh` 文件。

```bash
#!/bin/bash

# 指定 Influxdb 和 VictoriaMetrics 的服务地址
IP=192.168.222.171
VM_URL="https://$IP:30428"
INFLUX_URL="https://$IP:30086"

# 指定要迁移 Influxdb 迁移数据的起始时间段
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

最后执行迁移脚本，迁移时间的长短取决于 Influxdb 里面的数据量。

```bash
$ bash -x ./vm-mig.sh
```

## 删除 influxdb 服务

使用 VictoriaMetrics 作为 TSDB 后，就可以删除 Influxdb 服务了，操作如下：

```bash
$ kubectl delete deployment -n onecloud default-influxdb
```

## 访问 VictoriaMetrics 前端

默认情况下，可以通过 `https://控制节点IP:30428/vmui/` 访问 VictoriaMetrics 前端 web 界面，可以查看下数据是否有上报上来。
