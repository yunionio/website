---
sidebar_position: 3
---

# Local LVM Storage

Introduction to how to configure and use local LVM storage.

## What is LVM

LVM (Logical Volume Manager) is a logical volume manager that can abstract one or more physical storage devices into one or more logical volumes, and allocate logical volumes to file systems and other applications for use.


## How to Add LVM Storage

1. Modify /etc/yunion/host.conf, add new VG to the string array of lvm_volume_groups:

```yaml
lvm_volume_groups:
- storage1 # vgname
```

Of course, you need to ensure this VG exists in advance

```
$ vgs
  VG                                        #PV #LV #SN Attr   VSize    VFree
  storage1                                    1   1   0 wz--n- <200.00g <170.00g
```

2. Restart host service

After the host service restarts, wait a moment, view the host's storage list, and you can see this new storage has been registered.

```bash
climc storage-list --host <host_id>
```

eg:
```
climc storage-list --host 12880086-034d-46b0-89ca-6d4f51d2de6a
+--------------------------------------+--------------------------------------+----------+----------------------+--------+--------------+-------------+---------+--------------+
|                  ID                  |                 Name                 | Capacity | Actual_capacity_used | Status | Storage_type | Medium_type | Enabled | public_scope |
+--------------------------------------+--------------------------------------+----------+----------------------+--------+--------------+-------------+---------+--------------+
| 86259ab3-cf7b-4f19-8fd6-0c49094638aa | host_192.168.222.102_lvm_storage_0   | 204796   | 0                    | online | lvm          | rotate      | true    | none         |
+--------------------------------------+--------------------------------------+----------+----------------------+--------+--------------+-------------+---------+--------------+
```

## How to Create a VG

The following is a brief process:
```bash
# For example: /dev/sdb is a disk that can be used for virtual machines. First create PV.
pvcreate /dev/sdb
# storage1 is the VG we created.
vgcreate storage1 /dev/sdb
```

## How to Delete LVM Storage

Similar to steps for deleting local storage:

1. Need to ensure all virtual disks are deleted, especially need to pay attention to pseudo-deleted disks, and disks marked as system resources:

```bash
# View all disks, including all disks under the project where the command user is located, and disks marked as system resources
climc disk-list --storage <storage_id> --scope system --system
# View all undeleted disks
climc disk-list --storage <storage_id> --scope system --system --pending-delete
```

2. Detach storage and host association:

```bash
climc host-storage-detach <host_id> <storage_id>
```

3. Delete storage

```bash
climc storage-delete <storage_id>
```

4. Go to the host, modify /etc/yunion/host.conf, remove the storage path from lvm_volume_groups

5. Restart host service


