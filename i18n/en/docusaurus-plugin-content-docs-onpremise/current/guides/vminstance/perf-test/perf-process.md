---
sidebar_position: 1
---

# Test Steps

### CPU and Memory Performance Testing

#### Test Environment

Operating System: CentOS 7
Cloud Platform Version: >= v3.7.7
Host: Dell PowerEdge R730xd
    - CPU: Intel(R) Xeon(R) CPU E5-2678 v3 @ 2.50GHz
    - Memory: DDR4 2133 MHz 256GB (16GB x 16)
    - Disk: Mechanical disk 20TB PERC H730P Mini (RAID 10)
    - Network Card: 10000Mb/s

#### Install Test Software

Test Tools:

- UnixBench: Test virtual machine CPU performance
- mbw: Test memory performance

```bash
# Install UnixBench
$ yum install -y git gcc autoconf gcc-c++ time perl-Time-HiRes
$ git clone https://github.com/kdlucas/byte-unixbench.git

# Install mbw
$ git clone https://github.com/raas/mbw.git && cd mbw
$ make && ./mbw 512
```

#### CPU Test

Test Command:

```bash
$ cd byte-unixbench/UnixBench
$ ./Run -c 1 whetstone-double dhry2reg fsdisk
```

Conclusion:

| Metric                       | Physical Machine         | Virtual Machine         | Virtualization Overhead (Physical-Virtual/ Physical) |
|----------------------------|----------------|----------------|-------------------------------------|
| Dhrystone                  | 34839728.4 lps | 33964545.0 lps | 2.5%                                |
| Double-Precision Whetstone | 4368.3 MWIPS   | 4244.3 MWIPS   | 2.8%                                |
| File Copy                  | 1825548.4 KBps | 1788048.3 KBps | 2.1%                                |

#### Memory Test

Conclusion:

| Metric       | Physical Machine         | Virtual Machine         | Virtualization Overhead (Physical-Virtual/Physical) |
|------------|----------------|----------------|------------------------------------|
| MEMCPY AVG | 7578.348 MiB/s | 6254.520 MiB/s | 1.7%                               |


### Local Storage IO Testing

#### Test Method

Use fio, test with the following scenarios and commands:

* 4KB Random Read

```bash
fio --name=random-read --ioengine=posixaio --rw=randread --bs=4k --size=4g --numjobs=1 --iodepth=16 --runtime=60 --time_based --direct=1
```

* 4KB Random Write

```bash
fio --name=random-write --ioengine=posixaio --rw=randwrite --bs=4k --size=4g --numjobs=1 --iodepth=16 --runtime=60 --time_based --direct=1 --end_fsync=1
```

* 4K Sequential Read

```bash
fio --name=random-read --ioengine=posixaio --rw=read --bs=4k --size=4g --numjobs=1 --iodepth=16 --runtime=60 --time_based --direct=1
```

* 4K Sequential Write

```bash
fio --name=random-write --ioengine=posixaio --rw=write --bs=4k --size=4g --numjobs=1 --iodepth=16 --runtime=60 --time_based --direct=1 --end_fsync=1
```

* 1MB Sequential Read

```bash
fio --name=seq-read --ioengine=posixaio --rw=read --bs=1m --size=16g --numjobs=1 --iodepth=1 --runtime=60 --time_based --direct=1
```

* 1MB Sequential Write

```bash
fio --name=seq-write --ioengine=posixaio --rw=write --bs=1m --size=16g --numjobs=1 --iodepth=1 --runtime=60 --time_based --direct=1 --end_fsync=1
```

#### Test Environment

* Physical Machine

    OS: CentOS Linux release 7.9.2009 (Core)
    Kernel: 3.10.0-1062.4.3.el7.yn20191203.x86_64
    CPU: Intel(R) Xeon(R) CPU E5-2678 v3 @ 2.50GHz
    Memory: 256G
    RAID Controller: Broadcom / LSI MegaRAID SAS-3 3108
    RAID Level: RAID10

* Linux Virtual Machine

    OS: CentOS Linux release 7.6.1810 (Core)
    Kernel: 3.10.0-957.12.1.el7.x86_64
    Configuration: 4 cores CPU 4G memory 30G system disk 100G data disk

* Windows Virtual Machine

    OS: Windows Server 2008 R2 Datacenter 6.1
    Configuration: 4 cores CPU 4G memory 40G system disk 100G data disk
 
#### Test Results

