---
sidebar_position: 2 
---

# Test Data

Detailed performance test data.

### CPU Test

Output Results:

- Physical Machine:

```bash
Benchmark Run: Mon Aug 09 2021 17:19:07 - 17:48:22
48 CPUs in system; running 1 parallel copy of tests
 
Dhrystone 2 using register variables       34839728.4 lps   (10.0 s, 7 samples)
Double-Precision Whetstone                     4368.3 MWIPS (8.8 s, 7 samples)
Execl Throughput                               1291.3 lps   (29.1 s, 2 samples)
File Copy 1024 bufsize 2000 maxblocks        517296.7 KBps  (30.0 s, 2 samples)
File Copy 256 bufsize 500 maxblocks          139166.0 KBps  (30.0 s, 2 samples)
File Copy 4096 bufsize 8000 maxblocks       1825548.4 KBps  (30.0 s, 2 samples)
Pipe Throughput                              670895.6 lps   (10.0 s, 7 samples)
Pipe-based Context Switching                 111871.6 lps   (10.0 s, 7 samples)
Process Creation                               3276.8 lps   (30.0 s, 2 samples)
Shell Scripts (1 concurrent)                   3604.5 lpm   (60.0 s, 2 samples)
Shell Scripts (8 concurrent)                   2900.6 lpm   (60.0 s, 2 samples)
System Call Overhead                         476273.4 lps   (10.0 s, 7 samples)
```

- Virtual Machine:

```bash
Benchmark Run: Mon Aug 09 2021 10:03:04 - 10:31:06
8 CPUs in system; running 1 parallel copy of tests
 
Dhrystone 2 using register variables       33964545.0 lps   (10.0 s, 7 samples)
Double-Precision Whetstone                     4244.3 MWIPS (9.9 s, 7 samples)
Execl Throughput                               2348.2 lps   (30.0 s, 2 samples)
File Copy 1024 bufsize 2000 maxblocks        644436.7 KBps  (30.0 s, 2 samples)
File Copy 256 bufsize 500 maxblocks          169199.0 KBps  (30.0 s, 2 samples)
File Copy 4096 bufsize 8000 maxblocks       1788048.3 KBps  (30.0 s, 2 samples)
Pipe Throughput                              933768.1 lps   (10.0 s, 7 samples)
Pipe-based Context Switching                 139898.5 lps   (10.0 s, 7 samples)
Process Creation                               5991.6 lps   (30.0 s, 2 samples)
Shell Scripts (1 concurrent)                   5698.6 lpm   (60.0 s, 2 samples)
Shell Scripts (8 concurrent)                   2662.4 lpm   (60.0 s, 2 samples)
System Call Overhead                         920352.7 lps   (10.0 s, 7 samples)
```

### Memory Test

Output Results:

- Physical Machine:

