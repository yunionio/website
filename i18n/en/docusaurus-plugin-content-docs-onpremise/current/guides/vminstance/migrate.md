---
sidebar_position: 6
---

# Virtual Machine Migration

Introduction to how to migrate virtual machines and related considerations for virtual machine migration.

## Introduction

Currently, the migration function is mainly used for virtual machines in built-in private clouds. This function is used to migrate virtual machines to other hosts. When no host is specified, the system will automatically select a host.


Migration methods are divided into "cold migration" and "hot migration". The differences are as follows:

- Cold migration: In the **shutdown state** of the virtual machine, copy the virtual machine disk from the source host to the target host.
- Hot migration: In the **running state** of the virtual machine, synchronize the virtual machine's disk and memory state to the target host. When data on both sides is synchronized, switch the virtual machine to the target host.

Compared to cold migration, hot migration can migrate virtual machines from one host to another without shutting down, ensuring business operation.

However, hot migration by default requires the target host and source host to have the same CPU model and CPU microcode. You can view the CPU model and microcode through the following command:

```bash
$ cat /proc/cpuinfo | grep -e 'model name' -e 'microcode'  | sort | uniq
microcode       : 0x42e
model name      : Intel(R) Xeon(R) CPU E5-2650 v2 @ 2.60GHz
```

## Migrate Through Frontend

1. On the virtual machine page, click the "More" button in the operation column on the right side of the virtual machine, select the "High Availability-Migrate" menu item from the dropdown menu to pop up the migration dialog.
2. Configure the following parameters:
    - Skip CPU core check: When migrating virtual machines, the destination host and the host where the virtual machine is located are required to have the same CPU model and microcode. If the host CPU models are inconsistent but you still want to continue migration, you can enable skip CPU check. The system will do its best to perform hot migration, but after migration is complete, there may be cases where the virtual machine cannot run normally on the target host.
    - Host: Select the target host, or leave it empty. If left empty, the system will automatically select a host. The platform will pre-schedule and filter hosts that meet migration conditions. If there are no hosts that meet the conditions, please check whether there are available CPUs, memory, and storage on hosts in the same layer 2 network, and whether CPU models and microcode are the same. If they are different, you can try migration after skipping CPU check, etc.
    - Maximum migration bandwidth: Supports setting migration bandwidth.
    - Quick convergence: After enabling, supports adjusting virtual machine downtime after hot migration memory synchronization for a period of time to reach migration completion state.
3. Click the "OK" button to migrate the virtual machine to another host.

## Migrate Through climc

### Cold Migration

Virtual machines in shutdown state can perform cold migration operations.

#### View Cold Migration Help Information

The command for cold migration is `climc server-migrate`. You can view parameter descriptions and help information through the following command:

```bash
$ climc server-migrate --help

Usage: climc server-migrate [--auto-start] [--rescue-mode] [--prefer-host PREFER_HOST] <ID>

Migrate server

Positional arguments:
    <ID>
        ID of server

Optional arguments:
    [--auto-start]
        Server auto start after migrate
    [--rescue-mode]
        Migrate server in rescue mode, all disks must reside on shared storage
    [--prefer-host PREFER_HOST]
        Server migration prefer host id or name
```

#### Cold Migration Examples

- Migrate already shut down virtual machine vm1

```bash
# First view virtual machine information
$ climc server-list --search vm1 --details --scope system

# Execute random migration
$ climc server-migrate vm1

# During migration, virtual machine will be in migrating state
$ climc server-list --search vm1 --scope system

# After migration is complete, virtual machine status becomes ready, and you can find that host information has also changed
$ climc server-list --search vm1 --details --scope system
```

- Migrate to specified host

```bash
# First list platform's kvm hosts
$ climc host-list --hypervisor kvm

# Then specify host name or id for migration
$ climc server-migrate --prefer-host xxx vm1
```

- Auto start virtual machine after migration

```bash
$ climc server-migrate --auto-start vm1

$ climc server-migrate --auto-start --prefer-host xxx vm1
```

- rescue mode migration: When the host completely crashes, and all disks of the virtual machine use shared storage (ceph and other distributed block storage), you can migrate metadata to another host through rescue mode, then start

```bash
$ climc server-migrate --rescue-mode \
    --auto-start \
    --prefer-host $host_name \
    $vm_name
```

