---
sidebar_position: 1
---

# 新建备份存储

从3.11开始，备份存储支持以下网络存储作为备份存储:

* NFS
* 对象存储

## 前置条件

要求所有宿主机都能通过网络访问备份存储，
* 对于NFS，可以在任意宿主机节点挂载备份存储
* 对于对象存储，可以再任意宿主机节点访问对象存储桶

## 创建方式

可以通过前端WebUI创建，也可以通过如下climc命令创建。

```bash
# 添加备份存储，目前--capacity-mb字段无意义，可随便填写
$ climc backupstorage-create [--storage-type {nfs,object}] [--nfs-host NFS_HOST] [--nfs-shared-dir NFS_SHARED_DIR] [--object-bucket-url OBJECT_BUCKET_URL] [--object-access-key OBJECT_ACCESS_KEY] [--object-secret OBJECT_SECRET] [--capacity-mb CAPACITY_MB] [--help] [--description <DESCRIPTION>] <NAME>
```

### 添加NFS目录作为备份存储

需要准备的配置参数如下：
* nfs服务器IP或域名
* nfs共享目录路径

```bash
# 举例，将存储地址`192.168.1.1`，文件路径`/data/nfs`的nfs存储添加到备份存储
$ climc backupstorage-create --storage-type nfs --nfs-host 192.168.1.1 --nfs-shared-dir /data/nfs --capacity-mb 100000 nfs-backupstore
```

### 添加对象存储作为备份存储

需要准备的配置参数如下：
* 对象存储桶的访问域名
* Access Key
* Secret

```bash
# 举例，将存储地址`https://192.168.1.1:9000/backup`的对象存储存储添加到备份存储
$ climc backupstorage-create --storage-type object --object-bucket-url https://192.168.1.1:9000/backup --object-access-key ACCESSKEY --object-secret SECRET --capacity-mb 100000 object-backupstore
```