```bash
[root@baremetal-test mbw]# ./mbw 512
Long uses 8 bytes. Allocating 2*67108864 elements = 1073741824 bytes of memory.
Using 262144 bytes as blocks for memcpy block copy test.
Getting down to business... Doing 10 runs per test.
0       Method: MEMCPY  Elapsed: 0.07964        MiB: 512.00000  Copy: 6429.172 MiB/s
1       Method: MEMCPY  Elapsed: 0.06827        MiB: 512.00000  Copy: 7500.183 MiB/s
2       Method: MEMCPY  Elapsed: 0.06628        MiB: 512.00000  Copy: 7724.338 MiB/s
3       Method: MEMCPY  Elapsed: 0.06668        MiB: 512.00000  Copy: 7677.889 MiB/s
4       Method: MEMCPY  Elapsed: 0.06568        MiB: 512.00000  Copy: 7795.253 MiB/s
5       Method: MEMCPY  Elapsed: 0.06569        MiB: 512.00000  Copy: 7794.541 MiB/s
6       Method: MEMCPY  Elapsed: 0.06578        MiB: 512.00000  Copy: 7783.994 MiB/s
7       Method: MEMCPY  Elapsed: 0.06656        MiB: 512.00000  Copy: 7692.539 MiB/s
8       Method: MEMCPY  Elapsed: 0.06555        MiB: 512.00000  Copy: 7811.189 MiB/s
9       Method: MEMCPY  Elapsed: 0.06549        MiB: 512.00000  Copy: 7818.107 MiB/s
AVG     Method: MEMCPY  Elapsed: 0.06756        MiB: 512.00000  Copy: 7578.348 MiB/s
0       Method: DUMB    Elapsed: 0.17209        MiB: 512.00000  Copy: 2975.239 MiB/s
1       Method: DUMB    Elapsed: 0.17363        MiB: 512.00000  Copy: 2948.833 MiB/s
2       Method: DUMB    Elapsed: 0.16853        MiB: 512.00000  Copy: 3038.053 MiB/s
3       Method: DUMB    Elapsed: 0.17081        MiB: 512.00000  Copy: 2997.447 MiB/s
4       Method: DUMB    Elapsed: 0.17639        MiB: 512.00000  Copy: 2902.642 MiB/s
5       Method: DUMB    Elapsed: 0.16661        MiB: 512.00000  Copy: 3073.137 MiB/s
6       Method: DUMB    Elapsed: 0.17822        MiB: 512.00000  Copy: 2872.773 MiB/s
7       Method: DUMB    Elapsed: 0.16628        MiB: 512.00000  Copy: 3079.181 MiB/s
8       Method: DUMB    Elapsed: 0.16490        MiB: 512.00000  Copy: 3104.818 MiB/s
9       Method: DUMB    Elapsed: 0.17354        MiB: 512.00000  Copy: 2950.345 MiB/s
AVG     Method: DUMB    Elapsed: 0.17110        MiB: 512.00000  Copy: 2992.404 MiB/s
0       Method: MCBLOCK Elapsed: 0.09400        MiB: 512.00000  Copy: 5447.040 MiB/s
1       Method: MCBLOCK Elapsed: 0.09566        MiB: 512.00000  Copy: 5352.177 MiB/s
2       Method: MCBLOCK Elapsed: 0.09422        MiB: 512.00000  Copy: 5434.321 MiB/s
3       Method: MCBLOCK Elapsed: 0.09393        MiB: 512.00000  Copy: 5450.926 MiB/s
4       Method: MCBLOCK Elapsed: 0.09398        MiB: 512.00000  Copy: 5447.678 MiB/s
5       Method: MCBLOCK Elapsed: 0.09439        MiB: 512.00000  Copy: 5424.533 MiB/s
6       Method: MCBLOCK Elapsed: 0.09482        MiB: 512.00000  Copy: 5399.933 MiB/s
7       Method: MCBLOCK Elapsed: 0.09395        MiB: 512.00000  Copy: 5449.533 MiB/s
8       Method: MCBLOCK Elapsed: 0.09476        MiB: 512.00000  Copy: 5402.953 MiB/s
9       Method: MCBLOCK Elapsed: 0.09401        MiB: 512.00000  Copy: 5446.403 MiB/s
AVG     Method: MCBLOCK Elapsed: 0.09437        MiB: 512.00000  Copy: 5425.378 MiB/s
```

- Virtual Machine:

