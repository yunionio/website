---
sidebar_position: 3
edition: ce
---

# 添加计算节点

如果要运行私有云虚拟机，需要先添加对应的计算节点(宿主机)，本节介绍如何部署相应组件。

计算节点主要负责虚拟机、网络和存储的管理，需要安装的组件如下:

|     组件      |           用途           |
| :-----------: | :----------------------: |
|     host      |  管理 kvm 虚拟机和存储   |
| host-deployer |      虚拟机部署服务      |
|   sdnagent    |  管理虚拟机网络和安全组  |
|  openvswitch  | 虚拟机网络端口和流表配置 |
|     qemu      |        运行虚拟机        |

## 环境

- 硬件要求:
	- Virtualization: CPU 要支持虚拟化，用于虚拟机 KVM 加速
	- 打开 iommu，VT-d: 用于 GPU 透传(不用GPU可以不开)
- 网络:
	- 当前可用的网段: 虚拟机可以直接使用和计算节点所在的扁平网段，需要预先划分保留对应端给云平台虚拟机使用，防止被其它设备占用，最后 IP 冲突

import OcbootEnv from '../_parts/_quickstart-ocboot-k3s-env.mdx';

<OcbootEnv />

:::tip 备注
如果是以测试为目的，可以拿一台虚拟机部署计算节点的服务，但可能无法使用 KVM 加速和 GPU 透传。
:::

## 使用 ocboot 添加对应节点

以下操作在控制节点进行，在控制节点使用 `ocboot.sh add-node` 命令把对应计算节点添加进来。

假设要给控制节点 10.168.26.216 添加计算节点 10.168.222.140 首先需要 ssh root 免密码登录对应的计算节点以及控制节点自身。

:::tip 注意
如果是高可用部署的环境，这里添加节点的控制节点 ip 不要用 vip ，只能用第1个控制节点的实际 ip ，因为 vip 有可能漂移到其他节点上，但通常只有第1个节点配置了 ssh 免密登陆登陆其他节点的权限，用其他控制节点会导致 ssh 登陆不上。
:::

```bash
# 将控制节点自己设置成免密登录
$ ssh-copy-id -i ~/.ssh/id_rsa.pub root@10.168.26.216

# 尝试免密登录控制节点是否成功
$ ssh root@10.168.26.216 "hostname"

# 将生成的 ~/.ssh/id_rsa.pub 公钥拷贝到待部署的计算机器
$ ssh-copy-id -i ~/.ssh/id_rsa.pub root@10.168.222.140

# 尝试免密登录待部署机器，应该不需要输入登录密码即可拿到部署机器的 hostname
$ ssh root@10.168.222.140 "hostname"
```

### 添加节点

以下命令都是在之前部署的控制节点运行，控制节点应该提前安装好了 [ocboot](https://github.com/yunionio/ocboot) 部署工具。

```bash
# 使用 ocboot 添加节点
$ ./ocboot.sh add-node 10.168.26.216 10.168.222.140

# 其他选项，使用 '--help' 参考帮助
$ ./ocboot.sh add-node --help
usage: ocboot.py add-node [-h] [--user SSH_USER] [--key-file SSH_PRIVATE_FILE] [--port SSH_PORT] [--node-port SSH_NODE_PORT]
                          FIRST_MASTER_HOST TARGET_NODE_HOSTS [TARGET_NODE_HOSTS ...]

positional arguments:
  FIRST_MASTER_HOST     onecloud cluster primary master host, e.g., 10.1.2.56
  TARGET_NODE_HOSTS     target nodes ip added into cluster

optional arguments:
  -h, --help            show this help message and exit
  --user SSH_USER, -u SSH_USER
                        primary master host ssh user (default: root)
  --key-file SSH_PRIVATE_FILE, -k SSH_PRIVATE_FILE
                        primary master ssh private key file (default: /home/lzx/.ssh/id_rsa)
  --port SSH_PORT, -p SSH_PORT
                        primary master host ssh port (default: 22)
  --node-port SSH_NODE_PORT, -n SSH_NODE_PORT
                        worker node host ssh port (default: 22)
```

该命令会使用 ansible-playbook 把对应的计算节点加入进来。


### 启用计算节点(宿主机)

等计算节点添加完成后，需要启用刚才上报的计算节点，只有启用的宿主机才能运行虚拟机。

```bash
# 使用 climc 查看注册的 host 列表
$ climc host-list
+--------------------------------------+-------------------------+-------------------+----------------+----------------------------+---------+---------+-------------+----------+-----------+------------+---------------+--------------+------------+-------------------------+--------------+
|                  ID                  |          Name           |    Access_mac     |   Access_ip    |        Manager_URI         | Status  | enabled | host_status | mem_size | cpu_count | node_count |      sn       | storage_type | host_type  |         version         | storage_size |
+--------------------------------------+-------------------------+-------------------+----------------+----------------------------+---------+---------+-------------+----------+-----------+------------+---------------+--------------+------------+-------------------------+--------------+
| 3830870e-a499-459d-89df-bb6979b5e1ff | lzx-allinone-standalone | 00:22:39:4c:6c:e9 | 10.168.222.140 | http://10.168.222.140:8885 | running | false   | online      | 8192     | 4         | 1          | Not Specified | rotate       | hypervisor | master(7ab047419092301) | 50141        |
+--------------------------------------+-------------------------+-------------------+----------------+----------------------------+---------+---------+-------------+----------+-----------+------------+---------------+--------------+------------+-------------------------+--------------+
***  Total: 0 Pages: 0 Limit: 20 Offset: 0 Page: 1  ***

# 启动 host
$ climc host-enable lzx-allinone-standalone
```

## 常见问题排查

计算节点常见问题排查请参考：[Host服务问题排查](../../guides/onpremise/host/troubleshooting)。
