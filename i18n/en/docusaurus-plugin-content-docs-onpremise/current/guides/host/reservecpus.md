---
sidebar_position: 5
---

# Host CPU Reservation

Reserve CPUs on the host for non-virtual machine processes.

## Function Introduction

Host CPU reservation function supports reserving some CPUs for other processes to use, and no longer allocating them to virtual machines.

## Usage Introduction

Ensure there are no running virtual machines on this host, then select appropriate CPUs as reserved CPUs. When host hostagent initializes, it will create the cloudpods.hostagent.reserved cgroup.

```bash
$ climc host-reserve-cpus --help
Usage: climc host-reserve-cpus [--mems MEMS] [--disable-sched-load-balance] [--help] [--cpus CPUS] <ID> ...

# Three parameters
# --cpus corresponds to cpuset.cpus: Limit CPU used by process group.
# --mems corresponds to cpuset.mems, limit memory nodes that can be used.
# --disable-sched-load-balance corresponds to cpuset.sched_load_balance flag, close cpu balance within reserved cpuset.
$ climc host-reserve-cpus  --mems 0-1 --disable-sched-load-balance --cpus "1-2,38-39" 3bce9607-2597-469f-8d9b-977345456739

# View on host
$ cat /sys/fs/cgroup/cpuset/cloudpods.hostagent.reserved/cpuset.cpus
1-2,38-39
$ cat /sys/fs/cgroup/cpuset/cloudpods.hostagent.reserved/cpuset.mems
0-1
$ cat /sys/fs/cgroup/cpuset/cloudpods.hostagent.reserved/cpuset.sched_load_balance
0
```


