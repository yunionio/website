---
sidebar_position: 25
edition: ce
---

# Uninstallation

Depending on the installation method, the uninstallation methods vary as follows.

## Ocboot Installation {#ocboot}

Ocboot quick installation refers to installing a K3s or Kubernetes cluster on a server in an All in One manner, and then deploying the AI Cloud platform in the cluster.

Therefore, uninstalling AI Cloud only requires uninstalling the installed K3s or Kubernetes cluster and the related packages installed on the server.

import OcbootUninstall from '@site/src/components/OcbootUninstall'

<OcbootUninstall />

Uninstall GPU drivers (optional):

```bash
# Check installed NVIDIA packages
$ rpm -qa | grep nvidia
# or
$ dpkg -l | grep nvidia

# Uninstall NVIDIA drivers (CentOS/OpenEuler example)
$ yum -y remove nvidia-driver* cuda*
```

Uninstall database (CentOS/OpenEuler example):

```bash
$ yum -y remove mariadb*
$ rm -rf /var/lib/mysql  # To keep original data, run: mv -f /var/lib/mysql /var/lib/mysql.$(date +"%Y%m%d-%H%M").bak
$ rm -rf /etc/my.conf
```

Clean up model data (optional):

```bash
# If you no longer need the downloaded model files
$ rm -rf /opt/cloud/workspace/llm_models
```

Reboot the machine to restore the previous network:

```bash
$ reboot
```

Uninstall openvswitch (reboot first, then uninstall openvswitch to avoid potential network disconnection):

```bash
$ systemctl disable --now openvswitch
$ yum -y remove openvswitch-*
$ rm -rf /etc/openvswitch
```
