---
sidebar_position: 3
---

# CLVM 存储

介绍如何配置和使用CLVM存储。

## 配置 CLVM

配置 CLVM 的前提是假设已经有 SAN 存储并且挂载到了宿主机上。

### 使用 pacemaker 创建 CLVM 管理器

Pacemaker是 Linux环境中使用最为广泛的开源集群资源管理器， Pacemaker利用集群基础架构(Corosync或者 Heartbeat)提供的消息和集群成员管理功能。

```bash
# 每台节点安装 lvm2-cluster
$ yum install -y lvm2-cluster
$ lvmconf –enable-cluster

# 在每台节点上安装并启动 pcsd
$ yum install pacemaker pcs -y
$ systemctl enable pcsd --now

# pcs 创建集群
# 每台节点上设置一个 hacluster 用户，也可以不用 hacluster 用户，但是每个节点上用户名和密码一致
$ echo "password123" |passwd --stdin hacluster


##### 接下来的操作选择集群中的一台节点执行 #####
# 192.168.222.100 192.168.222.101 192.168.222.102 为节点ip
# 根据指引输入用户名密码 
$ pcs cluster auth 192.168.222.100 192.168.222.101 192.168.222.102

# 创建并启动集群
$ pcs cluster setup --name mycluster 192.168.222.100 192.168.222.101 192.168.222.102
$ pcs cluster start --all

# 查看集群状态
$ pcs status cluster
$ pcs status corosync

# 配置集群资源
# 禁用 stonith
$ pcs property set stonith-enabled=false
# 禁用自动故障转移
$ pcs property set no-quorum-policy=ignore
# 创建 DLM 分布式锁管理器和 CLVM 集群逻辑卷管理器并指定依赖关系和启动顺序
$ pcs resource create dlm ocf:pacemaker:controld allow_stonith_disabled=true op monitor interval=30s clone interleave=true ordered=true
$ pcs resource create clvmd ocf:heartbeat:clvm op monitor interval=30s clone interleave=true ordered=true
$ pcs constraint order start dlm-clone then clvmd-clone
$ pcs constraint colocation add clvmd-clone with dlm-clone
```

### 创建 CLVM

```bash
# 这里的 /dev/sd* 替换成 SAN 存储映射到宿主机上的块设备
$ pvcreate /dev/sdx /dev/sdy

# 创建 clustered vg, vg name 为 storage1
$ vgcreate -cy storage1 /dev/sdx /dev/sdy
```


## cloudpods 集群创建 CLVM 存储

```bash
$ climc storage-create
Usage: climc storage-create [--medium-type {ssd,rotate}] [--storage-type {local,nas,vsan,rbd,nfs,gpfs,baremetal,clvm}] [--rbd-mon-host RBD_MON_HOST] [--rbd-rados-mon-op-timeout RBD_RADOS_MON_OP_TIMEOUT] [--rbd-rados-osd-op-timeout RBD_RADOS_OSD_OP_TIMEOUT] [--rbd-client-mount-timeout RBD_CLIENT_MOUNT_TIMEOUT] [--rbd-key RBD_KEY] [--rbd-pool RBD_POOL] [--nfs-host NFS_HOST] [--nfs-shared-dir NFS_SHARED_DIR] [--clvm-vg-name CLVM_VG_NAME] [--help] [--capacity CAPACITY] <NAME> <ZONE>
# clvm vgname storage1, storage name clvm-storage1
$ climc storage-create --storage-type clvm --clvm-vg-name storage1 clvm-storage1 zone0

$ climc host-storage-attach
Usage: climc host-storage-attach [--help] [--mount-point MOUNT_POINT] <HOST> <STORAGE>
# host_id 可以通过 climc host-list 获取
$ climc host-storage-attach <HOST_ID> clvm-storage1
```

到此 clvm 的配置就完成了，创建虚机和磁盘时候可以选择存储类型为 clvm。
