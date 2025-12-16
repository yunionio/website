---
sidebar_position: 7
---

# Bare Metal Network Card Naming

## Why are physical machine network card names always named en0, en1, ...?

Traditional Linux network card naming rules name network cards sequentially as eth0, eth1, ... according to the kernel's order of detecting network cards. This naming method causes the problem that after adding/removing network card devices, the network card names change (for example, removing the eth0 network card, after restart, the network card originally named eth1 will become eth0). To make network card names independent of the kernel's order of detecting network cards, starting from systemd/udev v197, the Predictable-Network-Interface-Names mechanism was introduced, using network card firmware/topology/location information to name network cards, such as eno1, ens1, enp2s0, etc. For details, please refer to [https://www.freedesktop.org/wiki/Software/systemd/PredictableNetworkInterfaceNames/](https://www.freedesktop.org/wiki/Software/systemd/PredictableNetworkInterfaceNames/) .

Using the new mechanism avoids network card names not being persistent due to network card detection order, adding/removing network cards, etc., but it causes network card names to have no pattern to follow, and the cloud platform needs to be able to explicitly configure specified physical machine network card IP configuration when initializing bare metal.

Therefore, the platform names network cards sequentially as en0, en1, ... according to the PXE boot system's order of detecting network cards.

To achieve custom naming of network cards, the platform does the following:

1) Disable the Predictable-Network-Interface-Names mechanism. Need to modify /etc/default/grub, add "net.ifnames=0 biosdevnames=0" to kernel boot parameters

2) Modify /etc/udev/rules.d/70-persistent-net.rules, write network card mac and name mapping relationship once, udev will name network cards according to mac

```bash
KERNEL=="*", SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{address}=="00:22:a6:48:39:10", ATTR{type}=="1", NAME="en0"
KERNEL=="*", SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{address}=="00:22:a6:48:39:11", ATTR{type}=="1", NAME="en1"
```

## Notes After Physical Machine Network Card Replacement

If a physical machine replaces a network card, you first need to update the network card data of the corresponding physical machine in the platform at the same time. For specific operations, please refer to [Replace Network Card](./change-netif) .

At the same time, because the above custom network card naming mechanism is used, the mac of the newly added network card is not in the udev rules, and the naming of the new network card will not follow the enX naming pattern, causing the network card's IP configuration to not take effect. Therefore, you need to modify the udev naming rules using the following measures:

1) Manually modify /etc/udev/rules.d/70-persistent-net.rules

2) If the physical machine can be restarted, you can execute the following command to let the physical machine restart boot into the PXE boot system, initialize a series of configuration files, including udev configuration files:

```bash
$ climc server-deploy <baremetal_server_id>
```