### Hot Migration

Migration performed when virtual machines are in running state is called hot migration. Hot migration speed will be slower than cold migration because it involves synchronization of disk and memory states, but the benefit is that migration is performed without shutting down, basically having no impact on business running on the virtual machine.

#### View Hot Migration Help Information

The command for hot migration is `climc server-live-migrate`. View help information through the following command:

```bash
$ climc server-live-migrate --help
Usage: climc server-live-migrate [--skip-cpu-check] [--skip-kernel-check] [--enable-tls] [--quickly-finish] [--max-bandwidth-mb MAX_BANDWIDTH_MB] [--keep-dest-guest-on-failed] [--help] [--prefer-host PREFER_HOST] <ID>

Live-Migrate server

Positional arguments:
    <ID>
        ID of server

Optional arguments:
    [--skip-cpu-check]
        Skip check CPU mode of the target host
    [--skip-kernel-check]
        Skip target kernel version check
    [--enable-tls]
        Enable tls migration
    [--quickly-finish]
        quickly finish, fix downtime after a few rounds of memory synchronization
    [--max-bandwidth-mb MAX_BANDWIDTH_MB]
        live migrate downtime, unit MB
    [--keep-dest-guest-on-failed]
        do not delete dest guest on migrate failed, for debug
    [--help]
        Print usage and this help message and exit.
    [--prefer-host PREFER_HOST]
        Server migration prefer host id or name
```

#### Hot Migration Examples

- Perform hot migration on virtual machine vm1, target host randomly selected

```bash
$ climc server-live-migrate vm1
```

- Hot migration by default requires the target host and the host where the virtual machine is currently located to have the same CPU, kernel version, etc. If they are inconsistent, that host will be filtered out by the scheduler. If there really is no target host with consistent CPU in the environment, you can use `--skip-cpu-check` to bypass CPU check. By default, hot migration bandwidth is not limited. Default maximum Downtime is 300ms.

```bash
$ climc server-live-migrate --skip-cpu-check vm1
```

- Specify vm1 hot migration to target host host1, and bypass CPU check

```bash
$ climc server-live-migrate \
    --prefer-host host1 \
    --skip-cpu-check \
    vm1
```

- Specify vm1 hot migration to target host host1, bypass CPU check, and limit hot migration bandwidth (maximum 100 MB/s)

```bash
$ climc server-live-migrate \
    --prefer-host host1 \
    --skip-cpu-check \
    --max-bandwidth-mb 100 \
    vm1
```

- Specify vm1 hot migration to target host host1, bypass CPU check, limit hot migration bandwidth and enable quick convergence. Quick convergence is to adjust hot migration downtime after a certain number of rounds of virtual machine memory copying to complete the last copy of hot migration.

```bash
$ climc server-live-migrate \
    --prefer-host host1 \
    --skip-cpu-check \
    --max-bandwidth-mb \
    --quickly-finish \
    vm1
```

## Host Downtime Automatic Migration

### Principle

Host downtime automatic migration automatically detects host online status. When the controller (region) detects that a host is offline, it will automatically start virtual machines using shared storage on that host on other hosts. Host downtime detection principle is that host maintains a key on etcd (path is: /onecloud/kvm/host/health/\<host_id\>), region will watch this key. Once the host goes offline, this key will timeout and be deleted. After region detects this event, it starts to force migrate shared storage hosts on the host to other hosts.

### Enable Downtime Automatic Migration

Enable downtime automatic migration through the following steps:

```bash
$ climc host-auto-migrate-on-host-down --help
Usage: climc host-auto-migrate-on-host-down [--auto-migrate-on-host-shutdown {enable,disable}] [--help] [--auto-migrate-on-host-down {enable,disable}] <ID>

# Divided into downtime automatic migration and shutdown automatic migration. To enable shutdown automatic migration, downtime automatic migration must be enabled at the same time
# Only enable downtime automatic migration
$ climc host-auto-migrate-on-host-down --auto-migrate-on-host-down enable <host_id>
# Enable shutdown automatic migration and downtime automatic migration at the same time
$ climc host-auto-migrate-on-host-down --auto-migrate-on-host-down enable --auto-migrate-on-host-shutdown enable <host_id>
```

