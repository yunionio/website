---
sidebar_position: 2
---

# 清理日志

介绍如何清理服务日志、数据库日志。

## 清理服务日志

```bash
# 查看具体服务的分表日志
$ climc logs-show --service <service_type> splitable
```

![](/img/docs/operations/log/logtable2.png)

```bash
# 删除超过6个月的分表
$ climc logs-purge-splitable --service <service_type>
```
![](/img/docs/operations/log/deletelogtable2.png)

## 清理数据库日志

在部署数据库（mariadb）的服务器上执行：

```bash
# 设置自动清除binlog的保留时间
$ vi /etc/my.cnf
expire_logs_days = 30
```
然后重启数据库服务，让配置生效。

```bash
systemctl restart mariadb
```

![](/img/docs/operations/log/binlog.png)
