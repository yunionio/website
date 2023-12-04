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
kubectl get pods -n onecloud | egrep 'victoria|influxdb'
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
climc endpoint-list --service influxdb | awk '{print $2}' | xargs -I {} sh -c 'climc endpoint-update --disable {} && climc endpoint-delete {}'
```

删除平台的 influxdb service，操作如下：

```bash
climc service-update --disabled influxdb && climc service-delete influxdb
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
climc endpoint-list --search influxdb --details
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
