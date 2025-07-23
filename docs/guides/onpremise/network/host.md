---
sidebar_position: 1
---

# 宿主机网络

私有云虚拟机所在宿主机的网络。

## 经典网络

宿主机内通过host服务的配置项networks（/etc/yunion/host.conf）指定宿主机的网络配置，该配置指定宿主机的指定物理网卡对应的二层网络，有两种配置方式：

- 网卡名称/网桥名称/网卡IP，例如：eth0/br0/192.168.222.10。这种配置模式告诉系统，宿主机的物理网卡eth0对接了192.168.222.10这个IP对应的IP子网对应的二层网络，并且将该物理网卡和网桥br0桥接。这种模式的物理网卡要被宿主机用来和外界通信，因此要配置一个有效的IP地址。在host服务启动时，会检测该IP是否配置在这个物理网卡上，如果不匹配，host服务会放弃启动。以此避免误配置该网卡。启动成功后，host服务会自动创建网桥，把物理网卡计入该网桥，并且把物理网卡上的IP配置信息迁移到网桥，以维持宿主机的正常网络通信。

- 网卡名称/网桥名称/二层网络名称，例如：eth1/brpub/wire1。这种配置模式告诉系统，宿主机的物理网卡eth1对接了二层网络wire1，该网卡不需要配置有效IP地址，并且该物理网卡和网桥brpub桥接。这种模式的物理网卡不被宿主机用来通信，因此不需要显式地配置有效的IP地址。在host服务启动时，会检查该物理网卡是否没有IP，如果有IP，则会放弃启动。以此避免误操作。启动成功后，会自动创建网桥，把物理网卡加入该网桥，并且会自动分配一个169.254.0.0/16的IP给这个网桥。

### 宿主机网络配置对调度的影响

当创建一台经典网络的虚拟机，调度器会查看虚拟机准备对接的IP子网，根据IP子网的二层网络过滤出对接的宿主机，把这些宿主机作为候选宿主机。

### VLAN支持

经典网络支持VLAN（802.1Q）。同一个经典网络下的二层网络的IP子网可以归属于不同的VLAN，这时需要设置IP子网的VLAN ID。IP子网的VLAN ID默认为1。

当一个IP子网的VLAN ID不为1时，则虚拟机接入该IP子网的网络接口将自动加入该VLAN。其底层实现原理为，在把虚拟机的虚拟网络接口加入OVS网桥时，设置该接口的VLAN tag为指定tag。为了允许一台宿主机上的虚拟机能够加入不同的VLAN，需要将宿主机的物理网口设置为Trunk模式，以允许同一条物理链路上不同VLAN tag的报文能够同时通过。

import VMVlanAccessPNG from './images/vm_vlan_access.png';

<img src={VMVlanAccessPNG} width="500" />

#### Host VLAN

为了允许虚拟机接入不同的VLAN，宿主机对应的网络接口必须以TRUNK模式接入交换机。这时，如果宿主机也需要通过该网络接口通信，则需要根据情况进行设置。1）如果宿主机该网络接口的VLAN ID为默认VLAN（VLAN=1）时，则宿主机不需要做特殊配置。2）如果宿主机该网络接口的VLAN ID不为1，则有两种解决方案：

（1）为该网络接口设置一个VLAN tag为宿主机VLAN的别名网口(Alias Interface)，将宿主机的IP地址配置在该别名网口上，宿主机将使用该别名网口通信。

import HostAliasVlanNICPNG from './images/host_alias_vlan_nic.png';

<img src={HostAliasVlanNICPNG} width="500" />

以物理机的网口为em1，VLAN ID为100，em1的虚拟机网桥br0为例，以下为运行时更改配置的命令：

```bash
ip link add link em1 name em1.100 type vlan id 100 && ip addr flush dev br0 && ip addr add 10.192.4.20/22 dev em1.100 && ip link set dev em1.100 up
```

（2）在交换机设置该trunk接口的默认VLAN ID为宿主机的VLAN ID。

#### BRTRUNK模式

在某些应用场景，例如用户在虚拟机内通过macvlan或网桥等技术为多个容器提供接入网络，用户可能有需要在虚拟机同一个网口虚拟多个vlan接口，发送多个VLAN tag的报文，这种情况下，需要做如下特殊设置，才能允许虚拟机的一个网口发送携带多个不同VLAN tag的报文：

1）该网口对应的IP子网的VLAN ID为1（默认VLAN），这样从该网口发出的报文只会被OVS网桥透明转发，不会再打上VLAN tag。
2）该虚拟机需要关闭“源IP和MAC地址检查”（在主机菜单：网络与安全-设置源/目标检查）。
3）宿主机对应网口为trunk模式。
4）交换机在对应网口放行对应的VLAN tag。

import BRTrunkPNG from './images/brtrunk.png';

<img src={BRTrunkPNG} width="500" />

## VPC网络

在host服务启动后，会在宿主机内创建用于vpc通信的网桥（默认名称为brvpc），所有对接VPC网络的虚拟机的虚拟网卡都要加入这个网桥。

更多 VPC 网络相关的文档可参考：[VPC网络](./vpc/)。
