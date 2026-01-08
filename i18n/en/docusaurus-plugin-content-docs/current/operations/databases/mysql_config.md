---
sidebar_position: 1
---

# MariaDB Recommended Configuration

Configuration recommendations are as follows:

1. Disable reverse DNS lookup for clients

```
skip-name-resolve
```

2. Automatic binlog cleanup time (days)

```
expire_logs_days=30
```


3. Set one independent innodb file per table

```
innodb_file_per_table=ON
```

4. Maximum connections

```
max_connections=300
```

Default is 151, can be increased, for example to 300

Note: Increasing MySQL maximum connections also requires increasing the operating system's maximum open files. Need to modify /usr/lib/systemd/system/mariadb.service as follows:

```
# /usr/lib/systemd/system/mariadb.service
[Service]
LimitNOFILE=10000
LimitMEMLOCK=10000
```


5. Maximum bytes returned by query

```
max_allowed_packet=20M
```

Default is 1M, increase to 20M


6. Set default timezone for date fields to UTC

```
default_time_zone='+00:00'
```

7. Enable slow log and logrotate for this log

```
slow_query_log = ON
long_query_time = 30
slow_query_log_file = /var/log/mariadb/slow.log
```

8. Enable error log
```
log_error=/var/log/mariadb/mariadb.err.log
```

9. Disable general log
```
general_log=OFF
general_log_file=/var/log/mariadb/mariadb.log
```

Modify configuration file
```
# /etc/my.cnf
[mysqld]
skip-name-resolve
expire_logs_days=30
innodb_file_per_table=ON
max_connections=300
max_allowed_packet=20M
default_time_zone='+00:00'
slow_query_log = ON
long_query_time = 30
slow_query_log_file = /var/log/mariadb/slow.log
log_error = /var/log/mariadb/mariadb.err.log
general_log=OFF
general_log_file=/var/log/mariadb/mariadb.log
```

