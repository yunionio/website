---
edition: ce
sidebar_position: 22
---

# Offline Private Cloud Computing Nodes

If you need to take a computing node (host) offline from a private cloud, you need to take the following steps to ensure a clean offline for a computing node.

1. Migrate all virtual machines on the host away. Ensure that there are no virtual machines on the host, and that there are no disks in the local storage of the host.

2. Delete the host record, which can be done through the web frontend or by executing the climc command on the control node.

```bash
$ climc host-delete <host_id>
```

Note: If the deletion of the host record fails, the reason may be that there are virtual machines that have not been cleared on the host, or there is local storage that has not been cleared. In this case, you can use the `clean_host.sh` script of the climc container to automatically clean up the remaining virtual machines and local disks on the host and delete the host's database record.

```bash
$ kubectl exec -ti -n onecloud $(kubectl get pods -n onecloud | grep climc | awk '{print $1}') sh # Enter the climc container and execute the following command
$ cd /opt/yunion/scripts/tools/
$ ./clean_host.sh <host_id>
```

3. Delete the chassis record of the node in ovn.

First, stop the openvswitch service on the host and clean up the /etc/openvswitch directory.

```bash
$ systemctl stop openvswitch
$ rm -fr /etc/openvswitch/*
```

Next, execute on the control node:

```bash
$ kubectl -n onecloud exec -it default-ovn-north-xxxxx /bin/sh # Enter the ovn-northd container and execute the following command
/ $ ovn-sbctl show # Find the chassis ID corresponding to the host and confirm it with the hostname and IP.
...
Chassis "e6268b2e-4311-4f6d-a6e2-ddd09f49beef"
    hostname: taishan
    Encap geneve
        ip: "192.168.222.60"
        options: {csum="true"}
...
/ $ ovn-sbctl chassis-del <chassis_id>
```

4. Clean up the kubelet environment on the host, and execute the following command on the host:

```bash
$ kubeadm reset -f
```

5. Delete the k8s node information corresponding to the host, and execute the following command on the control node:

```bash
$ kubectl get nodes # Look for the k8s node name of the host.
$ kubectl delete node <node_name>
```