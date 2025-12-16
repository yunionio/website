---
sidebar_position: 5
---

# NFS Storage

This article introduces how to configure and use NFS storage.

NFS storage is a type of NAS storage. The difference from other NAS storage is: after the platform configures NFS and associates it with hosts, it will automatically mount the NFS directory to the host's specified directory, without users needing to mount in advance. Therefore, it requires that NFS client software (generally nfs-utils) is installed on the host.

## Specify NFS Storage Mount Parameters

The host uses the following command to mount NFS storage, and cannot pass additional NFS storage mount parameters. However, there may be cases where default NFS mount parameters are not suitable for this NFS storage.

```
mount -t nfs 192.168.2.1:/export/nfsdata /opt/cloud/workspace/nfsdisks
```

If users need to specify NFS mount parameters, they can modify the host's /etc/nfsmount.conf to specify nfs mount parameters, for example:

```
# cat /etc/nfsmount.conf |grep -v '#'
[ NFSMount_Global_Options ]
nolock=True
```


