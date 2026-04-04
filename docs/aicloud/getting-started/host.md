---
sidebar_position: 4
edition: ce
---

# 添加计算节点

如果要在 AI 云中运行 AI 应用，需要先添加对应的计算节点（宿主机），并确保宿主机具备运行所需的容器与（如适用）GPU 环境。本节介绍如何部署计算节点的基础组件，并把宿主机加入集群。

计算节点主要负责容器、网络、存储和GPU的管理。

## 环境

:::tip 注意事项：

- 操作系统需要是干净的版本，因为部署工具会重头搭建指定版本的 k3s 集群，所以确保系统没有安装 kubernetes, containerd 等容器管理工具，否则会出现冲突导致安装异常。
- 最低配置要求: CPU 8核, 内存 8GiB, 存储 200GiB。
- 虚拟机和服务使用的存储路径都在 **/opt** 目录下，所以理想环境下建议单独给 **/opt** 目录设置挂载点。
    - 比如把 /dev/sdb1 单独分区做 ext4 然后通过 /etc/fstab 挂载到 /opt 目录。
:::


根据 CPU 架构不同，支持的发行版也不一样，目前支持的发行版情况如下：

注：4.0 表示发行版 Release/4.0.x。其余同理。

| Operationg system and Arch             | 4.0  |
| -------------------------------------- | ---- |
| OpenEuler 22.03 LTS SP3 x86_64         | ✅    |
| OpenEuler 22.03 LTS SP4 x86_64         | ✅    |
| OpenEuler 24.03 LTS SP2 x86_64         | ✅    |
| OpenEuler 24.03 LTS SP3 x86_64         | ✅    |
| CentOS 9 Stream x86_64                 | ✅    |
| CentOS 10 Stream x86_64                | ✅    |
| Ubuntu 20.04 LTS x86_64                | ✅    |
| Ubuntu 22.04 LTS x86_64                | ✅    |
| Ubuntu 24.04 LTS x86_64                | ✅    |
| Ubuntu 25.04 x86_64                    | ✅    |
| Debian 11 x86_64                       | ✅    |
| Debian 12 x86_64                       | ✅    |
| Debian 13 x86_64                       | ✅    |
| Rocky Linux 9.x  x86_64                | ✅    |
| Rocky Linux 10.x x86_64                | ✅    |
| AlmaLinux 10.x x86_64                  | ✅    |

## 使用 ocboot 添加对应节点

以下操作在控制节点进行，在控制节点使用 `ocboot.sh add-node` 命令把对应计算节点加入集群。

假设要给控制节点 10.168.26.216 添加计算节点 10.168.222.140，首先需要 SSH root 免密码登录对应的计算节点以及控制节点自身。

::::tip 注意
如果是高可用部署的环境，这里添加节点的控制节点 IP 请不要用 VIP，只能使用第 1 个控制节点的实际 IP。因为 VIP 可能发生漂移；并且通常只有第 1 个节点配置了到其他节点的 SSH 免密权限，用其他控制节点可能导致 SSH 登陆失败。
::::

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

以下命令在之前部署的控制节点运行；控制节点应提前安装好 [ocboot](https://github.com/yunionio/ocboot) 部署工具。

::::tip 如果要运行 GPU 的 AI 应用
如果你计划在新增计算节点上运行依赖 GPU 的 AI 应用（例如 Ollama），请先在目标计算节点完成 [配置 NVIDIA 与 CUDA 环境](./setup-nvidia-cuda)，再执行 `ocboot.sh add-node` 添加节点。<!-- 如果你计划在新增计算节点上运行依赖 GPU 的 AI 应用（例如 Ollama/vLLM），请先在目标计算节点完成 [配置 NVIDIA 与 CUDA 环境](./setup-nvidia-cuda)，再执行 `ocboot.sh add-node` 添加节点。 -->
::::

```bash
# 使用 ocboot 添加节点
$ ./ocboot.sh add-node --enable-ai-env 10.168.26.216 10.168.222.140
```

```bash
# 其他选项，使用 '--help' 查看帮助
$ ./ocboot.sh add-node --help
```

### 启用计算节点（宿主机）

等计算节点添加完成后，需要启用刚才上报的计算节点（宿主机），只有启用的宿主机才能运行虚拟机与相关工作负载。

```bash
# 使用 climc 查看注册的 host 列表
$ climc host-list

# 启动指定 host
$ climc host-enable <host_name>
```

## 常见问题排查

计算节点常见问题排查请参考：[Host 服务问题排查](../../onpremise/guides/host/troubleshooting)。

