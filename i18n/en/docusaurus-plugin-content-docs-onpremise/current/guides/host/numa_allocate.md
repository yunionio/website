---
sidebar_position: 7
---

# Host Enable NUMA Memory Allocation

Normally, when creating virtual machines on a host, the virtual machine's memory is randomly allocated directly from multiple numa on the host by the operating system. After enabling numa memory allocation, the memory on the host will be managed by host-agent, and will try to pre-allocate the numa memory used by the virtual machine before creating the virtual machine as much as possible.

Host host-agent numa memory allocation rules:
- When a single numa node has sufficient memory, the virtual machine's memory is allocated on the same numa.
- When a single numa node has insufficient memory, it will try to increase the virtual machine's numa node in multiples and then allocate memory on multiple numa node nodes, and make the virtual machine's numa node correspond to the numa node on the host.
- When memory cannot be allocated regularly on multiple numa nodes, it will be allocated by the operating system, and host-agent records it.


## How to Enable NUMA Memory Allocation

Conditions for host to enable NUMA memory allocation:
- Current host has large pages enabled
- Current host has no running virtual machines
- Current host has more than 1 numa node

```bash
# View host numa node count
$ numactl -H
available: 2 nodes (0-1)
node 0 cpus: 0 2 4 6 8 10 12 14 16 18 20 22
node 0 size: 64460 MB
node 0 free: 7330 MB
node 1 cpus: 1 3 5 7 9 11 13 15 17 19 21 23
node 1 size: 64484 MB
node 1 free: 7557 MB
node distances:
node   0   1
  0:  10  20
  1:  20  10


# Host enable numa memory allocation
$ climc host-update --enable-numa-allocate True <HOST_ID>

# Confirm numa memory allocation is enabled
$ climc host-show wyq-node-1-10-168-222-183 |grep enable_numa_allocate
|| enable_numa_allocate          | true

# Restart current host-agent
$ kubectl delete pod -n onecloud <HOST_POD_NAME>
```

## Disable NUMA Memory Allocation

Conditions for host to disable NUMA memory allocation:
- Current host has no running virtual machines

```bash
climc host-update --enable-numa-allocate False <HOST_ID>
```


