---
sidebar_position: 2
---

# Bare Metal Network

Currently, bare metal servers can only use classic networks.

## Classic Network

A bare metal server has multiple network cards. The system needs to detect which layer 2 network each network port of this bare metal is connected to, so that when allocating bare metal servers, it can select the correct IP subnet according to layer 2 network information.

The system detects which layer 2 network a bare metal's network card is connected to through two methods:

- Automatic detection: During the bare metal's prepare phase, the bare metal will automatically set each network card for dhcp detection. When the switch on the network where this network card is located has dhcp relay configured, it will forward the dhcp request to baremetal agent. Baremetal Agent finds the matching IP subnet according to the source IP of the dhcp packet, thus determining the layer 2 subnet to which this physical machine network card belongs.

- Manual setting: Through executing climc commands or in the frontend interface, you can set which layer 2 network each network card of the bare metal server corresponds to.

The corresponding climc command is:

```bash
$ climc host-add-netif <host_id> <wire_id> <mac> <index>
```

### Impact of Bare Metal Network Configuration on Scheduling

When users apply for a bare metal server and provide IP subnet information for the bare metal server to connect to, the scheduler will filter bare metal whose physical network ports are connected to the layer 2 network corresponding to this IP subnet as candidates.

If the network cards of the bare metal server applied by users need to do bonding, the scheduler will select physical machines that have two network cards at the same time, and both network cards are connected to the layer 2 network corresponding to the specified IP subnet.
If such physical machines do not exist, a scheduling failure error will be reported.


