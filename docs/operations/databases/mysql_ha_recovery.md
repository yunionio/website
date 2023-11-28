---
sidebar_position: 2
---

# MariaDB 双主同步恢复

介绍MariaDB双主高可用主从同步失效的恢复流程。

高可用部署场景中，MariaDB采用双主自动同步的高可用模式，通过keepalived在双主节点上切换VIP，实现MariaDB双主集群对外的高可用服务。和传统的MariaDB主从同步相比，可以实现服务在两个节点的自动无缝切换。

本文介绍在MariaDB双主数据同步出现异常，恢复双主数据同步的步骤方法。

MariaDB双主实际可以理解为两个MariaDB实例互为主备，是基于传统的MariaDB主从同步基础上发展而来。因此实现两个MariaDB实例的双主同步，实际可以分解为两个步骤：

1）实现节点1为主，节点2为备的主从同步
2）实现节点2为主，节点1为备的主从同步

## 查看同步状态

分别以两个MariaDB实例的真实IP登录MariaDB，执行

```
SHOW SLAVE STATUS\G
```

查看两个从实例的状态，如果出现报错，则说明同步异常，需要修复。

## 修复双主同步的步骤

### 停止集群服务

为保险起见，首先要停止集群服务，避免再向数据库中写入数据。暂停集群服务的步骤请参见: [暂停集群服务](../k8s/halt_cluster) 。

下面需要确定哪个节点是当前的主节点，*MariaDB的VIP所在节点就是主节点*。

### 停止当前从节点的keepalived

停止当前从节点的keepalived，以防止MariaDB VIP的自动主从切换。

在从节点执行

```bash
systemctl stop keepalived
```

### 主节点操作

首先需要停止数据库的主从同步。

首先登入当前主节点的MariaDB，执行如下命令停止主节点和从节点的主从同步。

```
STOP SLAVE;
RESET SLAVE;
```

然后重置主节点的MASTER Status，并锁表

```
RESET MASTER;
FLUSH TABLES WITH READ LOCK;
SHOW MASTER STATUS;
```

输出如下：

```
MariaDB [(none)]> SHOW MASTER STATUS;
+------------------+-----------+--------------+------------------+
| File             | Position  | Binlog_Do_DB | Binlog_Ignore_DB |
+------------------+-----------+--------------+------------------+
| mysql-bin.000001 |       98  |              |                  |
+------------------+-----------+--------------+------------------+
1 row in set (0.00 sec)
```

记录下MASTER的bin-log文件名称和位置。

然后退出MariaDB，执行mysqldump将主节点的数据导出：

```
mysqldump -u root -p --all-databases > /a/path/mysqldump.sql
```

再登入主节点MariaDB，解锁READ LOCK。

```
UNLOCK TABLES;
```

### 从节点操作

再登入当前从节点的MariaDB，执行如下命名停止从节点的主从同步。

```
STOP SLAVE;
```

退出MariaDB，将主节点dump的数据导入从节点数据库： 

```
mysql -uroot -p < mysqldump.sql
```

然后再登入MariaDB，恢复从节点的主从同步。

```
RESET SLAVE;
CHANGE MASTER TO MASTER_LOG_FILE='mysql-bin.000001', MASTER_LOG_POS=98;
START SLAVE;
```

此时检查从节点的SLAVE同步状态：

```
SHOW SLAVE STATUS\G
```

确保结果包含如下状态，则说明从节点的主从同步正常。

```
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
```

### 恢复主节点的SLAVE状态

在从节点MariaDB执行（注意这里不需要再锁表）。

```
RESET MASTER;
SHOW MASTER STATUS;
```

输出如下：

```
MariaDB [(none)]> SHOW MASTER STATUS;
+------------------+-----------+--------------+------------------+
| File             | Position  | Binlog_Do_DB | Binlog_Ignore_DB |
+------------------+-----------+--------------+------------------+
| mysql-bin.000001 |       740 |              |                  |
+------------------+-----------+--------------+------------------+
1 row in set (0.00 sec)
```

记录从节点的MASTER日志文件和位置。

在主节点MariaDB执行如下命令恢复对从节点的主从同步

```
CHANGE MASTER TO MASTER_LOG_FILE='mysql-bin.000001', MASTER_LOG_POS=740;
START SLAVE;
```

此时检查主节点的SLAVE同步状态：

```
SHOW SLAVE STATUS\G
```

确保结果包含如下状态，则说明主节点的主从同步正常。

```
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
```

### 恢复从节点keepalived

在从节点执行如下命令恢复从节点的keepalived

```
systemctl start keepalived
```

### 恢复服务

在控制节点，参考: [恢复集群服务](../k8s/halt_cluster) 恢复onecloud-operator容器运行，恢复所有服务组件。

至此，配置完成。

