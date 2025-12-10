---
sidebar_position: 2
---

# 服务日志管理

## 服务配置

平台会将各个服务的操作日志保存在数据库，这些数据库自动支持定期清理功能。

目前支持将操作日志保存在mysql和clickhouse。如果将日志保存在mysql，则会对数据库按照时间进行分表，清理表是已通过drop旧表实现的。如果采用clickhouse保存日志，则通过clickhouse的TTL机制实现对过期数据的自动清理。

系统保存的操作操作日志支持如下配置项：

* ops_log_max_keep_months

保留日志的时间参数，默认是6个月

* splitable_max_duration_hours

日志分表的时间间隔，默认是720小时

* ops_log_with_clickhouse

操作日志采用clickhouse还是mysql作为数据存储

## 清理数据库分表日志

平台上各个服务的日志日积月累数据量都不小，需要定期清理。

由于采用了分表保存的机制，可以将旧表drop来删除日志数据，释放空间。

但是，需要注意的是，只有在mysql开启了innodb_file_per_table=ON的选项后，drop表之后，会删除对应的数据库文件，从而释放出表空间。如果mysql未开启innodb_file_per_table选项，则mysql所有数据都保存在/var/lib/mysql/ibdata1这个文件中，即使删除了表，也不会立即释放表空间。

以下命令用来查看各个服务的日志表的情况：

```bash
climc logs-show --service <service_name> splitable
```

其中，service可以是：

* compute
* image
* identity
* log
* cloudevent
* monitor
* notify

以下命令清理各个服务的过期日志表（默认drop清理6个月之前的日志表）：

```bash
climc logs-purge [--tables tb1,tb2,...] --service <service_name>
```

例如：

```
climc logs-purge-splitable --tables opslog_tbl_1676464622 --service compute
```
