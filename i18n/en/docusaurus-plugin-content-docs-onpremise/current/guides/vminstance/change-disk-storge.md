---
sidebar_position: 5
---

# Migrate Disk Storage

Introduction to how to migrate virtual machine disks to another storage.

After version v3.9.4, virtual machine disks can be migrated to another storage. Application scenarios are as follows:

- Ceph RBD disk migration to local storage
- Local disk migration to Ceph storage
- Ceph RBD disk migration to another Ceph storage

Additional constraints are as follows:

- The two storages that migrate to each other must be mounted to the host where the virtual machine is located

Assume that a host named x86-node01-11-10-1-180-11 in the environment has a Ceph storage and a local storage mounted respectively. Use the following command to query storages mounted on this host:

```bash
$ climc host-storage-list --host x86-node01-11-10-1-180-11 --details
+----------------------------------+----------------------------+-----------+---------------+----------------+
|             Storage              |        Mount_point         | Capacity  | Used_capacity | Waste_capacity |
+----------------------------------+----------------------------+-----------+---------------+----------------+
| wz_rbd                           | rbd:rbd                    | 241013618 | 1556480       | 30720          |
| host_10.1.180.11_local_storage_0 | /opt/cloud/workspace/disks | 681664    | 696320        | 0              |
+----------------------------------+----------------------------+-----------+---------------+----------------+
```

Through the above `climc host-storage-list` command, it is found that host x86-node01-11-10-1-180-11 has 2 storages. Ceph RBD storage is wz_rbd, and local storage is host_10.1.180.11_local_storage_0.

## Ceph RBD Disk Migration to Local Storage

The following command tests creating a virtual machine to wz_rbd Ceph storage, then migrating the disk to host_10.1.180.11_local_storage_0 local storage.

```bash
# First create a virtual machine named tvm-wz, disk uses rbd, specify creation to host
$ climc server-create --disk CentOS-7.6.1810-20190430.qcow2:rbd \
    --net vm-test-net \
    --mem-spec 1g \
    --ncpu 1 \
    --allow-delete \
    --auto-start \
    --prefer-host x86-node01-11-10-1-180-11 \
    tvm-wz

# View virtual machine disk information
# Find corresponding disk name as vdisk-tvm-wz-1636100820075603665
$ climc server-disk-list --server tvm --details
+-------+--------------------------------------+-------------------------------+-----------+--------+------------+-------+--------+-----------+--------------+
| Guest |               Disk_ID                |             Disk              | Disk_size | Driver | Cache_mode | Index | Status | Disk_type | Storage_type |
+-------+--------------------------------------+-------------------------------+-----------+--------+------------+-------+--------+-----------+--------------+
| tvm-wz| 65ca88b1-186f-440a-8930-b4914e62cb3d | vdisk-tvm-wz-1636100820075603665 | 30720     | scsi   | none       | 0     | ready  | sys       | rbd       |
+-------+--------------------------------------+-------------------------------+-----------+--------+------------+-------+--------+-----------+--------------+

# View disk vdisk-tvm-wz-1636100820075603665's storage as h3c_blockpool1
$ climc disk-show vdisk-tvm-wz-1636100820075603665 | grep storage
| storage                   | wz_rbd                                                                  |
| storage_status            | online                                                                  |
| storage_type              | rbd                                                                     |
```

Now a virtual machine using wz_rbd Ceph storage has been created. Next, migrate this tvm-wz virtual machine's vdisk-tvm-wz-1636100820075603665 disk to local storage. The command is as follows:

