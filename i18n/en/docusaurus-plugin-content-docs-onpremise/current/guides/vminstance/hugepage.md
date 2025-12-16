---
sidebar_position: 10
---

# Use Huge Pages

Introduction to how to enable huge pages on hosts for virtual machines to use.

Built-in private cloud supports virtual machines using huge pages (Hugepage). Using huge pages helps reduce memory fragmentation and improve virtual machine memory access efficiency, thereby improving virtual machine performance.

Enable or disable huge pages by setting each host's configuration (/etc/yunion/host.conf) hugepages_option. This option has three values:

* disable: Do not enable huge page support

* transparent: Enable transparent huge page support. This option is the default option. After enabling transparent huge page support, the operating system will do its best to use huge page memory for virtual machines and automatically merge virtual machine's normal memory into huge page memory.

* native: Enable native huge page memory support. This mode requires explicitly allocating huge page memory pools, and memory used by virtual machines needs to be pre-reserved and allocated from huge page memory pools and passed as parameters to virtual machines for use. This method can guarantee memory continuity, can allocate 1G huge page memory, providing the best performance.

Using transparent huge page support is more convenient, only need to set hugepages_option to transparent. However, this method cannot use 1G huge pages and does not guarantee that virtual machines always use huge page memory.

## Enable Native Huge Page Memory

Environments deployed through ocboot will install the `oc-hugetlb-gigantic-pages.service` service by default. You can use `systemctl status oc-hugetlb-gigantic-pages.service` to view

### Enable Huge Pages During Deployment

Hosts with x86_64 architecture non-control nodes are enabled by default, and take effect when memory exceeds 30G. Reserved memory is 10% of total memory, maximum reserved 20G memory. You can modify enable_hugepage in config.yaml to control enabling or disabling huge page memory
```
  as_host: true
  # Virtual machine forcibly serves as OneCloud private cloud compute node (default is false). When enabling this item, please ensure as_host: true
  as_host_on_vm: true
  # Whether host enables huge page memory (hosts with x86_64 architecture non-control nodes are enabled by default, and take effect when memory exceeds 30G. Reserved memory is 20% of total memory, maximum reserved 32G memory)
  enable_hugepage: true
```

### Enable Huge Pages After Deployment is Complete
After environment deployment is complete, to enable native huge pages:

1. Set /etc/yunion/host.conf's hugepages_options to native

2. Restart the host

After restart, view the following parameters to confirm whether 1GB huge page memory reservation is successful

```bash
$ cat /sys/kernel/mm/hugepages/hugepages-1048576kB/nr_hugepages
110
$ cat /sys/kernel/mm/hugepages/hugepages-1048576kB/free_hugepages
110
$ free -h
              total        used        free      shared  buff/cache   available
Mem:           125G        113G        7.6G        4.5M        4.5G         11G
Swap:            0B          0B          0B
```

### Configure Reserved Memory

By default, reserved memory is 10% of the host's current memory, maximum not exceeding 20G. If you want to manually configure the host's reserved memory, you can configure it by setting RESERVED_MEM.

```
[Unit]
Description=OC HugeTLB Gigantic Pages Reservation
DefaultDependencies=no
Before=dev-hugepages.mount
ConditionPathExists=/sys/kernel/mm/hugepages
ConditionKernelCommandLine=hugepagesz=1G

[Service]
Type=oneshot
RemainAfterExit=yes
# Environment="RESERVED_MEM=24" # Configurable RESERVED_MEM
ExecStart=/usr/lib/systemd/oc-hugetlb-reserve-pages.sh

[Install]
WantedBy=sysinit.targe
```

