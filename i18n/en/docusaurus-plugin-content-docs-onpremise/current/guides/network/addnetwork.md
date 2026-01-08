---
sidebar_position: 6
---

# Add Host Network

:::tip
Applicable when the deployment environment uses gigabit networks, and later extended environment deploys 10-gigabit network bonding, etc.
:::

The following introduces how to add this 10-gigabit network to the platform.

## Create 10-Gigabit Layer 2 Network

1. On the Network-Layer 2 Network page, click the **_"New"_** button above the list to pop up the new dialog.
2. Set the following information:
   - Specify domain: Select the domain to which the layer 2 network belongs.
   - VPC: Select local region and local VPC.
   - Availability zone: Select the availability zone to which the layer 2 network belongs.
   - Name: Set the layer 2 network name, for example wire10g.
   - Bandwidth: Set the network bandwidth supported by the layer 2 network, including 100M, 1G, 2x1G, 10G, 2x10G, 25G, 40G, 100G. Layer 2 network bandwidth is mainly for statistics on network utilization to determine virtual machine network load conditions.
3. Click the **_"OK"_** button.

## Modify Host Configuration

By default, hosts correspond to layer 2 networks by network card, so you need to configure the correspondence between network cards and layer 2 networks on the host.

```bash
# Operate on the host
$ vi /etc/yunion/host.conf
# Add under networks
networks:
- eth0/br0/192.168.1.1
- bond1/br1/wire10g
```

After configuration is complete, you need to restart the host service.

```bash
# Find the host service corresponding to this host
$ kubectl get pods -n onecloud -o wide |grep host
# If pod name is default-host-zgrkg
$ kubectl delete pods -n onecloud default-host-zgrkg
```

## Create IP Subnet

Create an IP subnet under the layer 2 network wire10g created above. When creating virtual machines later using these IP subnets, they will automatically access the 10-gigabit network.