```bash
# Virtual machine must be shut down to perform disk storage migration
$ climc server-stop tvm-wz

# Execute the following server-change-disk-storage command to migrate tvm virtual machine's vdisk-tvm-1636100820075603665 disk to local storage
$ climc server-change-disk-storage tvm-wz vdisk-tvm-wz-1636100820075603665 host_10.1.180.11_local_storage_0

# Then view virtual machine status. Virtual machine will be in disk_change_storage state during disk storage migration
$ climc server-list --search tvm-wz --details --scope system
| 329bfce5-135f-4113-861e-bd44b8aaf9e0 | tvm-wz | postpaid     | 10.2.18.252 | 30720 | disk_change_storage      | 1          | 1024      | Default  | default  |

# Wait for virtual machine status to become ready, indicating migration is complete
# Then view virtual machine disk again as vdisk-tvm-wz-1636103786977105704
$ climc server-disk-list --server tvm-wz --details                                                                                    
+--------+--------------------------------------+----------------------------------+-----------+--------+------------+-------+--------+-----------+--------------+
| Guest  |               Disk_ID                |               Disk               | Disk_size | Driver | Cache_mode | Index | Status | Disk_type | Storage_type |
+--------+--------------------------------------+----------------------------------+-----------+--------+------------+-------+--------+-----------+--------------+
| tvm-wz | 61e4f0e4-597a-4aa9-8cde-0369879b9236 | vdisk-tvm-wz-1636103786977105704 | 30720     | scsi   | none       | 0     | ready  | sys       | local        |
+--------+--------------------------------------+----------------------------------+-----------+--------+------------+-------+--------+-----------+--------------+

# View new disk vdisk-tvm-wz-1636103786977105704's storage, found it has become local storage
$ climc disk-show  vdisk-tvm-wz-1636103786977105704 | grep storage
| storage                   | host_10.1.180.11_local_storage_0                                                 |
| storage_id                | 4484274b-8483-4166-8e3f-f3c37c4b4997                                             |
| storage_status            | online                                                                           |
| storage_type              | local                                                                            |
```

## Local Disk Migration to Ceph RBD Storage

Still using the previously created tvm-wz virtual machine. Now the virtual machine's disk is local disk vdisk-tvm-wz-1636103786977105704. Execute the following command to migrate this disk to wz_rbd Ceph storage.

```bash
# Migrate local disk to wz_rbd
$ climc server-change-disk-storage tvm-wz vdisk-tvm-wz-1636103786977105704 wz_rbd

# After waiting for migration to complete, execute the previous command to view the virtual machine's disk again, found it is now using wz_rbd storage
# New disk is vdisk-tvm-wz-1636104909252150575
$ climc server-disk-list --server tvm-wz --details                                                                                    
+--------+----------------------------------+-----------+--------+------------+-------+--------+-----------+--------------+
| Guest  |               Disk               | Disk_size | Driver | Cache_mode | Index | Status | Disk_type | Storage_type |
+--------+----------------------------------+-----------+--------+------------+-------+--------+-----------+--------------+
| tvm-wz | vdisk-tvm-wz-1636104909252150575 | 30720     | scsi   | none       | 0     | ready  | sys       | rbd          |
+--------+----------------------------------+-----------+--------+------------+-------+--------+-----------+--------------+

$ climc disk-show vdisk-tvm-wz-1636104909252150575 | grep storage
| storage                   | wz_rbd                                |
| storage_id                | 061342a6-8f5a-4bc6-8757-8bb6c12bda83  |
| storage_status            | online                                |
| storage_type              | rbd                                   |
```

After testing migration is complete, start the virtual machine. If it can start normally and there is no data loss inside, there is no problem.

## Ceph RBD Disk Migration to Another Ceph Storage

### Two Ceph Clusters Interface Compatible

**Note**: This method is suitable when source Ceph and target Ceph clusters are compatible. The dependent rbd dynamic libraries must be consistent, otherwise it will fail.

Assume there is another Ceph storage called wz_rbd in the environment. The following command tests creating a virtual machine to h3c_blockpool1 Ceph storage, then migrating the disk to a Ceph storage named wz_rbd.