| Scenario                       | 4KB      | Random Read     | 4KB    | Random Write     | 4KB    | Sequential Read     | 4KB    | Sequential Write     | 1MB    | Sequential Read     | 1MB    | Sequential Write      | 
|----------------------------|---------:|:-----------|-------:|:-----------|-------:|:-----------|-------:|:-----------|-------:|:-----------|-------:|:-----------|
|                            | IOPS     | Throughput | IOPS   | Throughput | IOPS   | Throughput | IOPS   | Throughput | IOPS   | Throughput | IOPS   | Throughput |
| Physical Machine                     | 195      | 782KiB/s   | 7349   | 28.7MiB/s  | 22.1k  | 86.3MiB/s  | 24.5k  | 95.8MiB/s  | 1055   | 1056MiB/s  | 1117   | 1118MiB/s  |
|                            | (100%)   | (100%)     | (100%) | (100%)     | (100%) | (100%)     | (100%) | (100%)     | (100%) | (100%)     | (100%) | (100%)     |
| Linux Virtual Machine               | 245      | 981KiB/s   | 6096   | 23.8MiB/s  | 9458   | 36.9MiB/s  | 6278   | 24.5MiB/s  | 979    | 980MiB/s   | 1058   | 1059MiB/s  |
| (cache=none)               | (126%)   | (125%)     | (83%)  | (83%)      | (43%)  | (43%)      | (26%)  | (26%)      | (93%)  | (93%)      | (95%)  | (95%)      |
| Linux Virtual Machine               | 243      | 973KiB/s   | 7483   | 29.2MiB/s  | 11.5k  | 44.9MiB/s  | 7271   | 28.4MiB/s  | 958    | 959MiB/s   | 1052   | 1052MiB/s  |
| (cache=none,queues=4)      | (125%)   | (124%)     | (102%) | (102%)     | (52%)  | (52%)      | (30%)  | (30%)      | (91%)  | (91%)      | (94%)  | (94%)      |
| Linux Virtual Machine               | 13.0k    | 54.5MiB/s  | 8360   | 32.7MiB/s  | 13.1k  | 51.3MiB/s  | 8976   | 35.1MiB/s  | 2550   | 2551MiB/s  | 1045   | 1046MiB/s  |
| (cache=writeback)          | (6667%)  | (6969%)    | (114%) | (114%)     | (59%)  | (59%)      | (37%)  | (37%)      | (242%) | (242%)     | (94%)  | (94%)      |
| Linux Virtual Machine               | 28.7k    | 112MiB/s   | 12.2k  | 47.5MiB/s  | 29.6k  | 116MiB/s   | 11.2k  | 43.8MiB/s  | 2931   | 2932MiB/s  | 1220   | 1220MiB/s  |
| (cache=writeback,queues=4) | (14718%) | (14322%)   | (166%) | (166%)     | (134%) | (134%)     | (46%)  | (46%)      | (278%) | (278%)     | (109%) | (109%)     |
| Windows Virtual Machine             | 2811     | 11.0MiB/s  | 6002   | 23.4MiB/s  | 11.8k  | 46.1MiB/s  | 4289   | 16.8MiB/s  | 1009   | 1009MiB/s  | 685    | 686MiB/s   |
| (cache=none)               | (1441%)  | (1407%)    | (82%)  | (82%)      | (53%)  | (53%)      | (18%)  | (18%)      | (96%)  | (96%)      | (61%)  | (61%)      |
| Windows Virtual Machine             | 2794     | 10.9MiB/s  | 7448   | 29.1MiB/s  | 21.1k  | 82.6MiB/s  | 25.5k  | 99.7MiB/s  | 930    | 930MiB/s   | 1013   | 1014MiB/s  |
| (cache=none,queues=4)      | (1432%)  | (1394%)    | (101%) | (101%)     | (95%)  | (96%)      | (104%) | (104%)     | (88%)  | (88%)      | (91%)  | (91%)      |
| Windows Virtual Machine             | 2483     | 9935KiB/s  | 7430   | 29.0MiB/s  | 10.9k  | 42.8MiB/s  | 13.6k  | 53.0MiB/s  | 1993   | 1994MiB/s  | 920    | 920MiB/s   |
| (cache=writeback)          | (1273%)  | (1270%)    | (101%) | (101%)     | (49%)  | (50%)      | (56%)  | (55%)      | (189%) | (189%)     | (82%)  | (82%)      |
| Windows Virtual Machine             | 4520     | 17.7MiB/s  | 18.8k  | 73.6MiB/s  | 23.3k  | 90.8MiB/s  | 21.8k  | 85.1MiB/s  | 2628   | 2628MiB/s  | 1191   | 1192MiB/s  |
| (cache=writeback,queues=4) | (2317%)  | (2263%)    | (2558%) | (2564%)   | (105%) | (105%)     | (89%)  | (89%)      | (249%) | (249%)     | (106%) | (106%)     |

#### Test Conclusions

1. Compared to physical machines, in 4KB random read/write, 1MB sequential read/write aspects, there is about 10% virtualization overhead. Virtual machine performance can be considered equivalent to physical machines. Due to caching effects, virtual machine performance even exceeds physical machines in some scenarios.
2. After enabling writeback and multi-queue, write performance has significant acceleration
3. In 4KB sequential read/write performance, virtual machines only have half the performance of physical machines. This is because disks use thin provision mode. Sequential read/write inside virtual machines actually becomes random read/write on physical machines. To improve virtual machine 4KB sequential read/write performance, virtual disk files need to be pre-allocated. This way sequential read/write inside virtual machines is also sequential read/write on physical machines.

### Shared Storage (ceph) IO Performance Testing

#### Test Environment

