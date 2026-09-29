---
sidebar_position: 60
title: HAMI 配置与介绍
edition: ce
---

# HAMI 介绍

HAMi （异构 AI 计算虚拟化中间件）本身是一个用于管理 Kubernetes 集群中异构 AI 计算设备的开源平台。前身为 k8s-vGPU-scheduler，HAMi 可在多个容器和工作负载之间实现设备共享。 
HARMI-core提供了对GPU卡的显存和算力进行切分的能力，通过 CUDA API 劫持在软件层实现 GPU 虚拟化，允许多个容器共享同一张物理 GPU，每个容器只能"看到"自己申请的那部分显存，超额分配直接返回OOM。
HAMi-Core通过在容器内注入 libvgpu.so 的动态库，重写 dlsym 劫持其 hook 表中登记的 NVIDIA CUDA库函数，在不改驱动，不改应用的前提下，实现容器内GPU软隔离，实现显存上限拦截与算力限速。
我们使用 HAMI-core 中提供的容器设备资源软隔离能力对容器算力设备进行限制与分配。
详细介绍可以参考[文档](https://project-hami.io/zh/docs)

# 配置 HAMI 环境

平台默认使用 HAMI 作为算力切分工具，使用 HAMI 前置条件：
- 节点已装好 NVIDIA 驱动，nvidia-smi可正常输出，已安装 NVIDIA Container Toolkit。对于 npu 则需要安装华为 Ascend 驱动以及配置 Ascend 容器运行时。
- Cloudpods 云平台安装成功

HAMI 依赖包：
```bash
# rpm base 系统
# nvidia vgpu
$ yum install -y yunion-hami
# 华为 npu 则需要安装
$ yum install -y yunion-hami-npu

# deb base 系统
# nvidia vgpu
$ apt-get install -y yunion-hami
# Ascend vnpu 则需要安装
$ apt-get install -y yunion-hami-npu
```
Ascend npu 运行时配置参考
[Ascend运行时](https://www.hiascend.com/doc_center/source/zh/mindx-dl/500/dockerruntime/dockerruntimeug/MindX%20DL%205.0.0.2%20Ascend%20Docker%20Runtime%20%E7%94%A8%E6%88%B7%E6%8C%87%E5%8D%97%2001.pdf)

vgpu hami 依赖包中的核心文件为 /opt/cloud/hami/libvgpu.so 文件。
vnpu hami 依赖包中的核心文件为 /opt/cloud/hami/libvnpu.so 文件。

# Cloudpods HAMI 相关配置

```bash
$ vi /etc/yunion/host.conf
# nvidia vgpu
enable_cuda_hami: true # 默认为 true 可不做更改
# ascend vnpu
enable_container_ascend_npu_hami: true # 默认为 true 可不做更改
```

配置完成后可重启 host 服务查看设备信息
```bash
$ kubectl rollout restart ds -n onecloud default-host

# 等待 host 服务启动成功后查看设备是否注册，并且Sharing_mode为 HAMI
$ climc isolated-device-list --dev-type GPU
+--------------------------------------+----------+--------------+-----------+---------+------------------+--------------------------------------+-----------+------------------------------------------+---------------------+----------------------------------------------------------------------------------------------+-------+--------------+
|                  ID                  | Dev_type | Sharing_mode |   Model   |  Addr   | Vendor_device_id |               Host_id                | numa_node |               Device_path                |     Render_path     |                                          PCIE_Info                                           | Index | Device_minor |
+--------------------------------------+----------+--------------+-----------+---------+------------------+--------------------------------------+-----------+------------------------------------------+---------------------+----------------------------------------------------------------------------------------------+-------+--------------+
| b1eea028-1335-4fa1-81d1-5ae2bddd2ba2 | GPU      | HAMI         | Tesla P40 | 00:06.0 | 10de:1b38        | b82dc769-e65f-41fa-86fe-b40efe67d255 | -1        | GPU-76aef7ff-372d-2432-b4b4-beca4d8d3400 | /dev/dri/renderD128 | {"lane_width":16,"throughput":"15.76 GB/s","transfer_rate_per_lane":"8GT/s","version":"3.0"} | 0     | 0            |
+--------------------------------------+----------+--------------+-----------+---------+------------------+--------------------------------------+-----------+------------------------------------------+---------------------+----------------------------------------------------------------------------------------------+-------+--------------+
***  Total: 1 Pages: 1 Limit: 20 Offset: 0 Page: 1  ***

```




