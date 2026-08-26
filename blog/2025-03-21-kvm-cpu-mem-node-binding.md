---
title: Cloudpods 虚拟机 CPU 绑核与 NUMA 内存分配策略
date: 2025-03-22
slug: kvm-cpu-mem-node-binding
authors:
  - name: Yaoqi Wan
    url: https://github.com/wanyaoqi
    image_url: https://github.com/wanyaoqi.png
---

Cloudpods 在最新的版本对虚拟机 CPU 绑核与 NUMA 内存分配做了一些优化，默认情况下虚机会倾向于使用距离较近的 CPU 和 NUMA 内存。本文将会介绍 CPU 绑核与 NUMA 内存分配策略的具体内容以及一些相关的配置。

<!-- truncate -->

## 1. 宿主机 CPU 与内存预留

在介绍虚拟机 CPU 绑核与 NUMA 内存分配策略之前需要先介绍一下宿主机 CPU 与内存预留的功能，你需要对你的宿主机 CPU 与内存使用有一个规划，虚拟机使用的是除去预留资源之外的资源。

### 1.1 CPU 预留

CPU 预留的主要目的是将一些宿主机服务使用的 CPU 与虚机使用的 CPU 隔离开，避免宿主机服务与虚机之间相互影响，如果宿主机上没有负载很高会影响到虚机的服务则不用配置。

```bash
$ climc host-reserve-cpus --help
Usage: climc host-reserve-cpus [--mems MEMS] [--disable-sched-load-balance] [--processes-prefix PROCESSES_PREFIX] [--help] [--cpus CPUS] <ID> ...

# 参数介绍
# --cpus 对应的是 cpuset.cpus: 限制进程组使用的 CPU。
# --mems 对应的是 cpuset.mems, 限制可以使用的memory节点。
# --disable-sched-load-balance 对应 cpuset.sched_load_balance flag。
# --processes-prefix 指定需要绑定到 reserve cpus 的进程第 0 个参数，即可执行文件名

# example: 预留CPU 0-1,38-39 ，并将 ovs-vswitchd 与 kubelet 进程限制到预留的 CPU 内
$ climc host-reserve-cpus --cpus "0-1,38-39" --processes-prefix ovs-vswitchd --processes-prefix /usr/bin/kubelet test-host01
```

CPU 预留功能是通过 cgroup 来实现的，在 host-agent 服务启动时会执行 CPU 预留以及指定进程绑定到预留服务的功能。

### 1.2 内存预留

使用 NUMA 内存分配需要开启宿主机大页功能，所以这里只介绍宿主机开启大页如何预留内存。
默认情况下宿主机开启大页的预留策略是：预留宿主机 20% 的内存，最大不超过 32G，如果想要手动配置宿主机的预留内存，则可以通过设置 oc-hugetlb-gigantic-pages.service 服务添加 Environment RESERVED_MEM 来配置。

## 2. CPU 绑核与 NUMA 内存分配策略

以一台有两个 NUMA node 的宿主机为例：
```bash
$ numactl -H
available: 2 nodes (0-1)
node 0 cpus: 0 2 4 6 8 10 12 14 16 18 20 22 24 26 28 30 32 34 36 38
node 0 size: 128925 MB
node 0 free: 1066 MB
node 1 cpus: 1 3 5 7 9 11 13 15 17 19 21 23 25 27 29 31 33 35 37 39
node 1 size: 128997 MB
node 1 free: 636 MB
node distances:
node   0   1
  0:  10  21
  1:  21  10
```

假设预留了 CPU 0-1,38-39 给系统服务使用，则虚机能使用的 CPU 为node0, node1 两边各 18 个：
- node0: 2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36
- node1: 3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35,37

node0 与 node1 分别预留了 16G 内存，每边还剩 112G 内存。

### 2.1 分配策略

CPU 绑核与 NUMA 内存分配策略是尽量将 CPU，内存，GPU 等透传设备分配到同一 NUMA node 节点上，并且尽量保持 NUMA node 之间的分配均衡。

