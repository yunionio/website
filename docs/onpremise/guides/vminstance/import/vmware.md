---
sidebar_position: 2
---

# 导入 VMware 虚拟机

导入 VMware 虚拟机又叫 "V2V" 迁移，该功能用于将纳管的VMware主机迁移到内置Cloudpods私有云。

:::tip
- VMware主机需要处于关机状态。
- Cloudpods内置私有云的宿主机和VMware的ESXi宿主机之间网络需要可以互相访问。
- VMware主机对接的经典网络IP子网在Cloudpods私有云中也需要能分配给虚拟机使用。
- 在Cloudpods平台创建和VMware主机同配置的虚拟机，并且将VMware主机的虚拟网卡卸载，挂载到新建的Cloudpods虚拟机上，创建虚拟磁盘，并且将VMware主机的磁盘作为KVM虚拟机磁盘的backing file，启动Cloudpods虚拟机，远程挂载VMware主机的磁盘，作为Cloudpods虚拟机的磁盘的backing file，启动成功后，Cloudpods虚拟机的磁盘内容为VMware虚拟机的磁盘，网络IP是VMware主机的IP。同时，将VMware主机设置为Freeze状态，禁止VMware主机启动，启动后，开始磁盘数据同步，会将Cloudpods虚拟磁盘底层的VMware虚拟机磁盘数据同步到Cloudpods虚拟机的上层磁盘文件，磁盘数据同步完成后，Cloudpods虚拟机不再依赖VMware虚拟机。
- 磁盘数据同步完成后，可以删除原来的VMware虚拟机，完成迁移。
- 如果迁移失败，则需要删除Cloudpods虚拟机(需确保在回收站清理)。删除后，会自动将虚拟网卡挂载回VMware虚拟机，并且解除VMware主机Freeze状态。
:::

## Web 控制台操作

### 单个虚拟机V2V迁移

1. 在虚拟机页面，单击虚拟机右侧操作列 **_"更多"_** 按钮，选择下拉菜单 **_"高可用-V2V迁移"_** 菜单项，弹出V2V迁移对话框。
2. 迁移类型默认迁移至KVM平台，选择宿主机，单击 **_"确定"_** 按钮，将VMware主机迁移到内置私有云主机。

### 批量V2V迁移

可以选择在不同宿主机的虚拟机V2V迁移到同一个宿主机上。

1. 在虚拟机列表中选择一个或多个虚拟机，单击列表上方 **_"批量操作"_** 按钮，选择下拉菜单 **_"高可用-V2V迁移"_** 菜单项项，弹出V2V迁移对话框。
2. 迁移类型默认迁移至KVM平台，选择宿主机，单击 **_"确定"_** 按钮，将VMware主机迁移到内置私有云主机。
