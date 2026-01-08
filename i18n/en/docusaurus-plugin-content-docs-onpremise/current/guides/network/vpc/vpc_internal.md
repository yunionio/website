---
sidebar_position: 0.9
---

# VPC Principles

Introduction to VPC network implementation principles.

VPC network functionality is implemented based on the open source project [OVN](https://ovn.org).

Starting from 3.10, the ovn version used is 2.12.4.

The following figure is the architecture diagram of built-in private cloud platform and ovn related components.

import VPCOvnPNG from './vpc-ovn.png';

<img src={VPCOvnPNG} width="500" />

The functional descriptions of each component are as follows:

| Component            | Deployment Location | Function                                               |
|----------------|---------|---------------------------------------------------|
| region         | Control Node | Cloud controller, manages data of resources such as VPC, IP subnet, EIP, provides API interfaces   |
| vpcagent       | Control Node | Responsible for synchronizing and converting cloud platform network topology information to store in ovn northdb      |
| ovn-northd     | Control Node | Contains three components: ovn-northdb, ovn-northd and ovn-sourthdb. ovn-northd stores the northbound database of virtual networks facing the cloud platform, ovn-sourthd stores the southbound database of virtual networks facing underlying devices, ovn-northd is responsible for data format translation and conversion |
| ovn-controller | Compute Node | Gets network configuration information of this compute node (chassis) from ovn-southdb, and translates it into flow tables, injects into local openvswitch |
| host           | Compute Node | Cloud platform's host management agent program, communicates with cloud controller, responsible for managing virtual machines on this machine, including information synchronization, configuration management, etc.  |
| sdnagent       | Compute Node | Responsible for synchronizing virtual machine configurations to ovs, implementing connection between physical networks and virtual networks    |
| ovs            | Compute Node | Responsible for managing compute node's virtual switch configuration, synchronizing flow tables to kernel datapath  |
| ovsdb          | Compute Node | Responsible for maintaining compute node's virtual switch configuration information                      |

The workflow is briefly described as follows:

1. region is the cloud controller, implements information management of cloud resources, maintains basic information of resources such as VPC, IP subnet, virtual machine, EIP, and association relationships between resources
2. vpcagent periodically synchronizes information from region and converts cloud platform information to ovn-northd information. For example, converts IP subnets to ovn virtual machine switches, converts VPCs to ovn virtual routers,
3. ovn-northdb in ovn-northd receives vpcagent's data updates, ovn-southd receives physical network information reported by ovn-controller, converts ovn-northd's logical network topology information to physical network topology information according to physical network topology, saves in ovn-southd.
4. ovn-controller gets this machine's network configuration information from ovn-southd, converts to flow tables, injects into ovs
5. host gets configuration information of virtual machines running on this machine from region, including virtual machine network interface configuration, security groups, bandwidth rate limiting, etc., and saves locally. host is responsible for virtual machine startup and shutdown, etc.
6. sdnagent gets each virtual machine's configuration information from information saved by host, responsible for classic network virtual machine network card configuration, security group implementation and network rate limiting implementation, responsible for VPC network virtual machine virtual network card settings.

