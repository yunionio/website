---
sidebar_position: 21
edition: ce
---

# Multi-Availability Zone Service Configuration

This document introduces the deployment of bare-metal agent, VMware-agent, and host-managed service in multiple availability zones (zone).

:::tip
This method is only applicable to environments deployed with ocboot.
:::

The platform has the concept of availability zones (zone), which can be understood as corresponding to the machine rooms in the actual environment. After the service is deployed, there will be a default availability zone `zone0`.

The baremetal-agent, esxi-agent, and host-managed services of the cloud platform are services at the availability zone level. If the physical servers, physical machines or managed VMware clusters in the actual environment are located in different machine rooms, multiple availability zones need to be created, and these services need to be deployed in different availability zones.

The following document introduces how to deploy these services in multiple availability zones.

## Create Availability Zones

The addition of availability zones is controlled by the `onecloud-operator` service. Just modify the `default onecloudcluster` resource in the onecloud namespace. For example, the following command adds the `my-zone-1` availability zone:

```bash
# Modify spec.customZones of "default onecloudcluster"
# Add the available zone to add
$ kubectl edit onecloudcluster -n onecloud default
...
  customZones:
  - my-zone-1
...
```

After modification, save and exit, and then use `climc zone-list` to see if the new availability zone is created:

```bash
$ climc zone-list
+--------------------------------------+-----------+--------+----------------+
|                  ID                  |   Name    | Status | Cloudregion_ID |
+--------------------------------------+-----------+--------+----------------+
| d64ccd80-7643-454d-8d40-7f5a0d57107f | my-zone-1 | enable | default        |
| 04f414a7-ce55-470a-8d64-c6e4e64ccdfc | zone0     | enable | default        |
+--------------------------------------+-----------+--------+----------------+
```

## Baremetal-Agent and ESXi-Agent Service

The created availability zone, my-zone-1, generates the baremetal-agent and ESXi-agent automatically. You can check the corresponding deployment as the following command shows:

```bash
$ kubectl get deployments. -n onecloud | grep my-zone-1
default-baremetal-agent-my-zone-1   0/0     0            0           3m37s
default-esxi-agent-my-zone-1        1/1     1            1           3m42s
```

The baremetal-agent service requires manual start on a k8s node.

### Enable baremetal-agent 

```bash
# $listen_interface is the name of the network interface that baremetal-agent listens to.
$ ocadm baremetal enable --node $node_name --listen-interface $listen_interface
# Observe the state of the baremetal agent pod to see if it starts successfully
$ watch "kubectl get pods -n onecloud | grep baremetal"
default-baremetal-agent-7c84996c9b-hhllw   1/1     Running   0          3m10s
# After successful launch, please confirm that the baremetal-agent has been registered with the control node.
$ climc agent-list
+--------------------------------------+--------------------------+----------------+-----------------------------+---------+------------+------------------------------------------+--------------------------------------+
|                  ID                  |           Name           |   Access_ip    |         Manager_URI         | Status  | agent_type |                 version                  |               zone_id                |
+--------------------------------------+--------------------------+----------------+-----------------------------+---------+------------+------------------------------------------+--------------------------------------+
| f3c2c671-c41d-4f30-8d04-e022b49bb9b5 | baremetal-10.168.222.150 | 10.168.222.150 | https://10.168.222.150:8879 | enabled | baremetal  | remotes/origin/master(5e415506120011509) | 6230b485-2e54-480e-8284-33360b8202a8 |
+--------------------------------------+--------------------------+----------------+-----------------------------+---------+------------+------------------------------------------+--------------------------------------+
```

## Host Services

The host service manages virtual machines on a physical host. By default, a physical host belongs to the `zone0` availability zone. If there are physical hosts in other data centers, you need to create a new availability zone, then create a layer 2 network (`wire`) in this zone, create a subnet (`network`) based on this layer 2 network (`wire`) that includes the IP address of the host to be registered, and finally add the physical host to the `wire`.

