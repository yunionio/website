---
sidebar_position: 3
---

# Compute Node Host Service Troubleshooting

Host service may fail to start for various reasons. The symptom is that after the Host service restarts, in the cloud platform host list, the host status remains offline.

This article introduces general troubleshooting ideas.

## Host Service Corresponding Container Pod Introduction

First, we need to understand the Pod corresponding to the Host service.

Host service is defined by Daemonset default-host in k8s onecloud namespace. A container named default-host-xxxxx runs on each node, where xxxxx is a random string.

default-host pod has three containers:

| Container Name       | Function                                                                           |
| -------------- | ------------------------------------------------------------------------------ |
| host           | Host service's main service process, implements communication with controller, controls qemu virtual machine processes, manages storage and network   |
| ovn-controller | ovn control process on each node, synchronizes node configuration information from database maintained by ovn-northd, and issues it to ovs |
| sdnagent       | Implements security groups and flow control for classic networks, assists ovn-controller to implement VPC network functionality for VPC networks           |

## Locate Host's host Container

Find the Host container running on the specified host through the following command

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

| Pod                         | Description                                                                |
| --------------------------- | ------------------------------------------------------------------- |
| default-host-xxxxx          | DaemonSet default-host's pod                                        |
| default-host-deployer-xxxxx | DaemonSet default-host-deployer's pod, implements virtual machine disk initialization and identification |
| default-host-image-xxxxx    | DaemonSet default-host-image's pod, implements local virtual machine disk reading        |
| default-telegraf-xxxxx      | DaemonSet default-telegraf's pod, implements host monitoring data collection          |

## Restart Host Service

Sometimes, restarting can solve the problem. Restarting the host service only requires deleting the corresponding pod. k8s will immediately rebuild the corresponding pod, achieving host service restart.

```bash
kubectl -n onecloud delete pods default-host-xxxxx
```

## View Host Service Logs

Use the following command to view Host service logs. Since the host pod has three containers, you need to use the -c parameter to specify the container (-c host).

```bash
# View all logs of this host service startup
$ kubectl -n onecloud logs default-host-xxxxx -c host

# View host container logs starting from the past 10 minutes (--since 10m), and do not exit (-f), continuously output logs to console
$ kubectl -n onecloud logs default-host-xxxxx -c host --since 10m -f
```

Host service will perform the following checks when starting:

* Set and optimize kernel parameters, such as io scheduler parameters
* Check key software, such as qemu, kernel nbd module, openvswitch, etc.
* Initialize and configure network
* Initialize and configure storage
* ...

Errors may occur at each step. At this time, you can locate the cause by viewing the output logs.

## Common Issues

### After host installation and Host service completion, it is disabled by default and needs to be enabled before use. Host enable method is as follows:

- Enable this host in the cloud management platform's host list;

- Use climc command on the control node to enable this host;

    ```bash
    $ climc host-enable id
    ```

### Why does Host service become offline?

region's HostPingDetectionTask sets host services that have not received ping for more than 3 minutes to offline, and sets virtual machine status on the host to unknown.

### Host's Host service fails to start and reports error "Fail to get network info：no networks". How to solve it?

This problem is generally that no IP subnet has been registered for the host network card's IP address. The cloud platform judges the host's connected layer 2 network information based on this information. To solve this problem, you need to create an IP subnet containing the host IP address for the host in the cloud management platform, or use the climc command to create a network on the control node.

```bash
$ climc network-create bcast0 host02  10.168.222.226  10.168.222.226 24 --gateway 10.168.222.1
```
### Host MAC change will cause Host service to go offline. You need to change the host's registered MAC address in the platform. Specific steps are as follows

- For example, host IP address is 100.91.1.22, its MAC changed from 18:9b:a5:81:4f:17 to 18:9b:a5:81:4f:16

    ```bash
    # 092231af-eebc-456f-8a21-3ab7c944f20c is the host id, 97e29a73-6615-4d5b-8b67-96bb13b80b90 is the id of the layer 2 network where the host is located
    $ climc host-remove-netif 092231af-eebc-456f-8a21-3ab7c944f20c 18:9b:a5:81:4f:17
    $ climc host-add-netif --ip 100.91.1.22 092231af-eebc-456f-8a21-3ab7c944f20c 97e29a73-6615-4d5b-8b67-96bb13b80b90 18:9b:a5:81:4f:16 0
    ```

### Host network card initially did not do bonding. After doing bonding, how to change configuration without restarting the host?

Assuming initially the host used physical network card eth0 as the management network card to connect to the cloud platform, its IP address is 192.168.201.20. The corresponding /etc/yunion/host.conf configuration is:

```yaml
networks:
- eth0/br0/192.168.201.20
```

After cloud platform deployment is complete, the administrator binds eth0 and eth1 to set bond0, IP address is still 192.168.201.20, then you need to modify /etc/yunion/host.conf configuration to:

```yaml
networks:
- bond0/br0/192.168.201.20
```

Since openvswitch will remember configuration in ovsdb, at this time, bridge br0 has already added eth0. If no configuration is done, br0 will still add eth0 to the bridge. Therefore, you need to manually remove eth0 from br0:

```bash
ovs-vsctl del-port br0 eth0
```

At this time, to make the configuration take effect, the simpler method is to restart the host.

If the host is not convenient to restart, you need to manually execute the following operations:

1. Bring up bond0

First ensure bond0's configuration (/etc/sysconfig/network-scripts/ifcfg-bond0,ifcfg-eth0,ifcfg-eth1) has been correctly configured. Restart network:

```bash
systemctl restart network
```

2. Clear IP address on bond0

After restarting network, IP address is configured on bond0, and br0 also has the same IP address. Then you need to clear bond0's IP:

```bash
ifconfig bond0 0
```

3. Remove eth0 from br0 and add bond0 to br0

```bash
ovs-vsctl del-port br0 eth0
ovs-vsctl add-port br0 bond0
```

### Storage medium identification is inaccurate, for example, mechanical disk is identified as solid state

For example, when users use SSD for lvmcache, etc., it may cause host local storage medium identification to be inaccurate. You can go to the corresponding host -> storage -> corresponding storage medium to modify attributes, select medium type to modify.

### Disable dhcp service

If you see such a prompt: `dhcp: dhcp client is enabled before host agent start, please disable it.`

It means your machine has enabled dhcp client before.

How to disable dhcp client:
```bash
# Generally, centos7's dhcp client is started by NetworkManager
$ systemctl disable NetworkManager --now

# We will check whether there is a dhclient pid file under /var/run/dhclient-<nic>.pid to decide whether to output warning
# So you also need to clear the dhclient-<nic>.pid file under /var/run, nic needs to be replaced with your own network card name, such as eth0
$ rm -f /var/run/dhclient-<nic>.pid
```


