---
edition: ce
sidebar_position: 25
---

# 卸载

根据平台安装方式，卸载方式各有不同，方式如下。

##  Ocboot 安装 {#ocboot}

Ocboot 快速安装是指以 All in One 的方式，在服务器上安装了一个 K3s 或者 Kubernets 集群，进而在集群中部署了Cloudpods。

因此卸载Cloupods只需要卸载安装的 K3s 或者 Kubernetes 集群，以及在服务器上安装的相关包。

import OcbootUninstall from '@site/src/components/OcbootUninstall'

<OcbootUninstall />

卸载数据库(以 CentOS 举例):

```bash
$ yum -y remove mariadb*
$ rm -rf /var/lib/mysql  # 保留原始数据执行 mv  -f /var/lib/mysql /var/lib/mysql.$(date +"%Y%m%d-%H%M").bak
$ rm -rf /etc/my.conf
```

机器重启，恢复之前的网络：

```bash
$ reboot
```

卸载openvswitch（先重启，再卸载 openvswitch，以免可能出现的断网情况）。命令如下：

```bash
$ systemctl disable --now openvswitch
$ yum -y remove openvswitch-*
$ rm -rf /etc/openvswitch
```

## Kubernetes Helm 安装

使用如下命令卸载：

```bash
helm uninstall -n onecloud  default
```

## Docker Compose 安装

使用如下命令卸载：

```bash
docker compose down
````
