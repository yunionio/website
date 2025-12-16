---
sidebar_position: 21
edition: ce
---

# Multi-Zone Service Configuration

Introduction to deploying physical machine management service (baremetal-agent), VMware management service (esxi-agent), and host management service (host) under multiple availability zones (zone).

:::tip
This method only applies to environments deployed using ocboot.
:::


The platform has the concept of availability zones (zone), which can be understood as corresponding to data centers in the actual environment. After services are deployed, there will be a default availability zone zone0.

The cloud platform's physical machine management service (baremetal-agent), VMware management service (esxi-agent), and virtual machine management service (host) are zone-level services. If servers, physical machines, or managed VMware clusters in the actual environment are located in different data centers, you need to create multiple availability zones, then deploy these services in different availability zones.

The following documentation introduces how to deploy these services in multiple availability zones.

## Create Availability Zone

Availability zone addition is controlled by the onecloud-operator service. Directly modify the `default onecloudcluster` resource in the onecloud namespace. For example, the following command adds the `my-zone-1` availability zone:

```bash
# Modify spec.customZones of default onecloudcluster
# Add availability zones that need to be added
$ kubectl edit onecloudcluster -n onecloud default
...
  customZones:
  - my-zone-1
...
```

After modification, save and exit, then use `climc zone-list` to see if there is a newly created availability zone:

```bash
$ climc zone-list
+--------------------------------------+-----------+--------+----------------+
|                  ID                  |   Name    | Status | Cloudregion_ID |
+--------------------------------------+-----------+--------+----------------+
| d64ccd80-7643-454d-8d40-7f5a0d57107f | my-zone-1 | enable | default        |
| 04f414a7-ce55-470a-8d64-c6e4e64ccdfc | zone0     | enable | default        |
+--------------------------------------+-----------+--------+----------------+
```

## Physical Machine Management Service (baremetal-agent) and VMware Management Service (esxi-agent)

It is found that the newly created availability zone my-zone-1 already exists. The operator service will also automatically create the corresponding availability zone's physical machine management service (baremetal-agent) and VMware management service (esxi-agent). View the corresponding deployments with the following command:

```bash
$ kubectl get deployments. -n onecloud | grep my-zone-1
default-baremetal-agent-my-zone-1   0/0     0            0           3m37s
default-esxi-agent-my-zone-1        1/1     1            1           3m42s
```

The physical machine service (baremetal-agent) needs to select a k8s node to manually enable.

### Enable baremetal-agent 

Reference documentation: [Enable baremetal-agent](../getting-started/baremetal).

## Host Service

The host service (host) manages virtual machines on a host. Hosts under default conditions belong to availability zone zone0. If there are hosts in other data centers, you need to create a new availability zone, then create a layer 2 network (wire) belonging to this availability zone, then create a subnet (network) containing the registered host IP based on this layer 2 network (wire), and finally add the host.

### Create Layer 2 Network

Directly create layer 2 network my-wire-1 based on the previously created availability zone my-zone-1. The command is as follows:

```bash
# 10000 represents bandwidth, assuming it's a 10-gigabit network
$ climc wire-create my-zone-1 my-wire-1 10000

# View the newly created layer 2 network
# You can see the layer 2 network is under my-zone-1 availability zone
$ climc wire-list --details
+--------------------------------------+-----------+-----------+--------------------------------------+-----------+----------+---------+---------+--------------+-----------+
|                  ID                  |   Name    | Bandwidth |               Zone_ID                |   Zone    | Networks |   VPC   | VPC_ID  | public_scope | domain_id |
+--------------------------------------+-----------+-----------+--------------------------------------+-----------+----------+---------+---------+--------------+-----------+
| f0582003-8a11-4200-8ffd-025bbe7bfc5a | my-wire-1 | 10000     | d64ccd80-7643-454d-8d40-7f5a0d57107f | my-zone-1 | 0        | Default | default | system       | default   |
+--------------------------------------+-----------+-----------+--------------------------------------+-----------+----------+---------+---------+--------------+-----------+
***  Total: 1 Pages: 1 Limit: 20 Offset: 0 Page: 1  ***
```

### Create IP Subnet

According to the previous step, layer 2 network my-wire-1 has been created. Next, we create a subnet containing the registered host IP. Assuming the network information of the host to be registered is as follows:

- IP: 192.168.121.61
- Default gateway: 192.168.121.1
- Mask: 24

According to the host information that needs to be registered, create a my-hostnet-1 with network segment 192.168.121.61-192.168.121.62. You can also change the network range according to your environment. The corresponding command is as follows:

```bash
$ climc network-create \
    --server-type baremetal \
    --gateway 192.168.121.21 \
    my-wire-1 my-hostnet-1 192.168.121.61 192.168.121.62 24
```

### Add Compute Node

After the subnet is created, you can use the deployment tool ocboot's `add-node` command to add the target host to the platform. For detailed addition methods, please refer to [Add Compute Node](../getting-started/host). Assuming the target host IP is 192.168.121.61 and the control node IP is 192.168.121.21, the corresponding command is as follows:

```bash
$ ./ocboot.sh add-node 192.168.121.21 192.168.121.61
```

After the command execution is complete, check if the host's availability zone is my-zone-1:

```bash
$ climc host-list --zone my-zone-1
+--------------------------------------+----------------------+-------------------+----------------+-----------------------------+---------+---------+-------------+----------+-----------+------------+---------------+--------------+------------+--------------------------------+--------------+-----------+--------------+
|                  ID                  |         Name         |    Access_mac     |   Access_ip    |         Manager_URI         | Status  | enabled | host_status | mem_size | cpu_count | node_count |      sn       | storage_type | host_type  |            version             | storage_size | domain_id | public_scope |
+--------------------------------------+----------------------+-------------------+----------------+-----------------------------+---------+---------+-------------+----------+-----------+------------+---------------+--------------+------------+--------------------------------+--------------+-----------+--------------+
| d80a4163-5466-43e3-8876-6bbcb042c911 | node2-192-168-121-61 | 52:54:00:e0:ed:9d | 192.168.121.61 | https://192.168.121.61:8885 | running | false   | online      | 3686     | 2         | 1          | Not Specified | rotate       | hypervisor | release/3.8(4064385d922011109) | 29405        | default   | system       |
+--------------------------------------+----------------------+-------------------+----------------+-----------------------------+---------+---------+-------------+----------+-----------+------------+---------------+--------------+------------+--------------------------------+--------------+-----------+--------------+
***  Total: 1 Pages: 1 Limit: 20 Offset: 0 Page: 1  ***
```

It is found that the host 192.168.121.61 has been added to the newly created availability zone my-zone-1.


