---
sidebar_position: 3
edition: ce
---

# Add Compute Nodes

To run private cloud virtual machines, you need to add corresponding compute nodes (hosts) first. This section describes how to deploy the corresponding components.

Compute nodes are mainly responsible for virtual machine, network, and storage management. The components that need to be installed are as follows:

|     Component      |              Purpose               |
| :----------------: | :--------------------------------: |
|       host         |   Manage KVM virtual machines and storage   |
|  host-deployer     |      Virtual machine deployment service      |
|     sdnagent       |   Manage virtual machine networks and security groups  |
|   openvswitch      | Virtual machine network port and flow table configuration |
|       qemu         |        Run virtual machines        |

## Environment

- Hardware requirements:
	- Virtualization: CPU must support virtualization for KVM acceleration of virtual machines
	- Enable IOMMU, VT-d: For GPU passthrough (can be disabled if GPU is not used)
- Network:
	- Currently available network segment: Virtual machines can directly use the flat network segment where the compute node is located. You need to pre-allocate and reserve corresponding IP ranges for cloud platform virtual machines to prevent them from being occupied by other devices, which would cause IP conflicts.

import OcbootEnv from '../../shared/getting-started/_parts/_quickstart-ocboot-k3s-env.mdx';

<OcbootEnv />

:::tip Note
If it is for testing purposes, you can deploy compute node services on a virtual machine, but KVM acceleration and GPU passthrough may not be available.
:::

## Use ocboot to Add Corresponding Nodes

The following operations are performed on the control node. Use the `ocboot.sh add-node` command on the control node to add the corresponding compute nodes.

Assuming you want to add compute node 10.168.222.140 to control node 10.168.26.216, you first need SSH root passwordless login to the corresponding compute node and the control node itself.

:::tip Note
If it is a high availability deployment environment, when adding nodes here, do not use the VIP for the control node IP, only use the actual IP of the first control node, because the VIP may drift to other nodes, but usually only the first node has SSH passwordless login permissions to other nodes configured. Using other control nodes will cause SSH login to fail.
:::

```bash
# Set the control node itself to passwordless login
$ ssh-copy-id -i ~/.ssh/id_rsa.pub root@10.168.26.216

# Try passwordless login to the control node to see if it succeeds
$ ssh root@10.168.26.216 "hostname"

# Copy the generated ~/.ssh/id_rsa.pub public key to the machine to be deployed
$ ssh-copy-id -i ~/.ssh/id_rsa.pub root@10.168.222.140

# Try passwordless login to the machine to be deployed. You should be able to get the hostname of the deployment machine without entering a login password
$ ssh root@10.168.222.140 "hostname"
```

### Add Nodes

The following commands are all run on the previously deployed control node. The control node should have the [ocboot](https://github.com/yunionio/ocboot) deployment tool installed in advance.

```bash
# Use ocboot to add nodes
$ ./ocboot.sh add-node 10.168.26.216 10.168.222.140

# Other options, use '--help' for help
$ ./ocboot.sh add-node --help
usage: ocboot.py add-node [-h] [--user SSH_USER] [--key-file SSH_PRIVATE_FILE] [--port SSH_PORT] [--node-port SSH_NODE_PORT]
                          FIRST_MASTER_HOST TARGET_NODE_HOSTS [TARGET_NODE_HOSTS ...]

positional arguments:
  FIRST_MASTER_HOST     onecloud cluster primary master host, e.g., 10.1.2.56
  TARGET_NODE_HOSTS     target nodes ip added into cluster

optional arguments:
  -h, --help            show this help message and exit
  --user SSH_USER, -u SSH_USER
                        primary master host ssh user (default: root)
  --key-file SSH_PRIVATE_FILE, -k SSH_PRIVATE_FILE
                        primary master ssh private key file (default: /home/lzx/.ssh/id_rsa)
  --port SSH_PORT, -p SSH_PORT
                        primary master host ssh port (default: 22)
  --node-port SSH_NODE_PORT, -n SSH_NODE_PORT
                        worker node host ssh port (default: 22)
```

This command will use ansible-playbook to add the corresponding compute nodes.


### Enable Compute Nodes (Hosts)

After the compute nodes are added, you need to enable the compute nodes that were just reported. Only enabled hosts can run virtual machines.

```bash
# Use climc to view the registered host list
$ climc host-list
+--------------------------------------+-------------------------+-------------------+----------------+----------------------------+---------+---------+-------------+----------+-----------+------------+---------------+--------------+------------+-------------------------+--------------+
||                  ID                  |          Name           |    Access_mac     |   Access_ip    |        Manager_URI         | Status  | enabled | host_status | mem_size | cpu_count | node_count |      sn       | storage_type | host_type  |         version         | storage_size |
+--------------------------------------+-------------------------+-------------------+----------------+----------------------------+---------+---------+-------------+----------+-----------+------------+---------------+--------------+------------+-------------------------+--------------+
|| 3830870e-a499-459d-89df-bb6979b5e1ff | lzx-allinone-standalone | 00:22:39:4c:6c:e9 | 10.168.222.140 | http://10.168.222.140:8885 | running | false   | online      | 8192     | 4         | 1          | Not Specified | rotate       | hypervisor | master(7ab047419092301) | 50141        |
+--------------------------------------+-------------------------+-------------------+----------------+----------------------------+---------+---------+-------------+----------+-----------+------------+---------------+--------------+------------+-------------------------+--------------+
***  Total: 0 Pages: 0 Limit: 20 Offset: 0 Page: 1  ***

# Enable host
$ climc host-enable lzx-allinone-standalone
```

## Common Troubleshooting

For common troubleshooting of compute nodes, please refer to: [Host Service Troubleshooting](../guides/host/troubleshooting).
