---
sidebar_position: 3
---

# VPC MTU

Introduction to modifying MTU of virtual machines in VPC.

VPC networks are virtual networks built on physical networks through tunnel technology. Therefore, each VPC network packet needs to reserve a certain amount of space in the header for tunnel protocol use. This reserved byte count is defined in the constant VPC_OVN_ENCAP_COST in pkg/apis/compute/vpcs_ovn.go, with a default value of 60 bytes. (Note: The default value before version 3.8 was 58 bytes). At the same time, physical network MTU is generally 1500 bytes, so VPC virtual machine MTU defaults to 1440 bytes. This article introduces the impact of 1440-byte MTU on applications in the default case and solutions. It also introduces how to set VPC virtual machine MTU to 1500.

## Impact of 1440-Byte MTU on Virtual Machine Applications

Currently, for the vast majority of applications, MTU settings are transparent and have no impact. Except for the following applications:

### Docker

From user feedback, when virtual machine MTU is 1440, applications running in Docker will be affected.

For regular Docker applications, you need to modify /etc/docker/daemon.json and add the following configuration:

```json
{
  "mtu": 1440
}
```

After modification, restart Docker containers.

Note: The cloud platform automatically injects this configuration by default.

### Docker Compose

The above modification will only set the MTU of Docker's default bridge docker0. For applications using Docker Compose, Docker Compose will create a bridge for each application. You need to add the following configuration in each Docker Compose configuration file docker-compose.yml so that the MTU of each bridge added by Docker Compose is also correctly set:

```yaml
...
networks: 
  default:
    driver: bridge
    driver_opts:
      com.docker.network.driver.mtu: 1440
```
After modification, you need to rebuild the Docker Compose application so that the bridge corresponding to this application has MTU set to 1440.

For details, please refer to this article: https://mlohr.com/docker-mtu/

## Set Virtual Machine MTU

The following introduces how to set platform parameters so that virtual machines can use custom MTU values, for example, using 1500-byte MTU.

### Control Node Configuration

The cloud platform defines a global configuration ovn_underlay_mtu for setting the MTU of the physical network underlying the cloud platform that carries VPC traffic. This value defaults to 1500. You need to modify this value to Virtual Machine MTU + VPC_OVN_ENCAP_COST. For example, if virtual machine MTU is 1500, then ovn_underlay_mtu = 1560.

You need to modify the ovn_underlay_mtu parameter in the configuration files of the following services:

1. Modify region service's ovn_underlay_mtu

```bash
climc service-config-edit region2
```

After modification, no service restart is needed, it takes effect immediately.

2. Modify vpcagent service's ovn_underlay_mtu

```bash
kubectl -n onecloud edit configmaps default-vpcagent
```

After modification, you need to restart the vpcagent service.

```bash
kubectl -n onecloud rollout restart deployments default-vpcagent
```

### Compute Node Settings

1. Modify Network Card MTU

First, you need to set the MTU value of the compute node's physical network card corresponding to ovn_encap_ip to ovn_underlay_mtu.

```bash
ip link set eth0 mtu 1560 
```

Here eth0 is the physical network card name.

If this physical network card has joined an Openvswitch bridge, you also need to execute the following command to set the ovs bridge's MTU to be consistent with the physical network card:

```bash
ovs-vsctl set int br0 mtu_request=1560
```

Here br0 is the ovs bridge that eth0 has joined.

At the same time, you need to persist this MTU value so that it takes effect automatically when the server restarts next time.

On CentOS systems, the persistence method is:

Modify /etc/sysconfig/network-scripts/ifcfg-eth0, add MTU=1560 configuration.

The above modifications need to be performed for each compute node.

2. Modify sdnagent service's ovn_underlay_mtu

You need to modify each compute node's configuration file /etc/yunion/host.conf. Set ovn_underlay_mtu.

3. Restart to Take Effect

After the above modifications are complete, you need to restart the default-host container to take effect.

```bash
kubectl -n onecloud rollout restart daemonsets default-host
```

### EIP Gateway Settings

If the EIP gateway reuses compute nodes, no configuration is needed. If the EIP gateway is independently deployed, you also need to set the ovn_underlay_mtu setting in the eip gateway's sdnagent configuration file (/etc/yunion/sdnagent.conf).

After modification is complete, you need to restart the yunion-sdnagent-eipgw service.

