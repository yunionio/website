---
sidebar_position: 10
---

# 工作原理

容器主机是通过容器计算节点的host服务管理containerd实例，host通过调用containerd的cri grpc API实现对containerd内pod和containerd的管理。

## 服务

containerd由独立部署的yunion-containerd.service提供，通过systemctl管理。

```bash
systemctl status yunion-containerd.service
```

## 目录

yunion-containerd工作目录位于 /opt/yunion/containerd/，容器镜像和运行时容器的rootfs存储于此目录，需要预留足够的存储空间。

yunion-containerd二进制安装在/usr/local/bin目录下。

## 配置

host根据/etc/yunion/host.conf的 host_type 字段确定一台计算节点是虚拟化节点还是容器节点。虚拟化节点的 host_type 为 hypervisor，容器化节点的 host_type 为 container.

/etc/yunion/host_container_device.yml 用于配置宿主机上给容器使用的透传设备。

## lxcfs

计算节点必须安装lxcfs以支持容器内CPU和内存的模拟

## 常见操作

可以通过宿主机上 /usr/local/bin/crictl 实现对 containerd 的访问

1. 查看pod实例

```bash
crictl -r unix:///var/run/onecloud/containerd/containerd.sock pods
```

2. 查看容器实例

```bash
crictl -r unix:///var/run/onecloud/containerd/containerd.sock ps
```

3. 查看容器镜像

```bash
crictl -r unix:///var/run/onecloud/containerd/containerd.sock images
```