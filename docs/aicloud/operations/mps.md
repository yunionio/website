---
sidebar_position: 26
title: 配置 NVIDIA MPS 环境
edition: ce
---

# MPS 介绍

MPS（Multi-Process Service） 是NVIDIA为CUDA设计的多进程并发执行机制，允许多个CPU进程共享同一GPU的CUDA Context，从而突破默认单进程独占GPU的限制，实现多个进程的CUDA Kernel真正并行执行。

在默认情况下，GPU采用时间片轮转调度，不同进程的CUDA任务会交替运行，并伴随高昂的上下文切换开销。而MPS通过合并多个进程的上下文，将它们的Kernel交织发射到GPU，减少切换成本并提升GPU利用率。

参考[文档](https://docs.nvidia.com/deploy/mps/introduction.html)

# 配置 NVIDIA MPS 环境

配置 MPS 环境之前需要安装好 NVIDIA 驱动和 cloudpods 云平台。然后在容器主机宿主机上配置 MPS 相关组件。

安装 yunion-mps-daemon 服务
```bash
# rpm base 系统
$ yum install -y yunion-mps-daemon

# deb base 系统
$ apt-get install -y yunion-mps-daemon
```

修改 mps 配置
```bash
# 修改 host.conf 启用 MPS 并且指定 host_container_device.yml 配置文件
$ vi /etc/yunin/host.conf
enable_cuda_mps: true
container_device_config_file: /etc/yunion/host_container_device.yml

# 修改 host_container_device.yml 配置 MPS
# 这里的 path 为 NVIDIA GPU 对应的渲染设备
# type 修改为 NVIDIA_MPS，默认添加的 AI 节点 type 为 NVIDIA_GPU_SHARE
# virtual_number 是要使用 MPS 虚拟设备数量，单个设备可以显存为 memory.total / virtual_number
$ vi /etc/yunion/host_container_device.yml
devices:
  - path: "/dev/dri/renderD128"
    type: "NVIDIA_MPS"
    virtual_number: 4
```

启用 yunion-mps-daemon 服务
```bash
$ systemctl enable --now yunion-mps-daemon

启用成功后查询 gpu compute_mode，预期为 Exclusive_Process
$ nvidia-smi  --query-gpu=gpu_uuid,gpu_name,gpu_bus_id,memory.total,compute_mode --format=csv
uuid, name, pci.bus_id, memory.total [MiB], compute_mode
GPU-76aef7ff-372d-2432-b4b4-beca4d8d3400, Tesla P40, 00000000:00:06.0, 23040 MiB, Exclusive_Process
```

重启 host 服务
```bash
$ kubectl rollout restart ds -n onecloud default-host

# 等待 host 服务启动成功后查看 mps 设备是否注册
$ /opt/yunion/bin/climc isolated-device-list
+--------------------------------------+------------+-----------+-----------+------------------+--------------------------------------+-----------+------------------------------------------+----------------------------------------------------------------------------------------------+-------+--------------+
|                  ID                  |  Dev_type  |   Model   |   Addr    | Vendor_device_id |               Host_id                | numa_node |               Device_path                |                                          PCIE_Info                                           | Index | Device_minor |
+--------------------------------------+------------+-----------+-----------+------------------+--------------------------------------+-----------+------------------------------------------+----------------------------------------------------------------------------------------------+-------+--------------+
| 604b59e6-745b-4834-8c19-229af27c4333 | NVIDIA_MPS | Tesla P40 | 00:06.0-1 | 10de:1b38        | 197c1d98-316a-42e6-889d-68497153cc82 | -1        | GPU-76aef7ff-372d-2432-b4b4-beca4d8d3400 | {"lane_width":16,"throughput":"15.76 GB/s","transfer_rate_per_lane":"8GT/s","version":"3.0"} | -1    | -1           |
| 6736e951-c00d-4ef4-82bc-68efc0e04756 | NVIDIA_MPS | Tesla P40 | 00:06.0-2 | 10de:1b38        | 197c1d98-316a-42e6-889d-68497153cc82 | -1        | GPU-76aef7ff-372d-2432-b4b4-beca4d8d3400 | {"lane_width":16,"throughput":"15.76 GB/s","transfer_rate_per_lane":"8GT/s","version":"3.0"} | -1    | -1           |
| b8cbd75d-479a-41b8-8010-8221b09d5599 | NVIDIA_MPS | Tesla P40 | 00:06.0-3 | 10de:1b38        | 197c1d98-316a-42e6-889d-68497153cc82 | -1        | GPU-76aef7ff-372d-2432-b4b4-beca4d8d3400 | {"lane_width":16,"throughput":"15.76 GB/s","transfer_rate_per_lane":"8GT/s","version":"3.0"} | -1    | -1           |
| 2a90a0c1-7c3b-4b8f-848d-7aa596fa5cf2 | NVIDIA_MPS | Tesla P40 | 00:06.0-0 | 10de:1b38        | 197c1d98-316a-42e6-889d-68497153cc82 | -1        | GPU-76aef7ff-372d-2432-b4b4-beca4d8d3400 | {"lane_width":16,"throughput":"15.76 GB/s","transfer_rate_per_lane":"8GT/s","version":"3.0"} | -1    | -1           |
+--------------------------------------+------------+-----------+-----------+------------------+--------------------------------------+-----------+------------------------------------------+----------------------------------------------------------------------------------------------+-------+--------------+
***  Total: 4 Pages: 1 Limit: 20 Offset: 0 Page: 1  ***
```
