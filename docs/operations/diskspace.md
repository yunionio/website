---
edition: ce
sidebar_position: 21
---

# 服务器磁盘空间清理

云平台运行过程中会生成日志，产生临时文件。在用户使用云平台过程中，会上传镜像，会在虚拟机内读写文件导致虚拟磁盘大小逐步增长。随着云平台的长期运行，这些因素会导致服务器磁盘空间不足。本文介绍常见的磁盘空间不足的原因以及处理办法。

## 定位磁盘空间占用原因

解决服务器磁盘空间不足的根本是定位磁盘空间占用的原因。为此需要定位占用空间大的主要目录。一般是通过 du 命令从根目录开始逐级执行，定位主要占用磁盘空间的目录。通过分析目录的归属，进一步定位磁盘占用的主要原因。

``
du -sh *
``

## 计算节点

本节罗列出常见的计算节点可能占用磁盘空间的情况。下文中配置参数主要是host服务的配置参数，有限通过kubectl -n onecloud edit configmaps default-host查看，如果不存在，则在该服务器的 /etc/yunion/host.conf 查看。

### 本地磁盘回收站

计算节点默认开启本地磁盘回收站，删除的磁盘文件会先挪到磁盘回收站，待删除的磁盘文件占用存储空间。可以直接用rm -fr该目录下的文件来腾出磁盘空间。

位置： `$local_image_path`/recycle_bin

本地磁盘回收站会自动清理，也可以通过配置关闭。以下是磁盘回收站的开关配置以及自动清理配置。

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| recycle_diskfile           | true | 是否开启磁盘回收站 |
| always_recycle_diskfile    | true | 是否所有可能删除磁盘文件的情况都保留磁盘到回收站目录。如果为false，则不保留非显示删除的磁盘文件，如迁移成功后的源宿主机上的磁盘文件，更换系统盘后的原系统盘文件 |
| recycle_diskfile_keep_days | 28   | 被删除本地磁盘文件挪到回收站后的保留时间，以天为单位，默认28天 |

### 本地磁盘快照

计算阶段的本地磁盘快照也存储在对应的本地磁盘目录下，也会占用存储空间。需要注意的是，删除本地磁盘快照并不会立即回收快照占用的空间，而是由该节点的host异步回收。host服务会周期性检查本地快照，如果发现一个快照被删除，则会将该快照内容向下合并到快照链的顶部文件，然后才会删除该快照文件。该目录下文件不建议手动清理。

位置：`$local_image_path`/snapshots

### 本地磁盘备份的临时目录

做磁盘备份时，会将备份过程的临时寄文件保存在如下位置。在确认无正在进行的磁盘备份操作时，可以清理该目录下的文件腾出空间。

位置：`$local_backup_temp_path`

### 保存镜像临时目录

将虚拟机磁盘保存为镜像是，会将保存镜像临时拷贝到如下位置。在确认无正在进行的保存镜像操作时，可以清理该目录下的文件腾出空间。

位置：`$local_image_path`/imgsave_backups

### fuse缓存目录

在3.11.10之前，通过快照创建磁盘或者克隆主机时，会通过fuse挂在远程宿主机上的本地磁盘，将读取数据缓存在fuse缓存目录。在确认无正在进行的克隆磁盘操作时，可以清理该目录下的文件腾出空间。在3.11.11及以后版本，该目录不再使用。

位置：`$local_image_path`/fusetmp

### qemu日志

qemu本身日志会存储在宿主机磁盘上，每台虚拟机一个文件，以虚拟机的UUID作为文件名。如果该目录占用空间过大，可以清理该目录下的文件腾出空间。

位置：`$servers_path`/logs

### 镜像缓存

虚拟机本地磁盘镜像的缓存存储目录。该目录下文件需要在确保无虚拟机使用时才可以清理，不建议手动清理。

位置：`$image_cache_path`

该目录在3.11.10之后支持自动清理。由以下参数控制。同时，清理过程会自动跳过被虚拟机引用的缓存镜像。

| 配置 | 默认值 | 说明 |
| --- | --- | --- |
| image_cache_cleanup_percentage | 12 | 当缓存镜像的占用空间超过存储容量的设定百分比后才出发缓存镜像的自动清理 |
| image_cache_expire_days        | 30 | 清理过程中，只删除超过该变量设定天数的缓存镜像 |

### 本地磁盘文件

本地磁盘文件会占用磁盘空间。但不建议手动删除本地磁盘来腾出空间，应该通过云平台删除虚拟机或虚拟磁盘来删除磁盘本地虚拟磁盘文件。

位置：`$local_image_path`

### 容器镜像缓存

运行在节点上的服务容器的镜像会占用磁盘空间，随着服务镜像的不断更新，不再使用的容器镜像会不断堆积而占用磁盘空间。可以用如下命令手动清除不再被使用的容器镜像。

```bash
# 如果是k8s
docker image prune -a
# 如果是k3s
k3s ctr image prune --all
```

