---
sidebar_position: 3
edition: ce
---

# Adding Compute Nodes

To run private cloud virtual machines, you must first add the corresponding computing nodes (hosts). This section describes how to deploy the corresponding components.

The computing node is mainly responsible for the management of virtual machines, networks, and storage. The components that need to be installed are as follows:

| Component      | Purpose                      |
| :-----------: | :---------------------------|
| host           | Manage KVM virtual machines and storage|
| host-deployer  | Virtual Machine Deployment Service      |
| sdnagent       | Manage virtual machine networks and security groups|
| openvswitch   | Configure virtual machine network ports and flow tables |
| qemu           | Run virtual machines |

## Environment

- Hardware requirements:
  - Virtualization: The CPU must support virtualization, which is used for virtual machine KVM acceleration. 
  - Enable IOMMU, VT-d: used for GPU pass-through (not required if no GPU).
- Network:
  - Currently available subnet: Virtual machines can directly use the flat subnet where the computing node is located. You need to reserve the corresponding endpoint in advance for the cloud platform virtual machine to avoid being occupied by other devices. IP conflicts should also be avoided.

import OcbootEnv from '../_parts/_quickstart-ocboot-env.mdx';

<OcbootEnv />

:::tip Note
If it is for testing purposes, you can deploy the compute node service on a virtual machine, but it may not be able to use KVM acceleration and GPU pass-through.
:::

## Use ocboot to add corresponding nodes

The following operations are performed on the control node. Use the `ocboot.py add-node` command on the control node to add the corresponding compute node.

Assuming that you want to add a compute node 10.168.222.140 to the control node 10.168.26.216, you need to ssh root free to log in to the corresponding compute node and the control node itself.

:::tip Note
If it is a high-availability deployment environment, do not use the VIP of the control node for adding node IP here, and only use the actual IP of the first control node. This is because the VIP may drift to other nodes, but usually only the first node is configured with ssh free to log in to other nodes. Using other control nodes may cause ssh login failure.
:::

```bash
# Set the control node itself as free login
$ ssh-copy-id -i ~/.ssh/id_rsa.pub root@10.168.26.216

# Try to log in to the control node without entering a password
$ ssh root@10.168.26.216 "hostname"

# Copy the generated ~/.ssh/id_rsa.pub public key to the computer to be deployed
$ ssh-copy-id -i ~/.ssh/id_rsa.pub root@10.168.222.140

# Try to log in to the deployed machine without entering a password, and you should be able to obtain the hostname of the deployed machine
$ ssh root@10.168.222.140 "hostname"
```

### Add nodes

