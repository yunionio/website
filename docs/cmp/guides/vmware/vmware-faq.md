---
title: VMware 对接常见问题
sidebar_position: 3
---

## 创建虚拟机报错“磁盘分配失败”

如果创建 VMware 虚拟机出现“磁盘分配失败”的错误，应该是平台默认没有保存 vmdk 格式的系统模板导致的。

默认上传系统镜像到平台只会保留 qcow2 格式的模板文件，但创建 VMware 虚拟机需要 vmdk 格式的文件，可以通过下面的步骤开启 vmdk 镜像文件的转换，即可解决此问题。

1. 修改平台配置：

```bash
climc service-config-edit glance
```

将 `target_image_formats` 参数改成 qcow2 和 vmdk :

```yaml
  target_image_formats:
  - qcow2
  - vmdk
```

2. 重启 glance 服务：

```bash
kubectl rollout restart deployment -n onecloud $(kubectl get deployment -n onecloud | grep glance | awk '{print $1}')
```

相关问题:

- [纳管VMware vSAN，上传qcow2镜像后，使用镜像创建虚拟机报错“磁盘分配失败”](https://github.com/yunionio/cloudpods/issues/18774)
- [关闭自动转换vmdk镜像](../../../onpremise/guides/glance/sysimage/upload#turn-off-image-formats)


## VMware同步后主机没有IP

可能有两种原因：

1. 因为VMware主机的IP是通过虚拟机内的vmtools获取的，如果同步的时候虚拟机处于关机状态，或者虚拟机内vmtools未安装，或者虚拟机内vmtools未正确运行，则无法获取IP。

2. 能正常通过vmtools获取虚拟机的IP，但是该IP在平台没有对应的IP子网，导致无法判定虚拟机归属的IP子网。（此时，会将主机的IP信息保存在主机的标签中。前端会展示该IP，但是提示”该IP地址无归属IP子网！请添加包含该IP地址的IP子网并重新同步云账号“。）

因此，为了让VMware的主机在同步后有IP地址，需要满足两个条件：

1. 主机正在运行，且主机内已安装vmtools，并且vmtools正常运行

2. 主机IP在云台有归属的经典网络（Default VPC）的IP子网

## VMware同步后缺少主机

云平台同步资源时，要求VMware主机的UUID全局唯一，会自动忽略UUID相同的所有主机。可以从同步日志发现UUID相同的主机同步日志。

为了让UUID相同的主机能正常同步，需要手动修改主机的UUID，保证全局唯一。方法为：

在VMware平台，编辑主机的.vmx配置文件，修改bios.uuid字段。
