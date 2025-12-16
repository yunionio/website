---
sidebar_position: 2
---

# System Automatic Backup

Introduction to how to automatically backup databases, k8s oc/deployment, and ETCD content.

## Automatic Backup of Cloud Management System Database, K8s Configuration, and etcd Snapshot

This command adds automatic backup functionality for the cloud management system database, K8s configuration, and etcd snapshot to the specified system.

```bash
usage: ocboot.py auto-backup [-h] [--user SSH_USER]
                             [--key-file SSH_PRIVATE_FILE] [--port SSH_PORT]
                             [--backup-path BACKUP_PATH] [--light]
                             [--max-backups MAX_BACKUPS]
                             [--max-disk-percentage MAX_DISK_PERCENTAGE]
                             TARGET_NODE_HOSTS [TARGET_NODE_HOSTS ...]

positional arguments:
  TARGET_NODE_HOSTS     target nodes

optional arguments:
  -h, --help            show this help message and exit
  --user SSH_USER, -u SSH_USER
                        target host ssh user (default: root)
  --key-file SSH_PRIVATE_FILE, -k SSH_PRIVATE_FILE
                        target host ssh private key file (default:
                        /root/.ssh/id_rsa)
  --port SSH_PORT, -p SSH_PORT
                        target host host ssh port (default: 22)
  --backup-path BACKUP_PATH
                        backup path, default: /opt/yunion/backup
  --light               ignore yunionmeter and yunionlogger database; ignore
                        tables start with 'opslog' and 'task'.
  --max-backups MAX_BACKUPS
                        how many backups to keep. default: 10
  --max-disk-percentage MAX_DISK_PERCENTAGE
                        the max usage percentage of the disk on which the
                        backup will be done allowed to perform backup. the
                        backup job will not work when the disk's usage is
                        above the threshold. default: 75(%).
```

The following introduces the role and notes of each parameter

- `TARGET_NODE_HOSTS`, fill in the IP of the **control node** that needs automatic backup deployment here. If there are multiple control nodes, just enter one of them.
- `--user`, `--key-file`, `--port` these parameters are ssh configuration for logging into the backup machine. Generally default username `root`, port number `22`. If customized, you can configure it in `$HOME/.ssh/config`. Please ensure the current machine can passwordless login to the entered `TARGET_NODE_HOSTS`.
- `--backup-path`, backup path. Default is `/opt/yunion/backup`.
- `--max-disk-percentage` maximum allowed disk usage. Default is `75%`. The backup process will detect the disk usage where the entered `--backup-path` is located. If it has reached the maximum allowed disk usage, it will stop backup to prevent backup files from filling the disk.
- `--light` whether it's a lightweight backup. Default is `no`, i.e., full backup. The difference between lightweight backup and full backup is some (usually freely deletable) business logs. It's recommended to only choose lightweight backup for daily use to save disk and speed up the backup process.
- `--max-backups` number of backups to keep. Default keeps the latest 10 backups.

## Manually Restore Backed Up Database and k8s Configuration

SSH login to control node, enter backup directory, using 2023-05-28 backup as an example, restore commands as follows

```bash
[root@controller ~]# cd /opt/yunion/backup/
[root@controller backup]# tar -xzvf onecloud.bkup.20230528-000001.tar.gz
[root@controller backup]# cd 20230528-000001/
[root@controller 20230528-000001]# ll
total 181548
-rw------- 1 root root 185819168 May 28 00:00 etcd_snapshot_20230528-000001.db
-rw-r--r-- 1 root root     74493 May 28 00:00 oc.20230528-000001.yml
-rw-r--r-- 1 root root      3241 May 28 00:00 onecloud-operator.20230528-000001.yml

# Restore database
[root@controller 20230528-000001]# pv onecloud.sql.20230528-000001.gz | gunzip | mysql -uroot -p$MYSQL_PASSWD -h $MYSQL_HOST

# Restore k8s component services
[root@controller 20230528-000001]# kubectl apply -f oc.20230528-000001.yml
[root@controller 20230528-000001]# kubectl apply -f onecloud-operator.20230528-000001.yml
```

