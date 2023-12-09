---
sidebar_position: 1
---

# MariaDB Recommended Configurations

The configurations are recommended as follows:

1. Skip the domain name resolvation of the client

```
skip-name-resolve
```

2. Set the time of automatic cleaning binlog (in terms of number of days)

```
expire_logs_days=30
```


3. Turn on independent INNODB file for each table

```
innodb_file_per_table=ON
```

4. Maximal allowd connections

```
max_connections=300
```

The default is 151，we may set it higher, e.g. 300 

Note: Besides to increase the maximum number of connections of MySQL, you may also need to increase the maximum number of open files of the operating system:

```
# /usr/lib/systemd/system/mariadb.service
[Service]
LimitNOFILE=10000
LimitMEMLOCK=10000
```


5. Set the maximal allowed package size of each query

```
max_allowed_packet=20M
```

The default is 1M，set it to 20M.


6. Set the default timezone of datetime field to be UTC

```
default_time_zone='+00:00'
```

7. Turn on slow log and the automatic logrotate

```
slow_query_log = ON
long_query_time = 30
slow_query_log_file = /var/log/mariadb/slow.log
```

8. Turn on error log
```
log_error=/var/log/mariadb/mariadb.err.log
```

9. Turn off general log
```
general_log=OFF
general_log_file=/var/log/mariadb/mariadb.log
```

An example of the configuration file as follows:
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
