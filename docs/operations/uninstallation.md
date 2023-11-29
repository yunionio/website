---
edition: ce
sidebar_position: 25
---

# 卸载

根据平台安装方式，卸载方式各有不同，方式如下。

##  Ocboot 快速安装

Ocboot 快速安装是指以 All in One 的方式，在服务器上安装了一个Kubernets集群，进而在集群中部署了Cloudpods。
因此卸载Cloupods只需要卸载安装的Kubernetes集群，以及在服务器上安装的相关包。

卸载服务器上的Kubernetes服务:

```bash
$ ocadm reset --force
$ kubeadm reset --force
$ ipvsadm --clear
```

停止并禁用相关服务：

```bash
$ systemctl disable --now docker.socket docker kubelet yunion-executor
```

卸载kubelet, yunion-executor等包，并清除相关的数据目录，下面以 centos 举例：

```bash
$ rpm -qa |grep kube |xargs -I {} yum -y remove {} 
$ rpm -qa |grep yunion |xargs -I {} yum -y remove {}
$ rm -rf /etc/kubernetes/ /var/lib/etcd/ /root/.kube/ /opt/cloud/
```

卸载数据库:

```bash
$ yum -y remove mariadb*
$ rm -rf /var/lib/mysql  # 保留原始数据执行 mv  -f /var/lib/mysql /var/lib/mysql.$(date +"%Y%m%d-%H%M").bak
$ rm -rf /etc/my.conf
```

机器重启，恢复之前的网络:

```bash
$ reboot
```

卸载openvswitch:

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
