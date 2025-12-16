---
sidebar_position: 7
---

# Virtual Machine Network Card Multi-Queue

The platform supports enabling multi-queue features for virtual machine virtual network cards.

## Qemu Command Line Parameters

```bash
-netdev type=tap,id=GUESTNET1-219,queues=4,ifname=GUESTNET1-219,vhost=on,vhostforce=off,script=if-up-br1-GUESTNET1-219.sh,downscript=if-down-br1-GUESTNET1-219.sh -device virtio-net-pci,mq=on,vectors=9,id=netdev-GUESTNET1-219,netdev=GUESTNET1-219,mac=00:22:02:a1:0f:da
```

Parameter settings:

* queues

queues is the number of queues, including receive and send packets. Generally, the number of queues is half the number of CPUs, with a maximum of 16 queues. For example, 8C has 4 queues, 16C has 8 queues, 32C and above have 16 queues. If you need better network performance, you can customize the number of queues, but the number is not the bigger the better, and it is related to the number of virtual machine CPUs.

* vectors

vectors is the number of interrupt vectors for this device, generally queues * 2 + 1. Each queue has two vectors, corresponding to receive and send packets respectively, plus the interrupt vector of the configuration space.

## Verification on Host

After setting virtual network card queues=4, on the host, you can see 4 vhost threads corresponding to this network card. These four threads are independent of VCPU threads and need to occupy host CPU. When the network is busy, CPU usage is high. Without CPU binding, it may cause interference to other virtual machines. If you need better network performance, you can allocate some CPUs for these threads to use.

## Verification in Virtual Machine

In the virtual machine, view the virtual network card's queue number through ethtool:

```
# ethtool -l eth0
Channel parameters for eth0:
Pre-set maximums:
RX:             0
TX:             0
Other:          0
Combined:       4
```

If it is necessary to configure the queue number

```bash
# ethtool -L eth0 combined 4
```

View the interrupt handling CPU of the network card device

```bash
# cat /proc/interrupts | grep virtio
```

Check whether the virtual machine image has the irqbalance service to distribute multi-queue interrupts to different CPUs:

```bash
systemctl status irqbalance
```

