---
edition: ce
sidebar_position: 25
---

# Uninstall

The uninstallation methods vary depending on the platforms installation method, as follows.

## Ocboot Quick Installation

Ocboot Quick Installation means installing a Kubernetes cluster on the server in an All in One manner, and then deploying Cloudpods in the cluster. Therefore, uninstalling Cloudpods only requires uninstalling the installed Kubernetes cluster and related packages on the server.

Commands to uninstall Kubernetes services on the server:

```bash
$ ocadm reset --force
$ kubeadm reset --force
$ ipvsadm --clear
```

Stop and disable related services:

```bash
$ systemctl disable --now docker.socket docker kubelet yunion-executor
```

Uninstall packages such as kubelet and yunion-executor, and remove the related data directories. Take CentOS as an example:

```bash
$ rpm -qa |grep kube |xargs -I {} yum -y remove {} 
$ rpm -qa |grep yunion |xargs -I {} yum -y remove {}
$ rm -rf /etc/kubernetes/ /var/lib/etcd/ /root/.kube/ /opt/cloud/
```

Uninstall the database:

```bash
$ yum -y remove mariadb*
$ rm -rf /var/lib/mysql  # Retain the original data by executing mv -f /var/lib/mysql /var/lib/mysql.$(date +"%Y%m%d-%H%M").bak
$ rm -rf /etc/my.conf
```

Reboot the machine to restore the previous network:

```bash
$ reboot
```

Uninstall Openvswitch (restart first, then uninstall openvswitch to avoid possible network disconnection). The command is as follows:

```bash
$ systemctl disable --now openvswitch
$ yum -y remove openvswitch-*
$ rm -rf /etc/openvswitch
```

## Kubernetes Helm Installation

Use the following command to uninstall:

```bash
helm uninstall -n onecloud  default
```

## Docker Compose Installation

Use the following command to uninstall:

```bash
docker compose down
```