- 尽量分配到同一 NUMA node 节点上：
    - 当申请的虚机配置低于宿主机单个 NUMA node 配置时, 则会尽量将虚机的 CPU、内存、透传设备等分配到同一 node 上；如上面描述的宿主机单个 NUMA node 配置为 18C112G，申请的虚机配置为 16C32G，则会尽量执行该策略，虚机有一个 NUMA node，配置为 16C32G，落在宿主机的 node0 / node1 上。
    - 当申请的虚机配置高于宿主机单个 NUMA node 配置时，则会将虚机的配置均分到两个 NUMA node，如果两个 NUMA node 依旧无法提供足够的配置，会将虚机的配置均分到四个 NUMA node，以此类推；如上面描述的宿主机单个 NUMA node 配置为 18C112G，申请的虚机配置为 32C64G，则虚机有两 NUMA node，虚机的每个 NUMA node 16C/32G，分别落在宿主机的 node0 和 node1 上。
- 尽量保持 NUMA node 之间均衡：
    - NUMA 内存均衡，在分配选择 NUMA 节点时会优先选择内存分配率更低的 NUMA node。
    - CPU 分配均衡，在内存分配率相同的情况下会优先选择 CPU 分配率更低的 NUMA node。
    - GPU 分配均衡，假设同一种型号 GPU 在多个 NUMA node 上分别有 GPU，则分配时也会选择 GPU 分配率更低的 NUMA node。

### 2.2 host-agent 分配与调度分配

- host-agent 分配：宿主机开启大页，并且设置 enable_host_agent_numa_allocate

```bash
$ vi /etc/yunion/host.conf
enable_host_agent_numa_allocate: true
```

host-agent 分配是由调度器先选择宿主机，然后在宿主机内做 CPU 绑核与 NUMA 内存策略分配。

- 调度分配：宿主机开启大页，宿主机开启 NUMA 策略分配

```bash
$ climc host-update --enable-numa-allocate True <HOST_ID>
```

调度器分配则会在调度时考虑该宿主机的 NUMA node 情况，能否将 CPU、内存、GPU等分配到同一个 NUMA node 会影响宿主机打分。并且调度器会分配 VCPU 与 PCPU 的绑定关系。

### 2.3 查看虚机 cpu_numa_pin

- 由调度器分配的通过虚机 metadata 查看：
```bash
$ climc --output-format kv server-metadata test-server | grep cpu_numa_pin
  __cpu_numa_pin: [{"node_id":1,"size_mb":8192,"vcpu_pin":[{"pcpu":31,"vcpu":0},{"pcpu":33,"vcpu":1},{"pcpu":35,"vcpu":2},{"pcpu":37,"vcpu":3}]}]
```

- 宿主机上通过虚机描述文件查看: `cat /opt/cloud/workspace/servers/<ID>/desc | jq .cpu_numa_pin`

### 2.4 查看虚机 cpuset 绑核信息

虚机所属的 cgroup 默认是在 /sys/fs/cgroup/cpuset/cloudpods.hostagent 下，命名方式为 server_ID_PID。

```bash
$ cat /sys/fs/cgroup/cpuset/cloudpods.hostagent/server_<ID>_<PID>/cpuset.cpus

# 如果开启了 VCPU 与 PCPU 绑定关系，server_<ID>_<PID> 下还会有 ThreadID 命名的 VCPU 线程目录，可以查看 VCPU 线程 cpuset
$ cat /sys/fs/cgroup/cpuset/cloudpods.hostagent/server_<ID>_<PID>/<ThreadID>/cpuset.cpus

```

## 3. 虚机预留 CPU

除了以上描述的 CPU 绑核分配策略外，Cloudpods 还支持单独为虚机预留 CPU。

```bash
$ climc server-cpuset
Usage: climc server-cpuset [--help] <ID> <SETS>

eg: 为虚机 test-server 预留 2,4,6,8
$ climc server-cpuset test-server 2,4,6,8
预留后只有 test-server 虚机能用使用 2,4,6,8 CPU
```

## 总结

Cloudpods 默认提供了以 NUMA node 为均衡的分配策略，同时也提供了接口支持定制化的绑核需求，你可以根据自己的业务来选择策略。

