---
edition: ce
sidebar_position: 22
---

# Remove Private Cloud Compute Node

If you need to remove a compute node (host) from the private cloud, you need to execute the following steps to ensure a compute node is cleanly removed.

1. Migrate all virtual machines on this host away. Ensure there are no virtual machines on this host, and no disks in the local storage on this host

2. Delete host record. You can operate in the Web frontend, or execute climc command on the control node

```bash
$ climc host-delete <host_id>
```

Note: If host record deletion fails, the possible reason is that there are still uncleaned virtual machines on the host, or the host's local storage has uncleaned disks. When this happens, you can use the climc container's `clean_host.sh` script to automatically clean residual virtual machines and local disks on this host, and delete the host's database record

```bash
$ kubectl exec -ti -n onecloud $(kubectl get pods -n onecloud | grep climc | awk '{print $1}') sh # Enter climc container to execute the following command
$ cd /opt/yunion/scripts/tools/
$ ./clean_host.sh <host_id>
```

3. Delete the node's chassis record in ovn

First, stop the openvswitch service on this host and clean the /etc/openvswitch directory:

```bash
$ systemctl stop openvswitch
$ rm -fr /etc/openvswitch/*
```

Second, execute on the control node:

```bash
$ kubectl -n onecloud exec -it default-ovn-north-xxxxx /bin/sh # Enter ovn-northd container to execute the following command
/ $ ovn-sbctl show # Find the chassis id corresponding to this host, confirm through hostname and ip
...
Chassis "e6268b2e-4311-4f6d-a6e2-ddd09f49beef"
    hostname: taishan
    Encap geneve
        ip: "192.168.222.60"
        options: {csum="true"}
...
/ $ ovn-sbctl chassis-del <chassis_id>
```

4. Clean kubelet environment on this host. Execute on this host:

import OcbootUninstall from '@site/src/components/OcbootUninstall'

<OcbootUninstall />

5. Delete the cluster node information corresponding to this host. Execute on the control node:

```bash
$ kubectl get nodes # Find the k8s node name of this node
$ kubectl delete node <node_name>
```