### 容器本地PVC卷目录

容器本地PVC挂载在 /opt/local-path-provisioner/ 目录下。在确认对应PVC不再使用的情况下，可以清理该目录下的文件腾出空间。

如果是k8s，位置是 /opt/local-path-provisioner/。如果是k3s，位置是 /opt/k3s/storage/


## 控制节点

本节分析控制节点磁盘空间占用的主要原因。

### glance镜像

glance的镜像存储在本地磁盘，随着存储镜像增多，可能存在空间占用过多的情况。

位置：`$filesystem_store_datadir`

该配置为glance服务配置，通过如下命令查看：

```bash
climc service-config-show glance
```

清理glance镜像占用空间的方法如下：

#### 关闭自动镜像格式转换

如果开启了自动镜像格式转换，则一个镜像上传后，会自动转换为多种格式的镜像，导致镜像存储空间翻倍。在3.11.10以前版本，会自动打开vmdk镜像格式的转换，如果平台没有使用vmware或其他私有云，则无需开启镜像转换，可以关闭自动转换来节省空间。

通过如下方法关闭自动镜像转换：

```bash
climc service-config-edit glance
```

将target_image_formats的格式只保留qcow2。保存配置后，重启glance服务。

#### 删除不使用的镜像

将不使用的镜像删除，同时注意清空回收站。

### mysql数据库

云平台运行过程中会在mysql存储了大量日志，可能占用磁盘空间。首先需要确定mysql的存储路径，在 /etc/my.cnf 中查找配置 datadir。

如果确认是mysql占用空间较大，需要定位占用空间大的表。可以管理员权限登录mysql，执行如下SQL查找占用空间大的TOP10表。进而，根据具体情况确定清理数据的方案。

```sql
SELECT table_schema AS "Database", table_name AS "Table",
ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)"
FROM information_schema.TABLES
ORDER BY (data_length + index_length) DESC
LIMIT 10;
```

### clickhouse数据库

企业版的meter服务以及所有服务的日志会存储在clickhouse。类似mysql，也存在clickhouse存储数据过多占用磁盘空间的问题。首先需要确定clickhouse的存储路径，方法是在 /etc/clickhouse-server/config.xml 中查找如下两个配置：

```xml
    <path>/opt/clickhouse/</path>
    <tmp_path>/opt/clickhouse/tmp/</tmp_path>
```

如果确认是clickhouse占用空间较大，需要定位占用空间大的表。可以管理员权限登录clickhouse，执行如下SQL查找占用空间大的TOP10表。进而，根据具体情况确定清理数据的方案。

```sql
SELECT
    database,
    table,
    formatReadableSize(sum(bytes_on_disk)) AS size_on_disk
FROM system.parts
WHERE active
GROUP BY database, table
ORDER BY sum(bytes_on_disk) DESC
LIMIT 10;
```

如果是 system 库下的 *_log 的表占用空间过大，可以通过如下方式设置该表的自动清理机制。假设是 system.asynchronous_metric_log 占用空间较大，则修改

```
/etc/clickhouse-server/config.xml
```

在config.xml中，查找 asynchronous_metric_log 的配置，添加 TTL 规则如下：

```xml
    <asynchronous_metric_log>
        <ttl>event_date + INTERVAL 14 DAY DELETE</ttl>
        ...
    </asynchronous_metric_log>
```

修改 config.xml 后，重启 clickhouse-server 服务：

```bash
systemctl restart clickhouse-server
```

### 监控数据

监控数据存储在PVC中。要确认是否因为监控数据导致磁盘空间不足。首先需要定位监控服务对应的PVC的存储目录。

在3.11之前，默认监控服务为influxdb。在3.11及以后，默认监控服务为VictoriaMetrics。如果集群是从3.11之前版本升级上来，则默认还是influxdb。

下面以victoria-metrics为例说明确认PVC存储目录的过程。

首先，确定监控服务的运行服务器。

```bash
kubectl -n onecloud get pods -o wide -l app=victoria-metrics
```

其次，获得对应服务的PVC的名称

```bash
kubectl -n onecloud get pvc | grep default-victoria-metrics
```

则对应的VPC目录为监控服务容器所在服务器的 /opt/local-path-provisioner/ (如果是k8s) 或者 /opt/k3s/storage/ (如果是k3s) 下以PVC名称作为前缀的目录。

如果确认是监控数据过多导致磁盘空间紧张，可以设置监控数据的保留时间来减少空间。方法如下：

如果是influx，则设置region服务的配置项 metrics_retention_days，该项默认为 30。设置后保存后，需要重启region服务生效。

```
climc service-config-edit region2
kubectl -n onecloud rollout restart deployment default-region
```

如果监控服务是victoria-metrics，修改oc里的配置项 rententionPeriodDays 。该项的默认时间是93。设置保存后，operator会自动重启victoria-metrics生效。

```bash
kubectl -n onecloud edit oc
```
