---
sidebar_position: 4
edition: ce
---

# Adding Compute Nodes

To run AI applications in AI Cloud, you need to first add the corresponding compute nodes (hosts) and ensure they have the necessary container and (if applicable) GPU environment. This section describes how to deploy the base components on compute nodes and add hosts to the cluster.

Compute nodes are mainly responsible for container, network, storage, and GPU management.

## Environment

import OcbootEnv from '../../shared/getting-started/_parts/_quickstart-ocboot-k3s-env.mdx';

<OcbootEnv />

## Use ocboot to Add Corresponding Nodes

The following operations are performed on the control node. Use the `ocboot.sh add-node` command on the control node to add the corresponding compute node to the cluster.

Assuming you want to add compute node 10.168.222.140 to control node 10.168.26.216, you first need SSH root passwordless login to both the corresponding compute node and the control node itself.

::::tip Note
If it is a high-availability deployment environment, do not use the VIP for the control node IP when adding nodes. Only use the actual IP of the first control node, because the VIP may drift to other nodes, and usually only the first node has SSH passwordless login permissions configured for other nodes. Using other control nodes may cause SSH login to fail.
::::

```bash
# Set the control node itself to passwordless login
$ ssh-copy-id -i ~/.ssh/id_rsa.pub root@10.168.26.216

# Try passwordless login to the control node to verify
$ ssh root@10.168.26.216 "hostname"

# Copy the generated ~/.ssh/id_rsa.pub public key to the machine to be deployed
$ ssh-copy-id -i ~/.ssh/id_rsa.pub root@10.168.222.140

# Try passwordless login to the machine to be deployed. You should be able to get the hostname without entering a password
$ ssh root@10.168.222.140 "hostname"
```

### Add Nodes

The following commands are all run on the previously deployed control node. The control node should have the [ocboot](https://github.com/yunionio/ocboot) deployment tool installed in advance.

::::tip If you plan to run GPU-based AI applications
If you plan to run GPU-dependent AI applications (such as Ollama) on the new compute node, please complete [Setting up NVIDIA and CUDA Environment](./setup-nvidia-cuda) on the target compute node before running `ocboot.sh add-node` to add the node.<!-- If you plan to run GPU-dependent AI applications (such as Ollama/vLLM) on the new compute node, please complete [Setting up NVIDIA and CUDA Environment](./setup-nvidia-cuda) on the target compute node before running `ocboot.sh add-node` to add the node. -->
::::

```bash
# Use ocboot to add nodes
$ ./ocboot.sh add-node --enable-ai-env 10.168.26.216 10.168.222.140
```

```bash
# Other options, use '--help' for help
$ ./ocboot.sh add-node --help
```

### Enable Compute Nodes (Hosts)

After the compute nodes are added, you need to enable the newly reported compute nodes (hosts). Only enabled hosts can run virtual machines and related workloads.

```bash
# Use climc to view the registered host list
$ climc host-list

# Enable the specified host
$ climc host-enable <host_name>
```

## Common Troubleshooting

For common troubleshooting on compute nodes, please refer to: [Host Service Troubleshooting](../../onpremise/guides/host/troubleshooting).
