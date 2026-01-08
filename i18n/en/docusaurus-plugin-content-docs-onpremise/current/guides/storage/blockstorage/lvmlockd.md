---
sidebar_position: 8
---

# Shared LVM Storage With Lvmlockd

In operating systems such as Centos8 and OpenEuler, lvmlockd serves as an upgrade solution for clvm. This article introduces how to use lvmlockd to build an lvm cluster and how to register it in cloudpods.

## Configure lvmlockd and Create vg

Use lvmlockd to build a shared lvm cluster:
```bash

# Note: centos7 lvm will start lvmetad service by default. If it's a centos7 host, you need to disable it first:
$ systemctl disable lvm2-lvmetad.service --now

$ yum install -y lvm2-lockd.x86_64
$ yum install -y sanlock.x86_64

$ vi /etc/lvm/lvm.conf
use_lvmlockd = 1

# Set auto_activation_volume_list = [] in activation
activation {
    # Set to empty list, prohibit automatic activation of any LV
    auto_activation_volume_list = []

    # Or, only allow specific LVs to automatically activate
    # auto_activation_volume_list = ["vg1/lv1", "vg2/lv2"]
}

# Assign each host a unique host_id in the range 1-2000 by setting
$ vi /etc/lvm/lvmlocal.conf
    host_id = 2

$ systemctl enable wdmd sanlock --now

# Note: centos7 service name is lvm2-lvmlockd, this command should be changed to systemctl enable lvm2-lvmlockd --now
$ systemctl enable lvmlockd --now

# Execute on the first node, create cluster vg: vgcreate --shared <vgname> <devices>
$ vgcreate --shared cluster-vg /dev/sdb

# Execute on each node
$ vgchange --lock-start

# After success, you can view lvmlock information
# View lvmlock information
$ lvmlockctl -i
```

## cloudpods Cluster Create Shared LVM Storage

```bash
# shared lvm vgname storage1
# Storage type using lvmlockd is slvm, and need to add parameter --lvmlockd, different from slvm storage that needs to specify master host
# Currently this host is not associated with storage, so after slvm storage creation is complete, you need to associate this host.
$ climc storage-create \ 
    --storage-type slvm \
    --slvm-vg-name storage1 \
    --lvmlockd \ # Set storage to use lvmlockd storage
    <STORAGE_NAME> <ZONE_ID_OR_NAME>

eg:
$ climc storage-create --slvm-vg-name storage1  --storage-type slvm --lvmlockd lvmlockd-storage1 zone0
$ climc host-storage-attach host1 lvmlockd-storage1

# Other hosts that need to be associated can also be associated like this
$ climc host-storage-attach
Usage: climc host-storage-attach [--help] [--mount-point MOUNT_POINT] <HOST> <STORAGE>
# host_id can be obtained through climc host-list
$ climc host-storage-attach <HOST_ID> lvmlockd-storage1
```

## Delete

Deleting storage is similar to other storage. After detaching from the host, you can execute `climc storage-delete`