1. Host Configuration:

    OS: CentOS Linux release 7.9.2009 (Core)
    Kernel: 3.10.0-1062.4.3.el7.yn20191203.x86_64
    CPU: Intel(R) Xeon(R) CPU E5-2678 v3 @ 2.50GHz
    Memory: 256GB

2. Virtual Machine Configuration:

    OS: CentOS Linux release 7.6.1810 (Core)
    Kernel: 3.10.0-957.12.1.el7.x86_64
    Configuration: 4 cores CPU 4G memory 30G system disk 100G data disk

3. Ceph Storage Configuration

    Network Card: 2x10G dual optical port storage network + 2x10G dual optical port access network
    Disk: All-flash SSD

#### Test Data

| Scenario                     | 4KB      | Random Read    | 4KB   | Random Write    | 4KB  | Sequential Read    | 4KB   | Sequential Write    | 1MB | Sequential Read   | 1MB | Sequential Write   |
|--------------------------|---------:|:----------|------:|:----------|-----:|:----------|------:|:----------|----:|:---------|----:|:---------|
|                            | IOPS     | Throughput | IOPS   | Throughput | IOPS   | Throughput | IOPS   | Throughput | IOPS   | Throughput | IOPS   | Throughput |
| cache=none               | 1054     | 4217KiB/s |  405  | 1622KiB/s | 1864 | 7456KiB/s | 552   | 2209KiB/s | 159 | 159MiB/s | 163 | 164MiB/s |
| cache=none,queues=4      | 1152     | 4608KiB/s | 441   | 1767KiB/s | 2066 | 8265KiB/s | 368   | 1472KiB/s | 168 | 169MiB/s | 168 | 168MiB/s |
| cache=writeback          | 978      | 3913KiB/s | 9425  | 36.8MiB/s | 1623 | 6494KiB/s | 10.7k | 41.7MiB/s | 149 | 149MiB/s | 474 | 474MiB/s |
| cache=writeback,queues=4 | 1071     | 4284KiB/s | 12.6k | 49.3MiB/s | 1711 | 6848KiB/s | 15.1k | 59.1MiB/s | 161 | 161MiB/s | 475 | 475MiB/s |

#### Test Conclusions

1. Enabling writeback and multi-queue can significantly improve write performance
2. Read performance is relatively difficult to optimize. You can increase read ahead cache inside virtual machines (blockdev --setra /dev/sda)
3. Ceph did not saturate the network, nor did it fully utilize SSD performance. Performance bottleneck seems to be at the software level

### Network Testing

#### Test Conditions

1) By default, virtual machines have traffic limits. You need to change bandwidth to 0 on the frontend or using command line tool `climc server-change-bandwidth` to cancel rate limiting.

2) By default, VPC virtual machines' EIPs also have bandwidth limits (default 30Mbps). You also need to modify the limit to 0 on the frontend, or using climc to cancel the limit.

#### Test Method:

```bash
# Find a machine to run iperf server mode, assume ip is 10.127.100.3
$ iperf3 -s --bind 10.127.100.3

# On another machine, connect to server as iperf client mode
$ iperf3 -c 10.127.100.3 -t 30
```

Execute the above three times, take the best result.

#### Classic Network Performance Testing

##### Environment

1. Host Configuration:

    OS: CentOS Linux release 7.9.2009 (Core)
    Kernel: 3.10.0-1062.4.3.el7.yn20191203.x86_64
    CPU: Intel(R) Xeon(R) CPU E5-2678 v3 @ 2.50GHz
    Memory: 256GB

2. Virtual Machine Configuration:

    OS: CentOS Linux release 7.6.1810 (Core)
    Kernel: 3.10.0-957.12.1.el7.x86_64
    Configuration: 2 cores CPU 2G memory 30G system disk

##### Conclusion

| Source \ Destination | Physical Machine           | Virtual Machine            |
|-----------|------------------|-------------------|
| Physical Machine    | 8.35 Gbps (100%) | 8.40 Gbps (101%)  |
| Virtual Machine    | 8.41 Gbps (101%) | 8.33 Gbps (99.7%) |

Note: Saturated traffic testing, network virtualization overhead is very low (1% level).

#### VPC Network Performance Testing

##### Test Environment

1. Host Configuration:

    OS: CentOS Linux release 7.7.1908 (Core)
    Kernel: 5.4.130-1.yn20210710.el7.x86_64
    CPU: Intel(R) Xeon(R) Gold 5218R CPU @ 2.10GHz
    Memory: 256GB

2. Virtual Machine Configuration:

    OS: CentOS Linux release 7.8.2003
    Kernel: 3.10.0-1127.el7.x86_64
    Configuration: 2 cores CPU 2G memory 30G system disk

##### Conclusion

| Scenario        | Physical to Physical | Virtual to Virtual | Virtual EIP to Virtual EIP |
|-------------|----------------|----------------|----------------------|
| Performance (Gbps) | 9.19 (100%)    | 8.96 (97%)     | 5.83 (63%)           |

Note: Under saturated traffic conditions, network virtualization overhead is very low (3% level). Due to longer conversion paths, EIP performance is much worse (36% loss).

