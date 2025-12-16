---
sidebar_position: 3
---

# Troubleshoot Pod Network Issues

Troubleshoot DNS resolution failure reasons within Pods.

If you encounter DNSError errors from services within Pods, for example:

```json
{"error":{"class": "DNSError", "code": 499, "details": "Post \"https://default-kevstone:30357/v3/auth/tokens\": dial tcp: lookup default-kevstone: i/o timeout"}}
```

This type of error generally means there is a problem with network communication between Pods. Because communication between Pods generally first needs to perform DNS resolution of the peer, and because the Pod network cannot reach coredns, DNS resolution fails, so the first error exposed is DNSError.

## Basic Principles

Pods perform domain name resolution through the cluster's coredns. CoreDNS is configured with service IP 10.96.0.10. When accessing coredns, kubeproxy first implements NAT conversion from service IP to Pod IP. If the Pod is on this node, it directly accesses the Pod. Otherwise, it sends through tunl0 via IP-in-IP or VXLAN tunnel to the node where the peer Pod is located, then decapsulates and delivers to the target Pod.

The platform uses IPVS on each node as NAT conversion from Service IP to Pod IP. Need to ensure the node's IPVS rule table has corresponding NAT rules for 10.96.0.10.

The platform uses calico as the container network plugin, using IP-in-IP or VXLAN tunnel as the encapsulation protocol for packets between Pods.

If using VXLAN tunnel, there is a vxlan.calico layer 2 virtual network interface on each node, which serves as the VXLAN tunnel endpoint for that node.

If using IP-in-IP tunnel, there is a tunl0 layer 3 virtual network interface on each node, which serves as the IP-in-IP tunnel endpoint for that node.

Pod IPs are randomly allocated from 10.40.0.0/16 (this network prefix can be configured during ocboot initialization). Each node will configure static routes through tunl0 with next hop as the Pod's node IP for /26 network segments (containing 64 IP addresses) where Pods of other nodes in the cluster are located. If routes corresponding to Pods are missing, Pod-to-Pod network connectivity will also fail.

### Calico Tunnel Protocol Switching

:::tip Note
Starting from v3.11.12, the platform's calico container network uses VXLAN tunnel protocol by default. The following switching steps only apply to v3.11.11 and earlier versions that use IP-in-IP by default.
:::

You can execute the following commands on the control node to switch Calico tunnel protocol to VXLAN. Common reasons for switching are that the underlying network does not support IP-in-IP protocol.

```bash
export DATASTORE_TYPE=kubernetes
calicoctl patch felixconfig default -p '{"spec":{"vxlanEnabled":true}}'
calicoctl patch ippool default-ipv4-ippool -p '{"spec":{"ipipMode":"Never", "vxlanMode":"Always"}}'   ## wait for the vxlan.calico interface to be created and traffic to be routed through it
calicoctl patch felixconfig default -p '{"spec":{"ipipEnabled":false}}'
```
If you need to adjust MTU, use the following command:

```bash
calicoctl patch felixconfig default -p '{"spec":{"ipipMtu":1430}}'
calicoctl patch felixconfig default -p '{"spec":{"vxlanMtu":1430}}'
```
You also need to modify the MTU of veth network interfaces. This configuration is in the calico-config configmap:

```bash
kubectl -n kube-system edit configmaps calico-config
```

Modify "veth_mtu" to the specified value (note this value is a string)
```yaml
...
     typha_service_name: none
     veth_mtu: "1430"
   kind: ConfigMap
   metadata:
...
```

## Cause Troubleshooting

### Service IP NAT Problem

On the node where DNS resolution fails, execute the following command to confirm there are corresponding entries in the IPVS forwarding table:

```bash
ipvsadm -Ln | grep -A 3 10.96.0.10
```

