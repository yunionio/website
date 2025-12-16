---
sidebar_position: 11
---

# IP Reservation

Introduction to IP address reservation functionality.

## IP Reservation Pool

The platform maintains an IP reservation pool, placing IPs that are not allocated by the platform but are used by other systems into the IP reservation pool to prevent IPs from being allocated to virtual machines or other resources managed by the platform.

### IP Address Occupancy Detection

The platform performs a global ping detection every 6 hours, pinging all classic network IP addresses. It marks IPs that are not maintained by the platform but respond to ping as reserved IPs to prevent them from being allocated by the platform and avoid IP conflicts. If an IP is detected online and reserved, it will not be automatically released. Users need to manually release it.

When creating a host, if you confirm that this IP is not being used and may be placed in reserved IPs, you can add a reserved: true parameter in the created network parameters. This way, even if the IP is reserved, it will be automatically released from the reserved IP pool for allocation.

## Using Reserved IPs

### Reserve IP

Reserve specified IP addresses in a specified network, and can reserve automatically released reserved IPs, that is, reserve the IP first, and automatically release this reserved IP after a specified time.

```bash
climc network-reserve-ip [--duration DURATION] <NETWORK> <NOTES> <IPS> ...
```

### View Reserved IPs

```bash
climc reserved-ip-list [--network NETID]
```

### Release Reserved IP

```bash
climc network-release-reserved-ip <NETWORK> <IP>
```

