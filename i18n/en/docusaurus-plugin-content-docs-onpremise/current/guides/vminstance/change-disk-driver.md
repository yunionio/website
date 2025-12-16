---
sidebar_position: 7
---

# Change Disk Driver

Introduction to how to change virtual machine disk drivers.

## Introduction

By default, virtual machine disk drivers are scsi. With this driver, disks seen inside Linux virtual machines are block devices starting with '/dev/sd'. You can set disk drivers through some commands. For example, Windows virtual machines can only use ide driver mode to start when virtio drivers are not installed.

## View Virtual Machine Disk Driver

First, view all disk drivers of the virtual machine through the server-disk-list command. For example, the virtual machine name is vm1.

```bash
# server-disk-list command views the relationship between virtual machines and associated disks
#   --details: Display detailed information
#   --server: Specify corresponding virtual machine name or ID
#   --scope system: Means display all resources in the system
$ climc server-disk-list --details --server vm1 --scope system
+--------------------------------------+-------+--------------------------------------+-------------------------------+-----------+--------+------------+-------+--------+-----------+--------------+
|               Guest_ID               | Guest |               Disk_ID                |             Disk              | Disk_size | Driver | Cache_mode | Index | Status | Disk_type | Storage_type |
+--------------------------------------+-------+--------------------------------------+-------------------------------+-----------+--------+------------+-------+--------+-----------+--------------+
| 84090287-9dc5-4d6b-854d-24f99ad6f170 | vm1   | 968d9285-6353-4bce-8a6f-bf540efad3f5 | data-disk                     | 10240     | scsi   | none       | 1     | ready  | data      | local        |
| 84090287-9dc5-4d6b-854d-24f99ad6f170 | vm1   | 5448ea7d-5c64-47a2-847d-06060e187a47 | vdisk-vm1-1624970026002516731 | 30720     | scsi   | none       | 0     | ready  | sys       | local        |
+--------------------------------------+-------+--------------------------------------+-------------------------------+-----------+--------+------------+-------+--------+-----------+--------------+
```

Index 0 means the first disk of the virtual machine, corresponding to '/dev/sda' in Linux systems. Driver means the corresponding driver is scsi, Disk_type sys means system disk.

Index 1 means the second disk, corresponding to '/dev/sdb' in Linux systems, driver is also scsi, Disk_type data means data disk.

## Change Driver

Update disk drivers on virtual machines through the server-disk-update command.

First, look at the help information for the server-disk-update command.

```bash
$ climc server-disk-update --help
Usage: climc server-disk-update [--cache {writethrough,none,writeback}] [--aio {native,threads}] [--index INDEX] [--driver {virtio,ide,scsi,pvscsi}] <SERVER> <DISK>

Update details of a virtual disk of a virtual server

Positional arguments:
    <SERVER>
        ID or Name of server
    <DISK>
        ID or Name of Disk

Optional arguments:
    # Corresponds to qemu/kvm virtual machine disk cache mode
    [--cache {writethrough,none,writeback}]
        Cache mode of vDisk
    # Corresponds to qemu/kvm virtual machine disk's aio
    [--aio {native,threads}]
        Asynchronous IO mode of vDisk
    # Disk index order
    [--index INDEX]
        Index of vDisk
    # Corresponds to qemu/kvm virtual machine disk driver
    [--driver {virtio,ide,scsi,pvscsi}]
        Driver of vDisk
```

From the help information, you can see supported drivers are virtio, ide, scsi or pvscsi. Please select according to your needs.

```bash
# Change virtual machine vm1's system disk 5448ea7d-5c64-47a2-847d-06060e187a47 driver to virtio
$ climc server-disk-update --driver virtio vm1 5448ea7d-5c64-47a2-847d-06060e187a47

# View record, found it has been changed to virtio
$ climc server-disk-list --details --server vm1 --scope system | grep 5448ea7d-5c64-47a2-847d-06060e187a47
| 84090287-9dc5-4d6b-854d-24f99ad6f170 | vm1   | 5448ea7d-5c64-47a2-847d-06060e187a47 | vdisk-vm1-1624970026002516731 | 30720     | virtio | none       | 0     | ready  | sys       | local        |
```

After changing the disk driver, you need to restart the virtual machine for it to take effect. Use server-stop and server-start commands to restart virtual machine vm1.

```bash
# Stop virtual machine
$ climc server-stop vm1

# Call server-list to view virtual machine status, wait until status becomes ready
$ climc server-list --search vm1 --scope system
+--------------------------------------+------+--------------+---------+------------+-----------+-----------+-----------------------------+------------+---------+-----------+
|                  ID                  | Name | Billing_type | Status  | vcpu_count | vmem_size | Secgrp_id |         Created_at          | Hypervisor | os_type | is_system |
+--------------------------------------+------+--------------+---------+------------+-----------+-----------+-----------------------------+------------+---------+-----------+
| 84090287-9dc5-4d6b-854d-24f99ad6f170 | vm1  | postpaid     | ready   | 1          | 1024      | default   | 2021-06-29T12:33:45.000000Z | kvm        | Linux   | false     |
+--------------------------------------+------+--------------+---------+------------+-----------+-----------+-----------------------------+------------+---------+-----------+

# Start virtual machine
$ climc server-start vm1

# Then repeat viewing virtual machine status until it becomes running
```

Then log in to the virtual machine through frontend vnc or ssh, and use disk tools like lsblk to view disks. You will find that disk block device names inside have changed from '/dev/sda' to '/dev/vda'.

```bash
[cloudroot@vm1 ~]$ lsblk 
NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sr0     11:0    1 1024M  0 rom  
vda    253:0    0   30G  0 disk 
├─vda1 253:1    0    1M  0 part 
├─vda2 253:2    0  512M  0 part /boot
└─vda3 253:3    0 29.5G  0 part /
```