Normally there should be three entries:
```bash
TCP  10.96.0.10:53 rr
  -> 10.40.52.149:53              Masq    1      0          0
  -> 10.40.52.171:53              Masq    1      0          0
TCP  10.96.0.10:9153 rr
  -> 10.40.52.149:9153            Masq    1      0          0
  -> 10.40.52.171:9153            Masq    1      0          0
UDP  10.96.0.10:53 rr
  -> 10.40.52.149:53              Masq    1      0          6930
  -> 10.40.52.171:53              Masq    1      0          6859
```

### Routing Problem

If the previous step is confirmed correct, on the node where DNS resolution fails, check if the route to the coredns Pod IP exists. Assuming coredns node IPs are 10.40.52.149 and 10.40.52.171 as above, execute the following command to confirm if the corresponding route exists:

```bash
ip route | grep 10.40.52
```

Correct output is as follows:

```bash
10.40.52.128/26 via 10.41.1.21 dev tunl0 proto bird onlink
```

Here 10.41.1.21 should be the IP of the node where the coredns Pod is located

### Port Problem

If the previous step is confirmed correct, then Pod packets can correctly be sent through tunl0 via ip-in-ip tunnel. Need to confirm which port calico uses to send ip-in-ip packets.

Execute the following command to view calico-node configuration

```bash
kubectl -n kube-system edit daemonset calico-node
```

Note IP_AUTODETECTION_METHOD. If it is *can-reach=$ip*, then calico selects the interface that can access that ip to send ip-in-ip packets. Please confirm this interface is the correct interface. And the interface calico receives packets from the peer interface and the sending interface are consistent.

```yaml
    spec:
      containers:
      - env:
        - name: IP_AUTODETECTION_METHOD
          value: can-reach=10.61.1.254
```

The default cluster configuration's IP_AUTODETECTION_METHOD is *can-reach=$primary_master_ip*, for example, 10.61.1.254 in the above example should be the IP of the first K8s control node.

IP_AUTODETECTION_METHOD can also be configured to other values. You can refer to calico official documentation: [Configuring calico/node/Manifest](https://projectcalico.docs.tigera.io/reference/node/configuration#ip-autodetection-methods).

Common configurations can be set to: `IP_AUTODETECTION_METHOD=kubernetes-internal-ip`, which will use the K8s node's Status.Addresses as the port for ip-in-ip sending.


### Link Problem

If the previous step is confirmed correct, then need to confirm calico packets can be normally sent to the peer node. You can confirm by capturing packets with tcpdump on source and destination nodes.

If using IP-in-IP tunnel protocol, use the following command to capture packets:
```bash
# Format is
# tcpdump -i <if_of_calico_node> -nnn "ip proto 4" and host <ip_of_dst_node>

# For example, to capture ip-in-ip packets from compute node (IP: 10.130.0.13) on control node's br0, command is as follows:
$ tcpdump -i br0 -nnn ip proto 4 and host 10.130.0.13
# For example, to capture ip-in-ip packets from compute node (IP: 10.130.0.13) on control node's br0, and the upper layer virtual IP is 10.40.52.18 (0x0a283412), command is as follows:
$ tcpdump -i br0 -nnn 'ip proto 4 and host 10.130.0.13 and (ip[32:4]=0x0a283412 or ip[36:4]=0x0a283412)'
```

If using VXLAN tunnel protocol, use the following command to capture packets:
```bash
# Format is
# tcpdump -i <if_of_calico_node> -nnn udp and port 4789 and host <ip_of_dst_node>

# For example, to capture VXLAN packets from compute node (IP: 10.130.0.13) on control node's br0, command is as follows:
$ tcpdump -i br0 -nnn udp and port 4789 and host 10.130.0.13
```


## Common Failure Causes

### Node Routing Problem

Due to inconsistent node routing configuration, the port IPs used by nodes to send and receive ip-in-ip packets are inconsistent, causing both sides to be unable to communicate

### Kernel Problem

Specific kernels will drop ip-in-ip packets after enabling GSO. You can try to close network interface related features with the following command to see if it solves the problem:

```bash
# Assuming k8s nodes communicate through eth0 network interface
$ ethtool --offload eth0 rx off tx off 
$ ethtool -K eth0 gso off
```



