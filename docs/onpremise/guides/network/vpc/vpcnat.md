---
sidebar_position: 5
---

# VPC NAT

本文介绍VPC网络的NAT功能。

VPC网络是一个隔离的虚拟网络，用户可以在VPC网络内按需配置任意IP网段，VPC网络实现同一个VPC内IP子网的互联。

VPC访问外网的模式由ExternalAccessMode决定。可能值为

| ExternalAccessMode | 说明                                                                     |
|--------------------|-------------------------------------------------------------------------|
| eip                | 通过EIP访问外网，只有虚拟机挂载了EIP才能访问                                  |
| distgw             | 通过宿主机的分布式NAT网关访问外网                                            |
| eip-distgw         | 如果虚拟机未挂载EIP，则通过分布式NAT网关访问外网，否则通过EIP访问外网。这是默认方式 |
| none               | 虚拟机不能通过VPC访问外网                                                  |

当VPC开启分布式NAT网关功能后，VPC内虚拟机需要访问外部网关时，需要通过NAT网关实现对外部网络的访问。

如下图所示，当VM访问外部网络时，其流量被VPC转发到NAT网关，NAT网关再将VM发出的报文转发到目的地址，并且同时把IP报文的源地址转换为NAT网关的物理网络IP地址。

import VPCNatPNG from "./vpcnat.png";

<img src={VPCNatPNG} width="500" />

平台实现了*分布式NAT*的功能，即每台宿主机均为一个NAT网关，负责本宿主机上VPC虚拟机访问外网的流量转发。因此，只需要宿主机可以访问外网，则VPC内虚拟机即可访问外网。

## 修改VPC外网访问模式

可以通过climc命令修改VPC的外网访问模式，例如

```bash
climc vpc-update --external-access-mode eip vpc0
```
