---
sidebar_position: 2
---

# Clearing Logs

This article describes how to clear service logs and database logs.

## Clearing Service Logs

```bash
# View the log tables of a specific service
$ climc logs-show --service <service_type> splitable
```

![](/img/docs/operations/log/logtable2.png)

```bash
# Delete the splitable tables that are more than 6 months old
$ climc logs-purge-splitable --service <service_type>
```

![](/img/docs/operations/log/deletelogtable2.png)

## Clearing Database Logs

Execute the following command on the server deployed with the database (`mariadb`):

```bash
# Set the retention time for automatic binlog deletion
$ vi /etc/my.cnf
expire_logs_days = 30
```
Then restart the database service to make the configuration take effect.

```bash
systemctl restart mariadb
```

![](/img/docs/operations/log/binlog.png)
