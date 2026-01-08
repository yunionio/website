---
sidebar_position: 2
---

# Migrate VMware to Built-in Private Cloud

Migrate managed VMware hosts to built-in private cloud.

## Migrate Managed VMware Hosts to KVM Private Cloud

The cloud platform supports migrating managed VMware hosts to built-in KVM private cloud hosts. The working principle is:

1. Prerequisites

* Classic network IP subnets connected to VMware hosts can also be allocated to virtual machines in KVM private cloud
* Network between KVM built-in private cloud hosts and VMware ESXi hosts can access each other
* VMware hosts are in powered-off state

2. Migration Method

Migrate through climc command, execute

```bash
climc server-convert-to-kvm <sid>
```

Where \<sid\> is the name or ID of the managed VMware host.

3. Migration Process

1) Create a virtual machine with the same configuration as the VMware host on the KVM platform, unload the VMware host's virtual NIC, mount it to the newly created KVM virtual machine, create a virtual disk, and use the VMware host's disk as the backing file for the KVM virtual machine's disk
2) Start the KVM virtual machine, remotely mount the VMware host's disk as the backing file for the KVM virtual machine's disk
3) After successful startup, the KVM virtual machine's disk content is the VMware virtual machine's disk, and the network IP is the VMware host's IP. At the same time, set the VMware host to Freeze state to prevent the VMware host from starting
4) After startup, disk data synchronization begins, which will synchronize the VMware virtual machine disk data underlying the KVM virtual disk to the upper-layer disk file of the KVM virtual machine. After disk data synchronization is complete, the KVM virtual machine no longer depends on the VMware virtual machine
5) After disk data synchronization is complete, you can delete the original VMware virtual machine to complete the migration

4. Migration Rollback

If migration fails, you need to delete the KVM virtual machine (ensure it is cleaned up in the recycle bin). After deletion, the virtual NIC will be automatically mounted back to the VMware virtual machine, and the VMware host's Freeze state will be lifted

