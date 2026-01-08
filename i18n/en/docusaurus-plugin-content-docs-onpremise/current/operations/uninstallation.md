---
edition: ce
sidebar_position: 25
---

# Uninstallation

According to the platform installation method, uninstallation methods vary. The methods are as follows.

##  Ocboot Installation {#ocboot}

Ocboot quick installation means installing a K3s or Kubernetes cluster on the server in an All in One manner, and then deploying Cloudpods in the cluster.

Therefore, uninstalling Cloudpods only requires uninstalling the installed K3s or Kubernetes cluster, and related packages installed on the server.

import OcbootUninstall from '@site/src/components/OcbootUninstall'

<OcbootUninstall />

Uninstall database (using CentOS as an example):

```bash
$ yum -y remove mariadb*
$ rm -rf /var/lib/mysql  # To preserve original data, execute mv  -f /var/lib/mysql /var/lib/mysql.$(date +"%Y%m%d-%H%M").bak
$ rm -rf /etc/my.conf
```

Reboot the machine to restore the previous network:

```bash
$ reboot
```

Uninstall openvswitch (reboot first, then uninstall openvswitch to avoid possible network disconnection). The command is as follows:

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
````


