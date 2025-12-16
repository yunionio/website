---
sidebar_position: 13
---

# Disk Rate Limiting

This article introduces how to configure disk rate limiting. Disk rate limiting can limit IOPS and BPS for each disk of virtual machines.

## Set Disk Rate Limiting

```bash
# Get virtual machine's disk id
$ climc server-disk-list --server 8c387da0-2627-4c65-8c8c-0c241eadb5df
+--------------------------------------+--------------------------------------+--------+------------+-------+------------+
|               Guest_ID               |               Disk_ID                | Driver | Cache_mode | Index | Boot_index |
+--------------------------------------+--------------------------------------+--------+------------+-------+------------+
| 8c387da0-2627-4c65-8c8c-0c241eadb5df | 229e2063-139a-4750-8842-3a681193d42c | scsi   | none       | 0     | -1         |
+--------------------------------------+--------------------------------------+--------+------------+-------+------------+

# Set disk rate limiting
$ climc server-io-throttle --help
Usage: climc server-io-throttle [--iops IOPS] [--help] [--bps BPS] <ID>

Guest io set throttle

Positional arguments:
    <ID>
        ID or name of the server

Optional arguments:
    [--iops IOPS]
        disk iops of throttle, input diskId=IOPS
    [--help]
        Print usage and this help message and exit.
    [--bps BPS]
        disk bps of throttle, input diskId=BPS

# Note bps unit is byte/s
# Set disk iops to 10000
$ climc server-io-throttle --iops 229e2063-139a-4750-8842-3a681193d42c=10000 8c387da0-2627-4c65-8c8c-0c241eadb5df

```

If you need to cancel rate limiting, set iops and bps to 0:

```bash
$ climc server-io-throttle --iops 229e2063-139a-4750-8842-3a681193d42c=0  --bps 229e2063-139a-4750-8842-3a681193d42c=0 8c387da0-2627-4c65-8c8c-0c241eadb5df
```

If there are multiple disks that need to be set, just add command line --iops \<DISK_ID\>=iops or --bps \<DISK_ID\>=bps, eg:

```bash
climc server-io-throttle --iops <DISK_1>=iops1 --iops <DISK_2>=iops2 --bps <DISK_1>=bps1 --bps <DISK_2>=bps2 <GUEST_ID>
```

