---
sidebar_position: 1
---

# Local Storage

Introduction to how to configure, add and use local storage.

Local storage's virtual machine disks are stored in local directories, independent of the file system used by this directory, which can be ext4 or xfs. Virtual disk file format uses qcow2 format. Default storage location is in the host directory: /opt/cloud/workspace/disks.

Local directories storing virtual disks need to be explicitly declared in the host's configuration file. The host service's configuration item local_image_path specifies the directory used by this host to save virtual machine disks.

## Add Local Storage

:::warning
Be sure to mount local storage to subdirectories under `/opt/cloud/workspace` directory, because the host service runs in containers and does not have permission to access other directories.
:::

1. Mount disk partitions to /opt/cloud/workspace directory:

Here assuming /dev/sdb1 and /dev/sdc1 are to be used as local storage, first you need to format the disk partitions, then add automatic mount points in /etc/fstab, where UUID can be queried by executing `blkid` command:

```
UUID=b411dc99-f0a0-4c87-9e05-184977be8539 /opt/cloud/workspace/disks2 ext4   defaults  0      2
UUID=f9fe0b69-a280-415d-a03a-a32752370dee /opt/cloud/workspace/disks3 ext4   defaults  0      2
```

2. Modify /etc/yunion/host.conf, add new local disks to the string array of local_image_path:

```yaml
local_image_path:
- /opt/cloud/workspace/disks
- /opt/cloud/workspace/disks2
- /opt/cloud/workspace/disks3
```

3. Restart host service

Restart host. Here assuming the node name is ceph-02, the following command will delete the host pod on ceph-02, then K8s will automatically recreate a new pod.

```bash
OP_HOST=ceph-02
kubectl delete pods -n onecloud $(kubectl get pods -n onecloud -o wide | grep host | egrep -v 'image|deployer' | grep $OP_HOST | awk '{print $1}')
```

View the host's storage list, and you can see the newly registered storage.

```bash
climc storage-list --host <host_id>
```

## Delete Local Storage

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

4. Go to the host, modify /etc/yunion/host.conf, remove the storage path from local_image_path

5. Restart host service

## FAQ

### Don't see newly added storage?

If you don't see newly added storage, it should be that the host service storage registration failed. You need to view startup logs through the following command. Here assuming viewing host pod logs on ceph-02 node.

```bash
OP_HOST=ceph-02
kubectl logs -n onecloud $(kubectl get pods -n onecloud -o wide | grep host | egrep -v 'image|deployer' | grep $OP_HOST | awk '{print $1}') -c host
```

Then handle the next step based on the log errors.


