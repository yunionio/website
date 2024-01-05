---
sidebar_position: 7
---

# Shared LVM Storage

本文介绍如何使用 Shared LVM Storage，区别于 CLVM 需要搭建 pacemaker 集群同步 lvm 配置信息，这种方式需要选择一台计算节点作为 lvm master 节点操作 lvm 配置，其它节点不能对 lvm 配置信息操作。

需要在 Shared LVM Master 节点进行的操作有：
- create/delete/resize LV
- 缓存镜像

## 配置 Shared LVM Storage

配置 Shared LVM Storage 的前提是假设已经有 SAN 存储并且挂载到了宿主机上。

### 禁用 lvm2-lvmetad 服务

需要在每一台宿主机执行：

```bash
systemctl disable lvm2-lvmetad.socket --now
```

### 创建 vg

```bash
# 这里的 /dev/sd* 替换成 SAN 存储映射到宿主机上的块设备
$ pvcreate /dev/sdx /dev/sdy

# 创建 vg, vg name 为 storage1
$ vgcreate storage1 /dev/sdx /dev/sdy
```

## cloudpods 集群创建 Shared LVM 存储

```bash
# shared lvm vgname storage1
# master host 为lvm 操作节点，在创建 slvm 存储时需要指定一台计算节点宿主机作为操作 lvm 配置（创建，删除，扩容...)
# 当前这个宿主机并没有与存储关联，所以在 slvm 存储创建完成后需要关联该宿主机。
$ climc storage-create \ 
    --storage-type slvm \
    --slvm-vg-name storage1 \
    --master-host <HOST_ID_OR_NAME> \
    <STORAGE_NAME> <ZONE_ID_OR_NAME>

eg:
$ climc storage-create --storage-type slvm --slvm-vg-name storage1 --master-host host1 slvm-storage1 zone0
$ climc host-storage-attach host1 slvm-storage1

# 其他需要关联的宿主机也可以这样关联
$ climc host-storage-attach
Usage: climc host-storage-attach [--help] [--mount-point MOUNT_POINT] <HOST> <STORAGE>
# host_id 可以通过 climc host-list 获取
$ climc host-storage-attach <HOST_ID> slvm-storage1
```

这样 Shared LVM 存储创建完成了。
如果操作 LVM 的宿主机（master host）需要更新可以如下操作：
```bash
$ climc storage-update --master-host <NEW_HOST> slvm-storage1
```