```bash
# First create a virtual machine named tvm, disk uses rbd, specify creation to host
$ climc server-create --disk CentOS-7.6.1810-20190430.qcow2:rbd \
    --net vm-test-net \
    --mem-spec 1g \
    --ncpu 1 \
    --allow-delete \
    --auto-start \
    --prefer-host x86-node03-13-10-1-180-13 \
    tvm

# View virtual machine disk information
# Find corresponding disk name as vdisk-tvm-1636100820075603665
$ climc server-disk-list --server tvm --details
+-------+--------------------------------------+-------------------------------+-----------+--------+------------+-------+--------+-----------+--------------+
| Guest |               Disk_ID                |             Disk              | Disk_size | Driver | Cache_mode | Index | Status | Disk_type | Storage_type |
+-------+--------------------------------------+-------------------------------+-----------+--------+------------+-------+--------+-----------+--------------+
| tvm   | 65ca88b1-186f-440a-8930-b4914e62cb3d | vdisk-tvm-1636100820075603665 | 30720     | scsi   | none       | 0     | ready  | sys       | rbd          |
+-------+--------------------------------------+-------------------------------+-----------+--------+------------+-------+--------+-----------+--------------+

# View disk vdisk-tvm-1636100820075603665's storage as h3c_blockpool1
$ climc disk-show vdisk-tvm-1636100820075603665 | grep storage
| storage                   | h3c_blockpool1                                                                  |
| storage_id                | 0bf0cf3c-8cc8-47bb-8d1e-ab97f103e267                                            |
| storage_status            | online                                                                          |
| storage_type              | rbd                                                                             |
```

Now a virtual machine using h3c_blockpool1 Ceph storage has been created. Next, migrate this tvm virtual machine's vdisk-tvm-1636100820075603665 disk to another Ceph storage wz_rbd. The command is as follows:

```bash
# First need to mount wz_rbd storage to the host x86-node03-13-10-1-180-13 where the virtual machine is located
$ climc host-storage-attach x86-node03-13-10-1-180-13 wz_rbd

# View storages mounted on the host, will find one more storage wz_rbd
$ climc host-storage-list --host x86-node03-13-10-1-180-13 --details
+----------------------------------+----------------------------+-----------+---------------+----------------+---------------+----------+
|             Storage              |        Mount_point         | Capacity  | Used_capacity | Waste_capacity | Free_capacity | cmtbound |
+----------------------------------+----------------------------+-----------+---------------+----------------+---------------+----------+
| wz_rbd                           | rbd:rbd                    | 241018691 | 1525760       | 30720          | 239462208     | 1        |
| h3c_blockpool1                   | rbd:.HDDdisk.rbd           | 192653544 | 122880        | 0              | 192530656     | 1        |
| host_10.1.180.13_local_storage_0 | /opt/cloud/workspace/disks | 681664    | 61440         | 0              | 620224        | 1        |
+----------------------------------+----------------------------+-----------+---------------+----------------+---------------+----------+

# Virtual machine must be shut down to perform disk storage migration
$ climc server-stop tvm

# Execute the following server-change-disk-storage command to migrate tvm virtual machine's vdisk-tvm-1636100820075603665 disk to wz_rbd storage
$ climc server-change-disk-storage tvm vdisk-tvm-1636100820075603665 wz_rbd
```

### Two Ceph Clusters Incompatible

If two Ceph clusters are incompatible, for example, one uses open source Ceph cluster and the other uses commercial Ceph cluster, the dynamic libraries of the two clusters are inconsistent and cannot mount both Ceph storages to one host on the platform.

When encountering this situation, you can adopt a workaround solution using NFS storage as a transit. Assume host1 compute node has Ceph1 mounted, and there is a virtual machine vm using Ceph1 on it. To migrate vm to host2's Ceph2 cluster, the steps are as follows:

1. Set up an NFS service yourself, create NFS storage on the cloud platform frontend
2. Then mount this NFS storage to host1 and host2 respectively on the platform frontend
3. Call server-change-disk-storage on host1's vm to migrate the disk in Ceph1 to NFS storage
4. Then call server-migrate command or perform migration operation on the frontend to migrate vm to host2
5. Finally, call server-change-disk-storage again to migrate host2's vm disk to Ceph2

Next are the command line operation steps:

