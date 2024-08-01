---
sidebar_position: 5
---

# NFS 存储

本文介绍如何配置和使用NFS存储。

NFS存储是一种NAS存储，跟其他NAS存储的区别是：平台配置了NFS并关联宿主机后，会自动将NFS目录挂载到宿主机的指定目录上，不需要用户提前挂载。因此要求宿主机上安装了NFS客户端的软件（一般是nfs-utils）。

## 指定挂载NFS存储的参数

宿主机使用如下命令挂载NFS存储，无法传入额外的NFS存储挂载参数，但可能存在默认NFS挂载参数不适合该NFS存储的情况。

```
mount -t nfs 192.168.2.1:/export/nfsdata /opt/cloud/workspace/nfsdisks
```

如果用户需要指定NFS的挂载参数，可以修改改宿主机的 /etc/nfsmount.conf 来指定nfs挂载参数，例如：

```
# cat /etc/nfsmount.conf |grep -v '#'
[ NFSMount_Global_Options ]
nolock=True
```
