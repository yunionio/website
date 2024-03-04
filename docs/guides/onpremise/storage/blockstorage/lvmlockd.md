---
sidebar_position: 8
---

# Lvmlockd

在 Centos8, OpenEuler 等操作系统中，lvmlockd 作为 clvm 的升级方案，本文介绍如何使用使用 lvmlockd 搭建 lvm 集群及如何注册到 cloudpods 中。

## 配置 lvmlockd 并创建 vg

使用 lvmlockd 搭建 shared lvm 集群：
```bash
$ yum install -y lvm2-lockd.x86_64
$ yum install -y sanlock.x86_64

$ vi /etc/lvm/lvm.conf
use_lvmlockd = 1

# Assign each host a unique host_id in the range 1-2000 by setting
$ vi /etc/lvm/lvmlocal.conf
    host_id = 2

$ systemctl enable wdmd sanlock --now
$ systemctl enable lvmlockd --now

# 首个节点执行，创建 cluster vg: vgcreate --shared <vgname> <devices>
$ vgcreate --shared cluster-vg /dev/sdb

# 每个节点执行
$ vgchange --lock-start

# 成功后可以查看 lvmlock 信息
# 查看 lvmlock 信息
$ lvmlockctl -i
```

## cloudpods 集群创建 Shared LVM 存储

```bash
# shared lvm vgname storage1
# 使用 lvmlockd 的存储类型为 slvm，并且需要加上参数 --lvmlockd, 区别于需要指定 master host 的 slvm 存储
# 当前这个宿主机并没有与存储关联，所以在 slvm 存储创建完成后需要关联该宿主机。
$ climc storage-create \ 
    --storage-type slvm \
    --slvm-vg-name storage1 \
    --lvmlockd \ # 设置 storage 为使用 lvmlockd 存储
    <STORAGE_NAME> <ZONE_ID_OR_NAME>

eg:
$ climc storage-create --slvm-vg-name storage1  --storage-type slvm --lvmlockd lvmlockd-storage1 zone0
$ climc host-storage-attach host1 lvmlockd-storage1

# 其他需要关联的宿主机也可以这样关联
$ climc host-storage-attach
Usage: climc host-storage-attach [--help] [--mount-point MOUNT_POINT] <HOST> <STORAGE>
# host_id 可以通过 climc host-list 获取
$ climc host-storage-attach <HOST_ID> lvmlockd-storage1
```

## 删除

删除存储与其他存储类似，和宿主机 detach 后可执行 `climc storage-delete`
