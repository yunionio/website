---
sidebar_position: 1
---

# EIP Platform Configuration

This article introduces how to configure and use EIP.

## When is EIP Needed?

VPC networks provide users with an isolated virtual network, allowing users to configure any IP network segments within VPC networks, enabling virtual machines within VPCs to communicate through virtual networks. At the same time, the cloud platform enables default NAT functionality, allowing virtual machines within VPCs to actively access network addresses outside VPCs.

However, when we want external networks to actively access virtual machines within VPCs, we need to use EIP. EIP's role is to uniquely map an IP address in the physical network to a virtual IP in the VPC. When external networks access this EIP, traffic is automatically forwarded to the VPC virtual machine corresponding to the EIP, achieving the effect of external networks actively accessing virtual machines within VPCs.

## EIP Platform Configuration

For the EIP function to work properly, administrators need to perform relevant configuration on the platform, roughly divided into two steps:

### Step 1: Deploy EIP Gateway

For specific steps, please refer to [Deploy EIP Gateway](./eipgwhowto)

It should be noted that if using ocboot for quick deployment, the deployed node has EIP gateway functionality enabled by default. Therefore, after deployment is complete, you only need to configure the EIP network segment.

### Step 2: Configure EIP Network Segment

Administrators need to configure one or more EIP network segments on the platform for EIP address allocation.

The method for the cloud platform to configure EIP network segments is to create an IP subnet with type "EIP" in the classic network (Default VPC). You can create it in the frontend, or create it in the backend using climc command line. Creating EIP requires using classic network, that is, select Default VPC. Layer 2 network can select any layer 2 network.

However, EIP network segments cannot be set arbitrarily. They must be an IP network segment that is actually routable in the physical network and need to meet the following conditions: Packets accessing any IP address in the EIP network segment in the physical network must pass through the EIP gateway. Therefore, network administrators need to configure accordingly according to the EIP gateway's network configuration.

For AllInOne deployment configuration, generally configure routing as follows: On the layer 3 switch connected to the AllInOne node, add a static route. The destination network segment of this route is the EIP network segment, and the route next hop is the AllInOne node's IP address. To avoid route conflicts, EIP network segments should avoid overlapping with IP network segments where hosts are located.

For example, AllInOne deployment node IP address is 192.168.201.20/24, EIP network segment is selected as 192.168.202.1-254/24, then configure a static route on the layer 3 switch connected to the AllInOne node:

```
Network Prefix      NextHop
192.168.202.0/24    192.168.201.20
```

At the same time, configure a classic network IP subnet on the cloud platform with address range: 192.168.202.1-192.168.202.254, subnet mask length 24.

### Verify Route Configuration

You can verify if EIP routing is correctly configured through the following method:

Initiate a ping to the EIP from any node in the physical network that needs to access the EIP, then capture packets on the EIP gateway to see if ping packets are correctly received.

```bash
tcpdump -i eth0 -nnn host <eip> and icmp
```

## Using EIP

The process for users to use EIP is: Allocate an EIP address to a specified virtual machine, and access this EIP from external networks to access the virtual machine. This operation can be performed in the frontend Web UI, or implemented in the backend through climc commands.

```bash
climc server-create-eip --bandwidth <bw_mb> <server_id> 
```

