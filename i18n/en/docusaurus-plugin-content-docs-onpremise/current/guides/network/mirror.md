---
sidebar_position: 9
---

# Traffic Mirroring

Introduction to traffic mirroring concepts and operations.

This section introduces the concepts and operations of traffic mirroring. Traffic mirroring is used to capture network traffic from any virtual machine and send it to a specified virtual machine's virtual network card or physical machine's physical network card, regardless of which host the virtual machine is on, which VPC it is in, and the virtual machine's operating system. Third-party traffic capture software can be used to obtain traffic from this virtual or physical network card for traffic analysis, traffic replay testing, etc.

## Functional Components

Traffic mirroring function includes two resources:

* Mirror destination (tap_service): Used to define the virtual network card that collects traffic. If the mirror destination is a virtual machine, the platform will add a virtual network card to this virtual machine specifically for traffic collection. If the mirror destination is a physical machine, you need to specify the mac address of the physical network card that collects traffic. The platform will add this physical network card to the bridge and output the collected traffic to this physical network card. (In scenarios where the mirror destination is a physical machine, this physical network card must be an unused physical network card.)

* Mirror source (tap_flow): Used to define the source of traffic. The source of traffic can be a specified network card of a specified virtual machine. It can also be all or part of the traffic of a virtual switch on a specified host (specified through layer 2 network).

## Working Principle

Each host has a virtual bridge brtap dedicated to traffic mirroring collection.

If a virtual machine is used as a mirror destination, the virtual machine adds a virtual network card, and this network card automatically joins the host's brtap where it is located. If this host is used as a mirror destination, the host's network card used for traffic collection automatically joins the host's bridge brtap.

If the mirror source and mirror destination are on the same host, traffic from the source virtual machine will be sent to brtap through patch port. If the mirror source and mirror destination are not on the same host, traffic will be sent to the mirror destination host's brtap through GRE tunnel.

sdnagent on the host is responsible for configuring brtap's flow table, sending traffic belonging to the mirror destination's mirror source to the mirror destination's network port.

## Operation Methods

### Create Mirror Destination

1. Create virtual machine mirror destination

```bash
climc tap-service-create --type guest --target-id <id_of_guest> <name_of_tap_service>
```

2. Create physical machine mirror destination

```bash
climc tap-service-create --type host --target-id <id_of_host> --mac-addr <mac_addr> <name_of_tap_service>
```

### Create Mirror Source

1. Create virtual machine network card mirror source

```bash
climc tap-flow-create --guest-id <guest_id> --mac-addr <mac_addr> --ip-addr <ip_addr> --direction <IN|OUT|BOTH> --tap-id <tap_service_id> --type vnic <name_of_tap_flow>
```

2. Create virtual switch mirror source

```bash
climc tap-flow-create --host-id <host_id> --wire-id <wire_id> --vlan-id <vlan_id> --direction <IN|OUT|BOTH> --tap-id <tap_service_id> --type vswitch <name_of_tap_flow>
```

### Enable Mirror Destination and Source

1. Mirror destination is disabled by default after creation and needs to be manually enabled

```bash
climc tap-service-enable <tap_service_id>
climc tap-service-disable <tap_service_id>
```

2. Mirror source is enabled by default after creation

```bash
climc tap-flow-disable <tap_flow_id>
climc tap-flow-enable <tap_flow_id>
```