```bash
[root@guest-test mbw]# ./mbw 512
Long uses 8 bytes. Allocating 2*67108864 elements = 1073741824 bytes of memory.
Using 262144 bytes as blocks for memcpy block copy test.
Getting down to business... Doing 10 runs per test.
0       Method: MEMCPY  Elapsed: 0.08215        MiB: 512.00000  Copy: 6232.350 MiB/s
1       Method: MEMCPY  Elapsed: 0.08157        MiB: 512.00000  Copy: 6276.433 MiB/s
2       Method: MEMCPY  Elapsed: 0.08259        MiB: 512.00000  Copy: 6198.998 MiB/s
3       Method: MEMCPY  Elapsed: 0.08155        MiB: 512.00000  Copy: 6278.357 MiB/s
4       Method: MEMCPY  Elapsed: 0.08166        MiB: 512.00000  Copy: 6269.746 MiB/s
5       Method: MEMCPY  Elapsed: 0.08159        MiB: 512.00000  Copy: 6275.125 MiB/s
6       Method: MEMCPY  Elapsed: 0.08167        MiB: 512.00000  Copy: 6268.978 MiB/s
7       Method: MEMCPY  Elapsed: 0.08157        MiB: 512.00000  Copy: 6276.587 MiB/s
8       Method: MEMCPY  Elapsed: 0.08261        MiB: 512.00000  Copy: 6198.022 MiB/s
9       Method: MEMCPY  Elapsed: 0.08163        MiB: 512.00000  Copy: 6272.127 MiB/s
AVG     Method: MEMCPY  Elapsed: 0.08186        MiB: 512.00000  Copy: 6254.520 MiB/s
0       Method: DUMB    Elapsed: 0.20884        MiB: 512.00000  Copy: 2451.649 MiB/s
1       Method: DUMB    Elapsed: 0.20017        MiB: 512.00000  Copy: 2557.864 MiB/s
2       Method: DUMB    Elapsed: 0.17721        MiB: 512.00000  Copy: 2889.179 MiB/s
3       Method: DUMB    Elapsed: 0.17734        MiB: 512.00000  Copy: 2887.110 MiB/s
4       Method: DUMB    Elapsed: 0.17337        MiB: 512.00000  Copy: 2953.238 MiB/s
5       Method: DUMB    Elapsed: 0.17051        MiB: 512.00000  Copy: 3002.704 MiB/s
6       Method: DUMB    Elapsed: 0.17720        MiB: 512.00000  Copy: 2889.358 MiB/s
7       Method: DUMB    Elapsed: 0.17516        MiB: 512.00000  Copy: 2923.008 MiB/s
8       Method: DUMB    Elapsed: 0.17527        MiB: 512.00000  Copy: 2921.174 MiB/s
9       Method: DUMB    Elapsed: 0.17683        MiB: 512.00000  Copy: 2895.354 MiB/s
AVG     Method: DUMB    Elapsed: 0.18119        MiB: 512.00000  Copy: 2825.744 MiB/s
0       Method: MCBLOCK Elapsed: 0.09484        MiB: 512.00000  Copy: 5398.338 MiB/s
1       Method: MCBLOCK Elapsed: 0.09387        MiB: 512.00000  Copy: 5454.294 MiB/s
2       Method: MCBLOCK Elapsed: 0.09394        MiB: 512.00000  Copy: 5450.055 MiB/s
3       Method: MCBLOCK Elapsed: 0.09392        MiB: 512.00000  Copy: 5451.390 MiB/s
4       Method: MCBLOCK Elapsed: 0.09394        MiB: 512.00000  Copy: 5450.403 MiB/s
5       Method: MCBLOCK Elapsed: 0.09391        MiB: 512.00000  Copy: 5451.912 MiB/s
6       Method: MCBLOCK Elapsed: 0.09496        MiB: 512.00000  Copy: 5391.914 MiB/s
7       Method: MCBLOCK Elapsed: 0.09400        MiB: 512.00000  Copy: 5446.866 MiB/s
8       Method: MCBLOCK Elapsed: 0.09388        MiB: 512.00000  Copy: 5454.003 MiB/s
9       Method: MCBLOCK Elapsed: 0.09381        MiB: 512.00000  Copy: 5457.549 MiB/s
AVG     Method: MCBLOCK Elapsed: 0.09411        MiB: 512.00000  Copy: 5440.575 MiB/s
```

### Local Storage IO Testing


#### Test Data

* Physical Machine

