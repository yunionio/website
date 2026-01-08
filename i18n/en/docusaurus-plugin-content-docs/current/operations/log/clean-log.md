---
sidebar_position: 2
---

# Clean Logs

Introduction to how to clean service logs and database logs.

## Clean Service Logs

```bash
# View split table logs of specific service
$ climc logs-show --service <service_type> splitable
```

![](/img/docs/operations/log/logtable2.png)

```bash
# Delete split tables older than 6 months
$ climc logs-purge-splitable --service <service_type>
```
![](/img/docs/operations/log/deletelogtable2.png)

## Clean Database Logs

Execute on the server where the database (mariadb) is deployed:

```bash
# Set automatic binlog cleanup retention time
$ vi /etc/my.cnf
expire_logs_days = 30
```
Then restart the database service to make the configuration take effect.

```bash
systemctl restart mariadb
```

![](/img/docs/operations/log/binlog.png)

