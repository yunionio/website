---
sidebar_position: 3
---

# MariaDB Master-Master Sync Recovery

Introduction to the recovery process for MariaDB master-master high availability master-slave sync failures.

In high availability deployment scenarios, MariaDB adopts a master-master automatic sync high availability mode, switching VIP on master nodes through keepalived to achieve high availability service for MariaDB master-master cluster externally. Compared with traditional MariaDB master-slave sync, it can achieve automatic seamless switching of services between two nodes.

This article introduces the steps and methods to recover master-master data sync when MariaDB master-master data sync is abnormal.

MariaDB master-master can actually be understood as two MariaDB instances being each other's master-standby, developed based on traditional MariaDB master-slave sync. Therefore, implementing master-master sync between two MariaDB instances can actually be decomposed into two steps:

1) Implement node 1 as master, node 2 as standby master-slave sync
2) Implement node 2 as master, node 1 as standby master-slave sync

## Check Sync Status

Log in to MariaDB with the real IPs of the two MariaDB instances respectively, execute

```
SHOW SLAVE STATUS\G
```

Check the status of the two slave instances. If errors appear, it means sync is abnormal and needs to be fixed.

## Steps to Fix Master-Master Sync

### Stop Cluster Services

For safety, first stop cluster services to avoid writing more data to the database. Steps to pause cluster services please refer to: [Pause Cluster Services](../k8s/halt_cluster) .

Next, need to determine which node is the current master node. *The node where MariaDB's VIP is located is the master node*.

### Stop keepalived on Current Slave Node

Stop keepalived on the current slave node to prevent automatic master-slave switching of MariaDB VIP.

Execute on slave node

```bash
systemctl stop keepalived
```

### Master Node Operations

First need to stop database master-slave sync.

First log in to the current master node's MariaDB, execute the following commands to stop master-slave sync on master and slave nodes.

```
STOP SLAVE;
RESET SLAVE;
```

Then reset the master node's MASTER Status and lock tables

```
RESET MASTER;
FLUSH TABLES WITH READ LOCK;
SHOW MASTER STATUS;
```

Output as follows:

```
MariaDB [(none)]> SHOW MASTER STATUS;
+------------------+-----------+--------------+------------------+
| File             | Position  | Binlog_Do_DB | Binlog_Ignore_DB |
+------------------+-----------+--------------+------------------+
| mysql-bin.000001 |       98  |              |                  |
+------------------+-----------+--------------+------------------+
1 row in set (0.00 sec)
```

Record the MASTER's bin-log file name and position.

Then exit MariaDB, execute mysqldump to export master node data:

```
mysqldump -u root -p --all-databases > /a/path/mysqldump.sql
```

Log in to master node MariaDB again, unlock READ LOCK.

```
UNLOCK TABLES;
```

### Slave Node Operations

Log in to current slave node's MariaDB, execute the following commands to stop slave node's master-slave sync, and delete all databases except information_schema, performance_schema, mysql.

```
STOP SLAVE;
drop database yunioncloud;
drop database ...;
```

Exit MariaDB, import master node dump data into slave node database: 

```
mysql -uroot -p < mysqldump.sql
```

Then log in to MariaDB again, restore slave node's master-slave sync.

```
RESET SLAVE;
CHANGE MASTER TO MASTER_LOG_FILE='mysql-bin.000001', MASTER_LOG_POS=98;
START SLAVE;
```

At this point check the slave node's SLAVE sync status:

```
SHOW SLAVE STATUS\G
```

Ensure the result contains the following status, which means slave node's master-slave sync is normal.

```
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
```

### Restore Master Node's SLAVE Status

Execute on slave node MariaDB (note: no need to lock tables again here).

```
RESET MASTER;
SHOW MASTER STATUS;
```

Output as follows:

```
MariaDB [(none)]> SHOW MASTER STATUS;
+------------------+-----------+--------------+------------------+
| File             | Position  | Binlog_Do_DB | Binlog_Ignore_DB |
+------------------+-----------+--------------+------------------+
| mysql-bin.000001 |       740 |              |                  |
+------------------+-----------+--------------+------------------+
1 row in set (0.00 sec)
```

Record the slave node's MASTER log file and position.

Execute the following commands on master node MariaDB to restore master-slave sync to slave node

```
CHANGE MASTER TO MASTER_LOG_FILE='mysql-bin.000001', MASTER_LOG_POS=740;
START SLAVE;
```

At this point check the master node's SLAVE sync status:

```
SHOW SLAVE STATUS\G
```

Ensure the result contains the following status, which means master node's master-slave sync is normal.

```
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
```

### Restore Slave Node keepalived

Execute the following commands on slave node to restore slave node's keepalived

```
systemctl start keepalived
```

### Restore Services

On control node, refer to: [Restore Cluster Services](../k8s/halt_cluster) to restore onecloud-operator container running, restore all service components.

At this point, configuration is complete.

