---
sidebar_position: 2
---

# Local Storage Recycle Bin

In addition to the disk recycle bin pseudo-deletion mechanism, the platform also provides an additional layer of protection to ensure that virtual machine disk files will not be accidentally deleted.

There is a recycle_bin directory under each local storage directory. When performing delete operations on local disks, it will not execute real delete operations, but move the disk to this directory for temporary storage, stored in a subdirectory named with deletion time. There are periodic tasks on the host that scan the recycle_bin directory and truly clear subdirectories with dates before the agreed cleanup time.

There are three options in the host service configuration to configure the recycle bin. recycle_diskfile is to enable or disable the recycle bin function, enabled by default. recycle_diskfile_keep_days is used to specify the retention days of disk files in the recycle bin, default is 28 days. always_recycle_diskfile configures whether to always move deleted local disk files to the recycle bin. If true, after migrating local storage hosts, local disks on the original host will be moved to the recycle bin. Otherwise, after local disk virtual machine migration is successfully completed, local disk files on the original host will be immediately deleted.

```yaml
recycle_diskfile: true
recycle_diskfile_keep_days: 28
always_recycle_diskfile: true
```

Since the recycle bin will occupy disk space, there may be cases where disk space is insufficient due to too many disk files in the recycle bin. At this time, you need to manually clean the recycle bin. Manually cleaning the recycle bin only requires manually deleting subdirectories under recycle_bin.

## Restore Virtual Machine Using Disk Files in Recycle Bin

The following introduces steps to restore a virtual machine using disk files in local storage recycle bin.

Step 1: Create a virtual machine with the same configuration. Create a virtual machine according to the configuration of the local disk's virtual machine that the virtual disk file was associated with before deletion.

Step 2: Locate the new virtual machine's local disk file path, generally located at */opt/cloud/workspace/disks*, may also vary. You need to view the corresponding disk's detail information to find the storage path.

Step 3: Copy the disk file to be restored, overwrite the corresponding disk file of the new virtual machine. Check if the disk file has a backing file. If it does, you also need to copy the file corresponding to the backing file to the specified path.