### Creating a Layer 2 Network

To create a layer 2 network (`my-wire-1`) based on an existing availability zone (`my-zone-1`), use the following command:

```bash
# 10000 represents the bandwidth; assuming it is a 10 Gbps network
$ climc wire-create my-zone-1 my-wire-1 10000

# To view the newly created layer 2 network, which should be under the `my-zone-1` availability zone
$ climc wire-list --details
+--------------------------------------+-----------+-----------+--------------------------------------+-----------+----------+---------+---------+--------------+-----------+
|                  ID                  |   Name    | Bandwidth |               Zone_ID                |   Zone    | Networks |   VPC   | VPC_ID  | public_scope | domain_id |
+--------------------------------------+-----------+-----------+--------------------------------------+-----------+----------+---------+---------+--------------+-----------+
| f0582003-8a11-4200-8ffd-025bbe7bfc5a | my-wire-1 | 10000     | d64ccd80-7643-454d-8d40-7f5a0d57107f | my-zone-1 | 0        | Default | default | system       | default   |
***  Total: 1 Pages: 1 Limit: 20 Offset: 0 Page: 1  ***
```

### Creating an IP subnet

To follow up on the last step, the second-layer network called "`my-wire-1`" has already been created. Next, we create a subnet that contains the IP addresses of registered VMs. Suppose the network information of the VM to be registered is as follows:

- IP: `192.168.121.61`
- Default Gateway: `192.168.121.1`
- Mask: `24`

Based on the VM information that needs to be registered, create a subnet called "my-hostnet-1", with a network range of `192.168.121.61-192.168.121.62`. You can also change the network range according to your own environment. The corresponding command is as follows:

```bash
$ climc network-create \
    --server-type baremetal \
    --gateway 192.168.121.21 \
    my-wire-1 my-hostnet-1 192.168.121.61 192.168.121.62 24
```

### Adding a compute node

After the subnet is created, you can use the deployment tool `ocboot` to add the target VM to the platform using the `add-node` command. For detailed instructions on how to add a compute node, please refer to [Adding Compute Nodes](../getting-started/onpremise/host). Suppose the IP address of the target VM is `192.168.121.61` and the control node IP is `192.168.121.21`. The corresponding command is as follows:

```bash
$ ./ocboot.py add-node 192.168.121.21 192.168.121.61
```

After waiting for the command to complete, check whether the host's availability zone is "my-zone-1" using the following command:

```bash
$ climc host-list --zone my-zone-1
+--------------------------------------+----------------------+-------------------+----------------+-----------------------------+---------+---------+-------------+----------+-----------+------------+---------------+--------------+------------+--------------------------------+--------------+-----------+--------------+
|                  ID                  |         Name         |    Access_mac     |   Access_ip    |         Manager_URI         | Status  | enabled | host_status | mem_size | cpu_count | node_count |      sn       | storage_type | host_type  |            version             | storage_size | domain_id | public_scope |
+--------------------------------------+----------------------+-------------------+----------------+-----------------------------+---------+---------+-------------+----------+-----------+------------+---------------+--------------+------------+--------------------------------+--------------+-----------+--------------+
| d80a4163-5466-43e3-8876-6bbcb042c911 | node2-192-168-121-61 | 52:54:00:e0:ed:9d | 192.168.121.61 | https://192.168.121.61:8885 | running | false   | online      | 3686     | 2         | 1          | Not Specified | rotate       | hypervisor | release/3.8(4064385d922011109) | 29405        | default   | system       |
+--------------------------------------+----------------------+-------------------+----------------+-----------------------------+---------+---------+-------------+----------+-----------+------------+---------------+--------------+------------+--------------------------------+--------------+-----------+--------------+
***  Total: 1 Pages: 1 Limit: 20 Offset: 0 Page: 1  ***
```
The host with IP address `192.168.121.61` has been added to the newly created availability zone `my-zone-1`.