```bash
# Assume NFS server address is 172.16.254.124
# Shared directory is /opt/nfs_data
# Create corresponding nfs-store storage on the platform
$ climc storage-create --storage-type nfs \
    --capacity 1024000 \ # Fill capacity according to actual situation
    --nfs-host 172.16.254.124 \
    --nfs-shared-dir '/opt/nfs_data' \
    nfs-store zone0

# Then mount nfs-store to host1 and host2's /opt/nfs_share directory
# Need to log in to host1 and host2 to create /opt/nfs_share directory
[root@host1] $ mkdir -p /opt/nfs_share
[root@host2] $ mkdir -p /opt/nfs_share

# Mount nfs-store to host1 and host2 on the platform
$ climc host-storage-attach --mount-point /opt/nfs_share host1 nfs-store
$ climc host-storage-attach --mount-point /opt/nfs_share host2 nfs-store

# Change host1's vm disk to nfs-store
$ climc server-disk-list --server vm --details
+-------+--------------------------------------+-------------------------------+-----------+--------+------------+-------+--------+-----------+--------------+
| Guest |               Disk_ID                |             Disk              | Disk_size | Driver | Cache_mode | Index | Status | Disk_type | Storage_type |
+-------+--------------------------------------+-------------------------------+-----------+--------+------------+-------+--------+-----------+--------------+
| vm| 65ca88b1-186f-440a-8930-b4914e62cb3d | vdisk-vm-wz-1636100820075603665 | 30720     | scsi   | none       | 0     | ready  | sys       | rbd       |
+-------+--------------------------------------+-------------------------------+-----------+--------+------------+-------+--------+-----------+--------------+

# Execute the following server-change-disk-storage command to migrate vm virtual machine's disk to nfs-store
$ climc server-change-disk-storage vm vdisk-vm-wz-1636100820075603665 nfs-store

# After waiting for virtual machine vm status to become ready
# Then migrate virtual machine to host2
$ climc server-migrate --prefer-host host2 vm

# Then call server-change-disk-storage again to migrate vm virtual machine disk to ceph2 storage
# Find current disk as vdisk-vm-1636100820075603665, found type Storage_type is nfs
$ climc server-disk-list --server vm --details
+-------+--------------------------------------+-------------------------------+-----------+--------+------------+-------+--------+-----------+--------------+
| Guest |               Disk_ID                |             Disk              | Disk_size | Driver | Cache_mode | Index | Status | Disk_type | Storage_type |
+-------+--------------------------------------+-------------------------------+-----------+--------+------------+-------+--------+-----------+--------------+
| vm| 65ca88b1-186f-440a-8930-b4914e62cb3d | vdisk-vm-1636100820075603665 | 30720     | scsi   | none       | 0     | ready  | sys       | nfs       |
+-------+--------------------------------------+-------------------------------+-----------+--------+------------+-------+--------+-----------+--------------+

# View storages mounted on host host2
# Found nfs-store and ceph2
$ climc host-storage-list --host host2 --details
+----------------------------------+----------------------------+-----------+
|             Storage              |        Mount_point         | Capacity  |
+----------------------------------+----------------------------+-----------+
| ceph2                           | rbd:rbd                    | 241018691 | 
| nfs                   | /opt/nfs_share           | 1024000 | 122880      | 
| host_10.1.180.13_local_storage_0 | /opt/cloud/workspace/disks | 681664    |
+----------------------------------+----------------------------+-----------++

# Migrate virtual machine vm disk to ceph2
$ climc server-change-disk-storage vm vdisk-vm-1636100820075603665 ceph2
```

## Other Considerations

- Old disks that changed storage will be deleted to the recycle bin and will occupy actual physical space. If you confirm these old disks are not used, you can clean them in the recycle bin.

## Disk Storage Change Principle

Currently, disk storage change uses the `qemu-img convert` command at the bottom layer to perform disk bottom layer storage changes. After the cloud platform executes the `climc server-change-disk-storage` command, you can log in to the host where the virtual machine is located and execute the following command to see this `qemu-img convert` process:

```bash
$ ps faux | grep qemu-img | grep convert
root     3701532 13.8  0.1 1516864 102056 ?      Ssl  17:35   0:00  \_ /usr/local/qemu-2.12.1/bin/qemu-img convert -f qcow2 -O raw /opt/cloud/workspace/disks/61e4f0e4-597a-4aa9-8cde-0369879b9236 rbd:rbd/d55671c1-ec1b-4c2c-87cb-aa4aa517744e:mon_host=172.16.2.31\;172.16.2.32\;172.16.2.33:key=AQBBi1RhiSvXChAAnFzGrpAGM5N8dWb3rTdQwQ\=\=:rados_osd_op_timeout=1200:client_mount_timeout=120:rados_mon_op_timeout=5
```

