---
sidebar_position: 3
---

# Create Bare Metal

Introduction to how to install an operating system on existing physical machines in the platform and create bare metal.

:::tip
Before creating bare metal, you need to ensure that the registered physical machine status becomes "Running", which indicates that physical machine hardware information detection is complete and can be used to install an operating system.
:::

## Create Through Frontend

Currently, the platform frontend supports creating bare metal through two entry points.

- Installing an operating system on the physical machine page can create bare metal based on the current physical machine.
- Creating new bare metal on the bare metal page, and filtering corresponding physical machines through specifications to create bare metal.

## Create Through Command Line

```bash
climc server-create \
    --hypervisor baremetal \ # Specify server type as baremetal
    --ncpu 24 \ # Create on physical machine with 24 core cpu
    --mem-spec 64g \ # Create on physical machine with 64g memory size
    --net 'bms-net' \ # Create under bms-net network
    --raid-config 'raid1:2:MegaRaid' \ # 1st disk, use two physical disks (0-1) on MegaRaid controller to make raid1
    --raid-config 'none:1' \ # 2nd disk, use physical disk (2) on MegaRaid controller, no raid
    --raid-config 'raid10:4:MegaRaid' \ # 3rd disk, use four physical disks (3-6) on MegaRaid controller to make raid10
    --disk CentOS-7.5.qcow2:100g \ # System disk uses CentOS-7.5.qcow2 image as operating system, size is 100g, uses 1st raid1 disk
    --disk 'autoextend:ext4:/opt' \ # Partition mounted to /opt, uses 1st raid1 disk, file system is ext4, size is (1st disk total size - other partition sizes on this disk (100g))
    --disk 'autoextend:xfs:/data-nonraid' \ # Partition mounted to /data-nonraid, uses 2nd disk without raid, file system is xfs, uses all space
    --disk 'autoextend:ext4:/data-raid10' \ # Partition mounted to /data-raid10, uses 3rd raid10 disk, file system is ext4, uses all space
    <server_name> # Bare metal server name

# Alternatively, you can create on a specified physical machine through parameter `--prefer-host $baremetal-hostname`
```

#### RAID Configuration and Partitioning

When calling the server-create interface, configure RAID by passing parameters through '--raid-config'. Each raid-config corresponds to a disk device visible to the operating system (/dev/sdx).

The '--disk' parameter corresponds to partitions on different disks. The logic of partitions corresponding to disks is: partitions are created on the 1st disk in order. When the disk setting has the autoextend parameter, it means the next disk partition will be created on the next disk, and so on.

- RAID configuration API parameters:

| Key                          | Type   | value                                           | Explanation                                 |
|------------------------------|--------|-------------------------------------------------|--------------------------------------|
| type (Disk Type)               | string | rotate (Mechanical Disk), ssd (Solid State Disk), hybrid (Unknown)       | -                                    |
| conf (raid)                  | string | none, raid0, raid1, raid5, raid10               | Make raid level or no raid                     |
| count (Disk Count)             | int    | e.g. 0, 2, 4                                    | Less than or equal to actual disk count on physical machine             |
| range (Disk Range)             | []int  | e.g. [0,1,2,3], [4,7], [5,6]                    | Physical disk index number on controller           |
| splits (Split Physical Disk)          | string | (30%,20%,), (300g,100g,)                        | Split physical disks that have made raid into multiple physical disks |
| adapter (Controller Number)           | int    | 0, 1                                            | Corresponding driver's Adapter controller          |
| driver  (Controller Name)         | string | MegaRaid,HPSARaid,Mpt2SAS,MarvelRaid,Linux,PCIE | Used to select disks when there are multiple controllers on one physical machine  |
| strip  (Set RAID Strip Size) | *int   | e.g. 64*1024                                    | Set strip size, optional                 |
| ra                           | *bool  |                                                 | Set read mode                           |
| wt                           |        |                                                 | Set write mode                           |
| cachedbadbbu                 | *bool  |                                                 |                                      |
| direct                       | *bool  |                                                 |                                      |

- Command line format:

    '(none,raid0,raid1,raid5,raid10):%d:(MegaRaid|HPSARaid|Mpt2SAS|MarvelRaid|Linux|PCIE):(rotate|ssd|hybrid):[0-n]:strip%dk:adapter%d:ra:nora:wt:wb:direct:cachedbadbbu:nocachedbadbbu'

