---
sidebar_position: 1
---

# Create Backup Storage

Starting from 3.11, backup storage supports the following network storage as backup storage:

* NFS
* Object Storage

## Prerequisites

Require all hosts to be able to access backup storage through network,
* For NFS, backup storage can be mounted on any host node
* For object storage, object storage buckets can be accessed on any host node

## Creation Method

You can create through the frontend WebUI, or create through the following climc command.

```bash
# Add backup storage, currently --capacity-mb field is meaningless, can be filled arbitrarily
$ climc backupstorage-create [--storage-type {nfs,object}] [--nfs-host NFS_HOST] [--nfs-shared-dir NFS_SHARED_DIR] [--object-bucket-url OBJECT_BUCKET_URL] [--object-access-key OBJECT_ACCESS_KEY] [--object-secret OBJECT_SECRET] [--capacity-mb CAPACITY_MB] [--help] [--description <DESCRIPTION>] <NAME>
```

### Add NFS Directory as Backup Storage

Configuration parameters that need to be prepared are as follows:
* NFS server IP or domain name
* NFS shared directory path

```bash
# Example, add nfs storage with storage address `192.168.1.1`, file path `/data/nfs` to backup storage
$ climc backupstorage-create --storage-type nfs --nfs-host 192.168.1.1 --nfs-shared-dir /data/nfs --capacity-mb 100000 nfs-backupstore
```

### Add Object Storage as Backup Storage

Configuration parameters that need to be prepared are as follows:
* Object storage bucket's access domain name
* Access Key
* Secret

```bash
# Example, add object storage with storage address `https://192.168.1.1:9000/backup` to backup storage
$ climc backupstorage-create --storage-type object --object-bucket-url https://192.168.1.1:9000/backup --object-access-key ACCESSKEY --object-secret SECRET --capacity-mb 100000 object-backupstore
```


