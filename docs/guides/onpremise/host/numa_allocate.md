---
sidebar_position: 7
---

# 宿主机开启 NUMA 内存分配

通常情况下宿主机上创建虚机时，虚机的内存是由操作系统随机的在宿主机上多个 numa 直接分配。开启 numa 内存分配后宿主机上的内存将会由 host-agent 管理，并且会尽可能的在创建虚机之前提前分配虚机使用的 numa 内存。

宿主机 host-agent 分配 numa 内存规则：
- 当单个 numa node 内存充足时，虚机的内存分配在同一个 numa 上。
- 当单个 numa node 内存不足时，会尝试以倍数增加虚机的 numa node后在多个 numa node 节点分配内存，并且使虚机的 numa node 和宿主机上的 numa node对应上。
- 当无法规整的在多个 numa node上分配内存时，将会由操作系统分配，host-agent 记录。


## 如何开启 NUMA 内存分配

宿主机开启 NUMA 内存分配的条件：
- 当前宿主机开启了大页
- 当前宿主机没有运行中的虚机
- 当前宿主机 numa node 数量超过 1

```bash
# 查看宿主机 numa node 数量
$ numactl -H
available: 2 nodes (0-1)
node 0 cpus: 0 2 4 6 8 10 12 14 16 18 20 22
node 0 size: 64460 MB
node 0 free: 7330 MB
node 1 cpus: 1 3 5 7 9 11 13 15 17 19 21 23
node 1 size: 64484 MB
node 1 free: 7557 MB
node distances:
node   0   1
  0:  10  20
  1:  20  10


# 宿主机开启 numa 内存分配
$ climc host-update --enable-numa-allocate True <HOST_ID>

# 确认已开启 numa 内存分配
$ climc host-show wyq-node-1-10-168-222-183 |grep enable_numa_allocate
| enable_numa_allocate          | true

# 重启当前 host-agent
$ kubectl delete pod -n onecloud <HOST_POD_NAME>
```

## 关闭 NUMA 内存分配

宿主机关闭 NUMA 内存分配的条件：
- 当前宿主机没有运行中的虚机

```bash
climc host-update --enable-numa-allocate False <HOST_ID>
```