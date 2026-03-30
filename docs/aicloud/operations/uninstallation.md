---
sidebar_position: 25
edition: ce
---

# 卸载

根据平台安装方式，卸载方式各有不同，方式如下。

## Ocboot 安装 {#ocboot}

Ocboot 快速安装是指以 All in One 的方式，在服务器上安装了一个 K3s 或者 Kubernetes 集群，进而在集群中部署了 AI Cloud 平台。

因此卸载 AI Cloud 只需要卸载安装的 K3s 或者 Kubernetes 集群，以及在服务器上安装的相关包。

import OcbootUninstall from '@site/src/components/OcbootUninstall'

<OcbootUninstall />

卸载 GPU 驱动（可选）：

```bash
# 查看已安装的 NVIDIA 包
$ rpm -qa | grep nvidia
# 或
$ dpkg -l | grep nvidia

# 卸载 NVIDIA 驱动（以 CentOS/OpenEuler 举例）
$ yum -y remove nvidia-driver* cuda*
```

卸载数据库（以 CentOS/OpenEuler 举例）：

```bash
$ yum -y remove mariadb*
$ rm -rf /var/lib/mysql  # 保留原始数据执行 mv -f /var/lib/mysql /var/lib/mysql.$(date +"%Y%m%d-%H%M").bak
$ rm -rf /etc/my.conf
```

清理模型数据（可选）：

```bash
# 如不再需要已下载的模型文件
$ rm -rf /opt/cloud/workspace/llm_models
```

机器重启，恢复之前的网络：

```bash
$ reboot
```

卸载 openvswitch（先重启，再卸载 openvswitch，以免可能出现的断网情况）：

```bash
$ systemctl disable --now openvswitch
$ yum -y remove openvswitch-*
$ rm -rf /etc/openvswitch
```
