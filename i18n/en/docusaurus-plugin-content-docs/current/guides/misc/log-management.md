---
sidebar_position: 2
---

# Service Log Management

## Service Configuration

The platform saves operation logs of various services in the database. These databases automatically support periodic cleanup functionality.

Currently supports saving operation logs in MySQL and ClickHouse. If logs are saved in MySQL, the database will be partitioned by time, and cleanup is implemented by dropping old tables. If ClickHouse is used to save logs, automatic cleanup of expired data is implemented through ClickHouse's TTL mechanism.

The operation logs saved by the system support the following configuration items:

* ops_log_max_keep_months

Time parameter for log retention, default is 6 months

* splitable_max_duration_hours

Time interval for log table partitioning, default is 720 hours

* ops_log_with_clickhouse

Whether operation logs use ClickHouse or MySQL as data storage

## Clean Database Partitioned Table Logs

Logs from various services on the platform accumulate over time and require regular cleanup.

Since a partitioned table storage mechanism is used, old tables can be dropped to delete log data and free up space.

However, it should be noted that only after MySQL enables the innodb_file_per_table=ON option, after dropping tables, the corresponding database files will be deleted, thereby freeing up table space. If MySQL does not enable the innodb_file_per_table option, all MySQL data is saved in the /var/lib/mysql/ibdata1 file. Even if tables are deleted, table space will not be immediately released.

The following command is used to view the log table status of various services:

```bash
climc logs-show --service <service_name> splitable
```

Where service can be:

* compute
* image
* identity
* log
* cloudevent
* monitor
* notify

The following command cleans expired log tables for various services (default drops log tables older than 6 months):

```bash
climc logs-purge [--tables tb1,tb2,...] --service <service_name>
```

For example:

```
climc logs-purge-splitable --tables opslog_tbl_1676464622 --service compute
```