The following commands are all executed on the previously deployed control node, and the [ocboot](https://github.com/yunionio/ocboot) deployment tool should already be installed.

```bash
# Assuming that the ocboot deployment tool is in the /root/ocboot directory
$ cd /root/ocboot

# Add nodes using ocboot
$ ./ocboot.py add-node 10.168.26.216 10.168.222.140

# Other options, refer to help with '--help'
$ ./ocboot.py add-node --help
usage: ocboot.py add-node [-h] [--user SSH_USER] [--key-file SSH_PRIVATE_FILE] [--port SSH_PORT] [--node-port SSH_NODE_PORT]
                          FIRST_MASTER_HOST TARGET_NODE_HOSTS [TARGET_NODE_HOSTS ...]

positional arguments:
  FIRST_MASTER_HOST     onecloud cluster primary master host, e.g., 10.1.2.56
  TARGET_NODE_HOSTS     target nodes ip added into cluster

optional arguments:
# This command will use ansible-playbook to add the corresponding compute nodes.
$ ansible-playbook -i inventory/hosts playbooks/add_nodes.yml --extra-vars "host_key=lzx-allinone-standalone" --tags addnodes  -e "node_ips=192.168.0.1,192.168.0.2,192.168.0.3"
```

### Enable Computing Nodes (Hosts)

After adding computing nodes, you need to enable the newly reported computing nodes. Only enabled hosts can run virtual machines.

```bash
# Use climc to view the registered list of hosts.
$ climc host-list
+--------------------------------------+-------------------------+-------------------+----------------+----------------------------+---------+---------+-------------+----------+-----------+------------+---------------+--------------+------------+-------------------------+--------------+
|                 ID                  |             Name               |     Access_mac      |   Access_ip    |        Manager_URI          | Status  | enabled | host_status | mem_size | cpu_count | node_count |      sn       | storage_type | host_type  |         version          | storage_size |
+--------------------------------------+-------------------------+-------------------+----------------+----------------------------+---------+---------+-------------+----------+-----------+------------+---------------+--------------+------------+-------------------------+--------------+
| 3830870e-a499-459d-89df-bb6979b5e1ff | lzx-allinone-standalone | 00:22:39:4c:6c:e9 | 10.168.222.140 | http://10.168.222.140:8885 | running | false   | online      | 8192     | 4         | 1          | Not Specified | rotate       | hypervisor | master(7ab047419092301) | 50141        |
+--------------------------------------+-------------------------+-------------------+----------------+----------------------------+---------+---------+-------------+----------+-----------+------------+---------------+--------------+------------+-------------------------+--------------+
*** Total: 0 Pages: 0 Limit: 20 Offset: 0 Page: 1 ***

# Start host
$ climc host-enable lzx-allinone-standalone
```

## Create virtual machine to test

### Upload cirros test image

```bash
# Download cirros test image
$ wget https://iso.yunion.cn/yumrepo-2.10/images/cirros-0.4.0-x86_64-disk.qcow2

# Upload image to glance
$ climc image-upload --format qcow2 --os-type Linux --min-disk 10240 cirros-0.4.0-x86_64-disk.qcow2 ./cirros-0.4.0-x86_64-disk.qcow2

# See uploaded image
$ climc image-list
+--------------------------------------+--------------------------------+-------------+----------+-----------+----------+---------+--------+----------------------------------+
|                  ID                  |              Name              | Disk_format |   Size   | Is_public | Min_disk | Min_ram | Status |             Checksum             |
+--------------------------------------+--------------------------------+-------------+----------+-----------+----------+---------+--------+----------------------------------+
| 63f6f2af-4db2-4e30-85f5-0ad3baa27bd9 | cirros-0.4.0-x86_64-disk.qcow2 | qcow2       | 22806528 | false     | 30720    | 0       | active | 76dc07d1a730a92d0db7fb2d3c305ecd |
+--------------------------------------+--------------------------------+-------------+----------+-----------+----------+---------+--------+----------------------------------+

# If the VM is used as a computing node, the storage may not be large, and the default size of the image can be adjusted from 30g to 10g.
$ climc image-update --min-disk 10240 cirros-0.4.0-x86_64-disk.qcow2
```

### Create test network

The following is a randomly created network that is not reachable between hosts for testing purposes. If there is a pre-configured flat layer 2 available network, it can be directly used for VMs.

```bash
$ climc network-create --gateway 10.20.30.1 --server-type guest bcast0 vnet0 10.20.30.2 10.20.30.254 24
$ climc network-public vnet0
```

### Create virtual machine

```bash
# Create a virtual machine testvm01 with 512M memory, 1 CPU, 10g system disk, and a second 5g disk formatted as ext4 and mounted on /opt.
$ climc server-create  --auto-start --allow-delete \
		--disk cirros-0.4.0-x86_64-disk.qcow2:10g --disk 5g:ext4:/opt \
		--net vnet0 --ncpu 1 --mem-spec 512M testvm01

# Check the created virtual machine, it should become running after 1 minute
$ climc server-list --details
+--------------------------------------+----------+--------------+--------------+-------+---------+------------+-----------+----------+-----------------------------+------------+---------+-------------------------+--------+-----------+
|                  ID                  |   Name   | Billing_type |     IPs      | Disk  | Status  | vcpu_count | vmem_size | Secgroup |         Created_at          | Hypervisor | os_type |          Host           | Tenant | is_system |
+--------------------------------------+----------+--------------+--------------+-------+---------+------------+-----------+----------+-----------------------------+------------+---------+-------------------------+--------+-----------+
| bcda7d18-decc-4b5f-8654-2d201a84d1fb | testvm01 | postpaid     | 10.20.30.254 | 35840 | running | 1          | 512       | Default  | 2019-09-23T05:08:49.000000Z | kvm        | Linux   | lzx-allinone-standalone | system | false     |
+--------------------------------------+----------+--------------+--------------+-------+---------+------------+-----------+----------+-----------------------------+------------+---------+-------------------------+--------+-----------+
***  Total: 0 Pages: 0 Limit: 20 Offset: 0 Page: 1  ***

# Get virtual machine login information
$ climc server-logininfo testvm01
+-----------+------------------------------------------+
|   Field   |                  Value                   |
+-----------+------------------------------------------+
| login_key | 49wqh5OWGW3jSr1A8RfrMoH69iRRECzaMZITBA== |
| password  | zS27FwwUFr96                             |
| updated   | 2019-09-23T05:11:29.306403Z              |
| username  | root                                     |
+-----------+------------------------------------------+

# Test network connectivity on the compute node (if you are using a layer 2 network, you should be able to ping the virtual machine's IP directly and you don't need this step)
$ ip address add 10.20.30.1/24 dev br0

$ ping 10.20.30.254
PING 10.20.30.254 (10.20.30.254) 56(84) bytes of data.
64 bytes from 10.20.30.254: icmp_seq=1 ttl=64 time=1.31 ms

# Use the username and password obtained from the "server-logininfo" command to log in directly to the virtual machine.
$ ssh root@10.20.30.254

# If the network is not connected, you can also log in to the virtual machine's TTY login interface through VNC on the front end.
```

## Common Problem Solving

Please refer to [Host Service Issues](../../guides/onpremise/host/troubleshooting) for common problem solving on compute nodes.
