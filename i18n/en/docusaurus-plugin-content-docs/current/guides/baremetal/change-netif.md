---
sidebar_position: 4
---

# Replace Physical Machine Network Card

The cloud platform records physical machine network card information. If the physical machine's network card is replaced in the actual environment, you need to manually keep the physical machine's network card information in the platform consistent with the actual environment.

## Delete Physical Machine Network Card

Assuming you need to remove the network card with MAC 52:54:00:12:34:56 on physical machine bm1, the corresponding operation is as follows:

```bash
$ climc host-remove-netif bm1 52:54:00:12:34:56
```

## Add New Network Card

After manually adding a network card to a physical machine, there are two ways to synchronize the information in the platform. One is to let the physical machine PXE boot once, and the platform's corresponding hardware information will be updated. This method is suitable for situations where the physical machine has no operating system installed or the operating system has been deleted.

Another way is to use the command `host-add-netif` to add a network card to the physical machine:

```bash
# Add an admin type network card to physical machine bm2, layer 2 network is bcast0, MAC address is 52:54:00:12:34:56, manually configure IP address as 10.10.10.10
# Network card order is the first one (0)
$ climc host-add-netif --ip-addr 10.10.10.10 --type admin bm2 bcast0 52:54:00:12:34:56 0
```

View physical machine network cards:

```bash
$ climc host-network-list --details --host bm2
+--------------------------------------+------+--------------------------------------+------------+--------------+-------------------+----------+
|             Baremetal_ID             | Host |              Network_ID              |  Network   |   IP_addr    |     Mac_addr      | Nic_Type |
+--------------------------------------+------+--------------------------------------+------------+--------------+-------------------+----------+
| 610a7133-a2f6-4e52-8b12-2067296863a4 | bm2  | 14f56d88-0a70-404f-872e-56949bf0e488 | pxe-net    | 10.10.10.10  | 52:54:00:12:34:56 | admin    |
| 610a7133-a2f6-4e52-8b12-2067296863a4 | bm2  | 14f56d88-0a70-404f-872e-56949bf0e488 | ipmi-net   | 10.0.2.3     | 30:4e:05:26:22:43 | ipmi     |
+--------------------------------------+------+--------------------------------------+------------+--------------+-------------------+----------+
```

