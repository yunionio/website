---
sidebar_position: 2
---

# Usage Method

## Load Balancer Working Principle

Load balancer functionality is implemented by load balancer clusters. Load balancer clusters are composed of multiple load balancer nodes. Each node is a Linux host running load balancer software. Nodes under the cluster all deploy the same software and configuration, are mutual primary and backup, and only one primary node exists at the same time. Load balancer nodes all run keepalived high availability software. keepalived detects the health status of each node to ensure only one primary node provides services.

Each load balancer node internally deploys open source load balancer software:

* haproxy: Responsible for TCP layer 4 load balancing and http/https layer 7 load balancing
* gobetween: Responsible for UDP layer 4 load balancing forwarding
* keepalived: Responsible for primary and backup node switching

## Load Balancer Configuration

To make load balancer functionality work normally, administrators need to perform related configuration on the platform, roughly divided into two steps:

### Step 1: Deploy Load Balancer Nodes

Load balancer nodes are the actual executors that carry load balancer functionality. At least 1 load balancer node needs to be deployed.

For specific steps to deploy a load balancer node, please refer to [Installation and Deployment](./lbagent).

The general recommended practice is to create a new single-network classic network virtual machine, and add this virtual machine as a load balancer node to the cluster. (Note: Turn off the virtual machine's "Source and Destination Address Check"!)

It is recommended to deploy 2 load balancer nodes to implement a high-availability load balancer cluster with primary-backup switching.

### Step 2: Configure Load Balancer Cluster

Create a new load balancer cluster and add the load balancer nodes deployed in step 1 to this cluster. Wait about 15 minutes. After the node's service obtains the cluster's configuration, the cluster starts working normally.

After the above configuration steps are complete, you can start using the load balancer.

## Create Load Balancer Instance 

After the load balancer cluster is configured, you can use the frontend Web interface to create load balancer instances.