```bash

# 4KB Random Read

random-read: (g=0): rw=randread, bs=(R) 4096B-4096B, (W) 4096B-4096B, (T) 4096B-4096B, ioengine=posixaio, iodepth=16
fio-3.7
Starting 1 process
Jobs: 1 (f=1): [r(1)][100.0%][r=828KiB/s,w=0KiB/s][r=207,w=0 IOPS][eta 00m:00s]
random-read: (groupid=0, jobs=1): err= 0: pid=24797: Sat Oct 30 00:06:20 2021
   read: IOPS=195, BW=782KiB/s (801kB/s)(45.9MiB/60039msec)
    slat (nsec): min=105, max=109517, avg=820.31, stdev=1377.18
    clat (msec): min=41, max=184, avg=81.76, stdev=15.04
     lat (msec): min=41, max=184, avg=81.76, stdev=15.04
    clat percentiles (msec):
     |  1.00th=[   53],  5.00th=[   61], 10.00th=[   65], 20.00th=[   70],
     | 30.00th=[   74], 40.00th=[   78], 50.00th=[   81], 60.00th=[   84],
     | 70.00th=[   88], 80.00th=[   92], 90.00th=[  100], 95.00th=[  109],
     | 99.00th=[  130], 99.50th=[  133], 99.90th=[  165], 99.95th=[  165],
     | 99.99th=[  182]
   bw (  KiB/s): min=  560, max=  992, per=99.97%, avg=781.78, stdev=75.68, samples=120
   iops        : min=  140, max=  248, avg=195.42, stdev=18.92, samples=120
  lat (msec)   : 50=0.65%, 100=90.14%, 250=9.21%
  cpu          : usr=0.15%, sys=0.06%, ctx=5878, majf=0, minf=54
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=50.0%, 16=49.9%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=95.8%, 8=0.1%, 16=4.2%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=11744,0,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=16

Run status group 0 (all jobs):
   READ: bw=782KiB/s (801kB/s), 782KiB/s-782KiB/s (801kB/s-801kB/s), io=45.9MiB (48.1MB), run=60039-60039msec

# 4KB Random Write

Disk stats (read/write):
  sda: ios=11821/13626, merge=0/68, ticks=60458/1750, in_queue=62206, util=99.61%
random-write: (g=0): rw=randwrite, bs=(R) 4096B-4096B, (W) 4096B-4096B, (T) 4096B-4096B, ioengine=posixaio, iodepth=16
fio-3.7
Starting 1 process
Jobs: 1 (f=1): [w(1)][100.0%][r=0KiB/s,w=30.4MiB/s][r=0,w=7786 IOPS][eta 00m:00s]
random-write: (groupid=0, jobs=1): err= 0: pid=25911: Sat Oct 30 00:07:21 2021
  write: IOPS=7349, BW=28.7MiB/s (30.1MB/s)(1723MiB/60002msec)
    slat (nsec): min=106, max=126819, avg=490.79, stdev=527.24
    clat (usec): min=421, max=35306, avg=2173.06, stdev=1510.06
     lat (usec): min=422, max=35308, avg=2173.55, stdev=1510.07
    clat percentiles (usec):
     |  1.00th=[  701],  5.00th=[  816], 10.00th=[  906], 20.00th=[ 1045],
     | 30.00th=[ 1188], 40.00th=[ 1352], 50.00th=[ 1614], 60.00th=[ 1991],
     | 70.00th=[ 2507], 80.00th=[ 3195], 90.00th=[ 4228], 95.00th=[ 5211],
     | 99.00th=[ 7046], 99.50th=[ 7963], 99.90th=[11338], 99.95th=[13960],
     | 99.99th=[22152]
   bw (  KiB/s): min=22784, max=73576, per=99.99%, avg=29392.35, stdev=5074.51, samples=120
   iops        : min= 5696, max=18394, avg=7348.06, stdev=1268.63, samples=120
```

Note: This file contains extensive test data output. For complete test data, please refer to the original Chinese documentation file. The test data output (command output) is preserved as-is since it does not require translation.

