---
sidebar_position: 2
---

# Import VMware Virtual Machine

Importing VMware virtual machines is also called "V2V" migration. This function is used to migrate managed VMware hosts to built-in Cloudpods private cloud.

:::tip
- VMware hosts need to be in shutdown state.
- Network between Cloudpods built-in private cloud hosts and VMware ESXi hosts needs to be mutually accessible.
- Classic network IP subnets that VMware hosts connect to also need to be able to be allocated to virtual machines for use in Cloudpods private cloud.
- Create virtual machines with the same configuration as VMware hosts on Cloudpods platform, and unload VMware hosts' virtual network cards, mount them to newly created Cloudpods virtual machines, create virtual disks, and use VMware hosts' disks as backing files for KVM virtual machine disks. Start Cloudpods virtual machines, remotely mount VMware hosts' disks as backing files for Cloudpods virtual machine disks. After successful startup, Cloudpods virtual machine disk content is VMware virtual machine disk, network IP is VMware host's IP. At the same time, set VMware hosts to Freeze state, prohibit VMware hosts from starting. After startup, begin disk data synchronization, will synchronize Cloudpods virtual disk's underlying VMware virtual machine disk data to Cloudpods virtual machine's upper layer disk file. After disk data synchronization is complete, Cloudpods virtual machines no longer depend on VMware virtual machines.
- After disk data synchronization is complete, you can delete the original VMware virtual machine to complete migration.
- If migration fails, you need to delete Cloudpods virtual machine (need to ensure cleanup in recycle bin). After deletion, virtual network cards will be automatically mounted back to VMware virtual machines, and VMware host Freeze state will be released.
:::

## Web Console Operations

### Single Virtual Machine V2V Migration

1. On the virtual machine page, click the **_"More"_** button in the operation column on the right side of the virtual machine, select the **_"High Availability-V2V Migration"_** menu item from the dropdown menu to pop up the V2V migration dialog.
2. Migration type defaults to migrate to KVM platform. Select host, click the **_"OK"_** button to migrate VMware host to built-in private cloud host.

### Batch V2V Migration

You can select virtual machines on different hosts to V2V migrate to the same host.

1. Select one or more virtual machines in the virtual machine list, click the **_"Batch Operations"_** button above the list, select the **_"High Availability-V2V Migration"_** menu item from the dropdown menu to pop up the V2V migration dialog.
2. Migration type defaults to migrate to KVM platform. Select host, click the **_"OK"_** button to migrate VMware hosts to built-in private cloud hosts.

