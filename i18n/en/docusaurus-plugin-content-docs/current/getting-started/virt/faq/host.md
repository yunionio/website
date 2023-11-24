---
sidebar_position: 1
---

# Troubleshooting Host Service Issues on Computing Nodes

The Host service may fail to start for various reasons, and the symptom is that after the Host service is restarted, the node's status remains offline in the cloud platform host list.

This article introduces the general approach to troubleshooting this issue.

## Introduction to the Pod Corresponding to the Host Service

Firstly, we need to understand the Pod corresponding to the Host service.

The Host service is defined by the Daemonset default-host in the onecloud namespace of K8s, and a container named default-host-xxxxx will run on each node, where xxxxx is a random string.

There are three containers in the default-host pod:

| Container Name | Description |
| --- | --- |
| host | The main service process of the Host service, which implements communication with the controller, controls the qemu virtual machine process, and manages storage and networking. |
| ovn-controller | The control process of ovn on each node, which synchronizes node configuration information from the database maintained by ovn-northd, and issues it to OVS. |
| sdnagent | Implements classic network security group and flow control, and assists ovn-controller in achieving VPC network functions. |

## Locating the Host Container on the Computing Node

Locate the Host container running on the specified computing node using the following command:

```bash
kubectl -n onecloud get pods -o wide | grep <ip_of_host>
```

For example:

```bash
# kubectl -n onecloud get pods -o wide | grep office-03-host01
default-host-xc2t5                                  3/3     Running            0          4h7m    192.168.222.3     office-03-host01           <none>           <none>
default-host-deployer-zv6tk                         1/1     Running            0          5d15h   10.40.33.249      office-03-host01           <none>           <none>
default-host-image-cql69                            1/1     Running            132        128d    192.168.222.3     office-03-host01           <none>           <none>
default-telegraf-q8fl9                              2/2     Running            40         128d    192.168.222.3     office-03-host01           <none>           <none>
```

The functions of these Pods are explained as follows:

| Pod                         | Description |
| --------------------------- | ------------------------------------------------------------------- |
| default-host-xxxxx          | The pod of DaemonSet default-host. |
| default-host-deployer-xxxxx | The pod of DaemonSet default-host-deployer, which initializes and identifies the virtual machine disk. || default-host-image-xxxxx    | Pod of the DaemonSet default-host-image, responsible for reading local virtual machine disks |
| default-telegraf-xxxxx      | Pod of the DaemonSet default-telegraf, responsible for collecting monitoring data from the host machine |

## Restarting the Host service

Sometimes restarting the service can solve problems. Restarting the host service only requires deleting the corresponding pod, and Kubernetes will immediately rebuild the corresponding pod to achieve the restart of the host service.

```bash
kubectl -n onecloud delete pods default-host-xxxxx
```

## Checking the Host service logs

Use the following command to view Host service logs. Since there are three containers in the host pod, the -c parameter needs to be used to specify the container (-c host).

```bash
# View all logs for host services enabled in this session
$ kubectl -n onecloud logs default-host-xxxxx -c host

# View logs for the host container from the past 10 minutes (--since 10m), do not exit (-f), and continuously display logs on the console
$ kubectl -n onecloud logs default-host-xxxxx -c host --since 10m -f
```

The Host service performs the following checks when starting:

* Setting and optimizing kernel parameters, such as io scheduler parameters
* Checking critical software, such as qemu, the kernel nbd module, openvswitch, etc.
* Initializing and configuring the network
* Initializing and configuring storage
* ...

Errors can occur at each step, and the output log can be viewed to identify the cause.

## Common problems

### After installing the Host service on the host machine, it is disabled by default and needs to be enabled before use. The method to enable the host machine is as follows:

- Enable the host machine in the host list of the cloud management platform.

- Use the climc command to enable the host machine on the control node.

    ```bash
    $ climc host-enable id
    ```

### Why does the Host service become offline?

The HostPingDetectionTask in the region will set the host service that has not received a ping for more than three minutes to offline and set the virtual machine status on the host machine to unknown.

### How to solve the problem of Host service startup failure on the host machine and a report error "Fail to get network info：no networks",?

This problem is generally caused by not registering an IP subnet for the IP address of the host machine's network card. The cloud platform judges the second-layer network information docked by the host machine based on this information. To solve this problem, you need to create an IP subnet that contains the host machine's IP address on the cloud management platform or use the climc command to create a network on the control node.

```bash
$ climc network-create bcast0 host02  10.168.222.226  10.168.222.226 24 --gateway 10.168.222.1
```
### Changing the MAC of the host machine will cause the Host service to go offline, how to change the MAC address registered with the platform for the host machine?

- For example, the IP address of the host machine is 100.91.1.22, and its MAC changes from 18: 9b: a5: 81: 4f:17 to 18: 9b: a5: 81: 4f:16

    ```bash
    # 092231af-eebc-456f-8a21-3ab7c944f20c is the host id, and 97e29a73-6615-4d5b-8b67-96bb13b80b90 is the id of the second-layer network where the host is located
    $ climc host-remove-netif 092231af-eebc-456f-8a21-3ab7c944f20c 18:9b:a5:81:4f:17
    $ climc host-add-netif --ip 100.91.1.22 092231af-eebc-456f-8a21-3ab7c944f20c 97e29a73-6615-4d5b-8b67-96bb13b80b90 18:9b:a5:81:4f:16 0
    ```

### The host machine's network card was not bonded at the beginning, and after bonding, how to change the configuration without restarting the host machine?

Assuming that the host machine uses the physical network card eth0 as the management network card to access the cloud platform, and its IP address is 192.168.201.20. Corresponding to /etc/yunion/host.conf, the configuration is:

```yaml
networks:
- eth0/br0/192.168.201.20
```

After the cloud platform is deployed, the administrator binds eth0 and eth1 and sets them as bond0. The IP address is still 192.168.201.20. In this case, the /etc/yunion/host.conf needs to be modified as follows:

```yaml
networks:
- bond0/br0/192.168.201.20
```- bond0/br0/192.168.201.20
```
Due to the fact that openvswitch remembers the configuration in ovsdb, at this point, the bridge br0 has already added eth0. If no configuration is made, br0 will still add eth0 to the bridge. Therefore, eth0 needs to be manually removed from br0:

```bash
ovs-vsctl del-port br0 eth0
```

At this point, in order for the configuration to take effect, a more convenient method is to restart the host.

If it is inconvenient to restart the host, the following steps need to be executed manually:

1. Start bond0

First, make sure that the configuration of bond0 (/etc/sysconfig/network-scripts/ifcfg-bond0, ifcfg-eth0, ifcfg-eth1) is correct. Restart the network:

```bash
systemctl restart network
```

2. Clear the IP address on bond0

After restarting the network, the IP address is configured on bond0, and the same IP address is also on br0. Therefore, the IP on bond0 needs to be cleared:

```bash
ifconfig bond0 0
```

3. Remove eth0 from br0 and add bond0 to br0

```bash
ovs-vsctl del-port br0 eth0
ovs-vsctl add-port br0 bond0
```

### Incorrect recognition of storage media, such as mechanical disks being recognized as solid state disks

For example, if a user uses an SSD as an lvmcache, it may cause incorrect recognition of the local storage media on the host. You can go to the corresponding host -> storage -> corresponding storage media to modify the properties and select the media type to modify it.