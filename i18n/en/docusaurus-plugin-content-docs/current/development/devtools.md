---
sidebar_position: 11
---

# Troubleshooting Tools

This section introduces tools and APIs that help debug service programs.

## Built-in APIs

Each service using the Cloudpods service framework will automatically register a series of APIs for obtaining key runtime metrics and status of the service, facilitating diagnosis of service program issues. They are introduced one by one below.

### Built-in Status APIs

| Request Method  | API Path       | climc Subcommand       | Description                                                                       |
|-----------|---------------|-------------------|-----------------------------------------------------------------------------|
| GET       | /stats        | api-stats-show    | Request statistics for each API URL of the corresponding service, cumulative request count, average request latency, etc.               |
| GET       | /db_stats     | db-stats-show     | Database statistics for the corresponding service, including maximum connections, active connections, etc.                          |
| GET       | /worker_stats | worker-stats-show | Statistics of workers in the goroutine pool within the corresponding service, including active count and queue length of each worker, etc. |
| GET       | /version      | version-show      | Service version number                                                                |

### Profile API

Cloudpods services have built-in golang profile tools (https://pkg.go.dev/net/http/pprof), and you can obtain service profile data by calling these APIs.

| Request Method | API Path              | Corresponding pprof Method |
|----------|----------------------|---------------|
| GET      | /debug/pprof/        | pprof.Index   |
| GET      | /debug/pprof/cmdline | pprof.Cmdline |
| GET      | /debug/pprof/profile | pprof.Profile |
| GET      | /debug/pprof/symbol  | pprof.Symbol  |
| POST     | /debug/pprof/symbol  | pprof.Symbol  |
| GET      | /debug/pprof/trace   | pprof.Trace   |

Starting from v3.10.4, profiling interfaces are disabled by default. If you need to enable them, please modify the corresponding service option enable_app_profiling to true and restart the service.

### Get Call Stack

You can send a SIGUSR1 signal to the service process to trigger the service process to print the current call stack. This method helps discover function call stacks where the program is blocked and find blocking function methods.

| Usage Scenario                                                                  | Possibly Involved Services                        |
|---------------------                                                      |----------------------                 |
| KVM host creation or related operations                                                   | region, host, host-deployer           |
| KVM image related                                                               | glance                                |
| VMware host related                                                            | region, esxi-agent, host-deployer     |
| Other host related                                                              | region                                |
| System running slowly                                                              | region, keystone                      |
| Deadlock                                                                      | -                                     |


- Log keywords:
    - queue full, task dropped
    - stucking for a while
    - WorkerManager task has been busy for 1923 cycles...

```bash

# Log in to the control node and list all service pods
$ kubectl get pods -n onecloud
NAME                                                 READY   STATUS             RESTARTS   AGE
default-ansibleserver-7b5d9857df-qbfbf               1/1     Running            0          10h
default-apigateway-75ddb7464d-xhbbv                  2/2     Running            0          10h
default-autoupdate-6fc9d9f9cc-jgfpl                  1/1     Running            0          10h
default-baremetal-agent-6bcc88655-ggtxb              1/1     Running            0          10h
default-climc-b8b6b5b86-lx24v                        1/1     Running            0          10h
default-cloudevent-759df4fd89-qpmfw                  1/1     Running            0          10h
default-cloudid-59f4798789-7sgjb                     1/1     Running            0          10h
default-cloudmon-7f9554cc9-vk8ht                     1/1     Running            0          10h
default-cloudnet-7dfd5f8485-9lf8v                    1/1     Running            0          10h
default-cloudproxy-645774fc44-jjn4n                  1/1     Running            0          10h
default-devtool-766dd9b758-qj6z6                     1/1     Running            0          10h
default-esxi-agent-569cdff69f-mcs8l                  1/1     Running            0          10h
default-etcd-7ldqpxjkm4                              1/1     Running            0          96d
default-glance-74df5dbf7f-hx4k9                      1/1     Running            0          10h
default-host-8nkh5                                   3/3     Running            0          10h
default-host-9db2z                                   3/3     Running            0          10h
default-host-deployer-6f6bx                          1/1     Running            0          10h
default-host-deployer-lkn2r                          1/1     Running            0          10h
default-host-deployer-tfrd2                          1/1     Running            0          10h
default-host-image-72wdn                             1/1     Running            13         34d
default-host-image-89rp8                             1/1     Running            0          34d
default-host-image-lzgnt                             1/1     Running            0          34d
default-host-image-nsvbs                             1/1     Running            0          34d
default-host-t42qb                                   3/3     Running            0          10h
default-influxdb-9465c896b-526t5                     1/1     Running            0          96d
default-itsm-fcc57bbf7-w24x2                         1/1     Running            0          10h
default-keystone-5f5f9f66d5-6x6j2                    1/1     Running            0          10h
default-kubeserver-94b9cc6cb-xdl58                   1/1     Running            0          10h
default-logger-7cb764b4c5-884vl                      1/1     Running            0          10h
default-meter-68dbd99767-4n9n8                       1/1     Running            0          10h
default-monitor-7868d6695f-dwprp                     1/1     Running            0          10h
default-notify-67dd949bd4-fpcdf                      11/11   Running            0          10h
default-onecloud-service-operator-858f7687ff-f5rtm   1/1     Running            0          10h
default-ovn-north-844bc977-pq28d                     1/1     Running            0          96d
default-region-65f4b4445d-lqklc                      1/1     Running            0          10h
default-region-dns-js5tc                             1/1     Running            0          10h
default-s3gateway-6d57886b6-xsgn7                    1/1     Running            0          10h
default-scheduler-69589964c8-br265                   1/1     Running            1          10h
default-suggestion-5d4b588449-b6fzk                  1/1     Running            0          10h
default-telegraf-6mwjs                               2/2     Running            0          9h
default-telegraf-9w9fp                               2/2     Running            0          9h
default-telegraf-sfpk7                               2/2     Running            0          10h
default-vpcagent-6459584bfc-8wvkl                    1/1     Running            0          10h
default-web-849dc55988-bxlws                         3/3     Running            1          10h
default-webconsole-75549f45dd-4nn6w                  1/1     Running            0          10h
default-yunionagent-hvkzw                            1/1     Running            0          10h
default-yunionconf-85bdb759d6-f6fzt                  1/1     Running            0          10h
onecloud-operator-c79f98c6c-lndnb                    0/1     CrashLoopBackOff   73         10h

# Here we use the region service as an example. View the region pod logs. You need to observe for a while to see if the log keywords listed above appear
$ kubectl logs -n onecloud default-region-65f4b4445d-lqklc --tail 10 -f

# Open another terminal and enter the region pod
$ kubectl exec -it -n onecloud default-region-65f4b4445d-lqklc -- /bin/sh

# First record the current service version information
$ /opt/yunion/bin/region -v
{
  "major": "0",
  "minor": "0",
  "gitVersion": "v3.8.8-20220330.0",
  "gitBranch": "release/3.8",
  "gitCommit": "8b24ebdac",
  "gitTreeState": "dirty",
  "buildDate": "2022-03-30T14:53:38Z",
  "goVersion": "go1.15.15",
  "compiler": "gc",
  "platform": "linux/amd64"
}

# Query the current service process pid. Here we see that the region pid is 1. The host service pid will be different
$ ps -elf | grep region
  1 root     42:02 /opt/yunion/bin/region --config /etc/yunion/region.conf
782 root      0:00 grep region

# Send signal `SIGUSR1` to the region service process to get process stack information kill -s SIGUSR1 <pid>
$ kill -s SIGUSR1 1

# The latest logs of the region service will dump stack information
$ kubectl logs -n onecloud default-region-65f4b4445d-lqklc --tail 10 -f
[info 220331 03:30:29 appsrv.(*Application).ServeHTTP(appsrv.go:246)] 9d0MzJpH6aqIdfUKdfMyUK4gNV4= 200 c3ee55 GET /groupguests?admin=true&details=false&filter.0=updated_at.ge%28%270001-01-01+00%3A00%3A00%27%29&filter.1=manager_id.isnullorempty%28%29&filter.2=external_id.isnullorempty%28%29&filter.3=cloud_env%3Donpremise&limit=1024&offset=0&order=asc&order_by.0=updated_at&show_emulated=false&system=true (10.105.87.255:8240:vpcagent) 1.77ms
[info 220331 03:30:29 appsrv.(*Application).ServeHTTP(appsrv.go:246)] 9d0MzJpH6aqIdfUKdfMyUK4gNV4= 200 f7dcf7 GET /groupnetworks?admin=true&details=false&filter.0=updated_at.ge%28%270001-01-01+00%3A00%3A00%27%29&filter.1=manager_id.isnullorempty%28%29&filter.2=external_id.isnullorempty%28%29&filter.3=cloud_env%3Donpremise&limit=1024&offset=0&order=asc&order_by.0=updated_at&show_emulated=false&system=true (10.105.87.255:8240:vpcagent) 1.77ms
[info 220331 03:30:30 appsrv.(*Application).ServeHTTP(appsrv.go:246)] 9d0MzJpH6aqIdfUKdfMyUK4gNV4= 200 3985fa PUT /storages/1b5895d9-3517-4e45-84f0-59db7660d840 (10.40.180.64:44988) 53.49ms
goroutine profile: total 83
9 @ 0x43c425 0x44c58f 0xb5230d 0x472521
#	0xb5230c	github.com/go-sql-driver/mysql.(*mysqlConn).startWatcher.func1+0xcc	/root/go/src/yunion.io/x/onecloud/vendor/github.com/go-sql-driver/mysql/connection.go:621

8 @ 0x43c425 0x44c58f 0xaac0da 0x472521
#	0xaac0d9	google.golang.org/grpc.newClientStream.func5+0xd9	/root/go/src/yunion.io/x/onecloud/vendor/google.golang.org/grpc/stream.go:318

5 @ 0x43c425 0x40856f 0x4081eb 0x10aab8f 0x472521
#	0x10aab8e	yunion.io/x/onecloud/pkg/cloudcommon/etcd.(*SEtcdClient).Watch.func1+0x24e	/root/go/src/yunion.io/x/onecloud/pkg/cloudcommon/etcd/etcd.go:332

5 @ 0x43c425 0x44c58f 0x4a385a 0x472521
#	0x4a3859	context.propagateCancel.func1+0xd9	/usr/lib/go/src/context/context.go:279

5 @ 0x43c425 0x44c58f 0xa6e693 0xa6e2b0 0xa6f475 0x4b2087 0xa6f3b2 0xa6f36f 0xa9ddc3 0xa9e9ed 0xa9f35b 0xaa6a4e 0xaac666 0xaa50be 0xaa5d65 0xc662c2 0xd22a5c 0x472521
#	0xa6e692	google.golang.org/grpc/internal/transport.(*recvBufferReader).readClient+0xd2	/root/go/src/yunion.io/x/onecloud/vendor/google.golang.org/grpc/internal/transport/transport.go:186
#	0xa6e2af	google.golang.org/grpc/internal/transport.(*recvBufferReader).Read+0x18f	/root/go/src/yunion.io/x/onecloud/vendor/google.golang.org/grpc/internal/transport/transport.go:166
#	0xa6f474	google.golang.org/grpc/internal/transport.(*transportReader).Read+0x54		/root/go/src/yunion.io/x/onecloud/vendor/google.golang.org/grpc/internal/transport/transport.go:479
#	0x4b2086	io.ReadAtLeast+0x86								/usr/lib/go/src/io/io.go:314
#	0xa6f3b1	io.ReadFull+0xd1								/usr/lib/go/src/io/io.go:333
#	0xa6f36e	google.golang.org/grpc/internal/transport.(*Stream).Read+0x8e			/root/go/src/yunion.io/x/onecloud/vendor/google.golang.org/grpc/internal/transport/transport.go:463
#	0xa9ddc2	google.golang.org/grpc.(*parser).recvMsg+0x62					/root/go/src/yunion.io/x/onecloud/vendor/google.golang.org/grpc/rpc_util.go:510
#	0xa9e9ec	google.golang.org/grpc.recvAndDecompress+0x4c					/root/go/src/yunion.io/x/onecloud/vendor/google.golang.org/grpc/rpc_util.go:641
#	0xa9f35a	google.golang.org/grpc.recv+0x9a						/root/go/src/yunion.io/x/onecloud/vendor/google.golang.org/grpc/rpc_util.go:709
#	0xaa6a4d	google.golang.org/grpc.(*csAttempt).recvMsg+0xed				/root/go/src/yunion.io/x/onecloud/vendor/google.golang.org/grpc/stream.go:884
#	0xaac665	google.golang.org/grpc.(*clientStream).RecvMsg.func1+0x45			/root/go/src/yunion.io/x/onecloud/vendor/google.golang.org/grpc/stream.go:735
#	0xaa50bd	google.golang.org/grpc.(*clientStream).withRetry+0x37d				/root/go/src/yunion.io/x/onecloud/vendor/google.golang.org/grpc/stream.go:589
#	0xaa5d64	google.golang.org/grpc.(*clientStream).RecvMsg+0x104				/root/go/src/yunion.io/x/onecloud/vendor/google.golang.org/grpc/stream.go:734
#	0xc662c1	go.etcd.io/etcd/api/v3/etcdserverpb.(*watchWatchClient).Recv+0x61		/root/go/src/yunion.io/x/onecloud/vendor/go.etcd.io/etcd/api/v3/etcdserverpb/rpc.pb.go:6714
#	0xd22a5b	go.etcd.io/etcd/client/v3.(*watchGrpcStream).serveWatchClient+0x5b		/root/go/src/yunion.io/x/onecloud/vendor/go.etcd.io/etcd/client/v3/watch.go:757

5 @ 0x43c425 0x44c58f 0xd1fedc 0x472521
#	0xd1fedb	go.etcd.io/etcd/client/v3.(*watchGrpcStream).run+0x37b	/root/go/src/yunion.io/x/onecloud/vendor/go.etcd.io/etcd/client/v3/watch.go:537

5 @ 0x43c425 0x44c58f 0xd22ea5 0x472521
#	0xd22ea4	go.etcd.io/etcd/client/v3.(*watchGrpcStream).serveSubstream+0x284	/root/go/src/yunion.io/x/onecloud/vendor/go.etcd.io/etcd/client/v3/watch.go:803

3 @ 0x43c425 0x40856f 0x4081ab 0xa95a89 0x472521
#	0xa95a88	google.golang.org/grpc.(*addrConn).resetTransport+0x768	/root/go/src/yunion.io/x/onecloud/vendor/google.golang.org/grpc/clientconn.go:1156

3 @ 0x43c425 0x40856f 0x4081eb 0x10aa8b8 0x472521
#	0x10aa8b7	yunion.io/x/onecloud/pkg/cloudcommon/etcd.(*SEtcdClient).startSession.func1+0x37	/root/go/src/yunion.io/x/onecloud/pkg/cloudcommon/etcd/etcd.go:170 

```

- Submit the collected service version information and stack information to GitHub issues: [https://github.com/yunionio/cloudpods/issues](https://github.com/yunionio/cloudpods/issues)

### Get Virtual Machine Creation Scheduling Failure Logs

```bash

# Log in to the control node and list the scheduling task list

$ climc scheduler-history-list
+---------------+---------------------+-----------+-------------+---------------+
||  session_id   |        time         |  status   |  consuming  | is_suggestion |
|+---------------+---------------------+-----------+-------------+---------------+
|| 1715168194022 | 2024-05-08 11:36:34 | 1 success | 64.687915ms | false         |
|| 1715167938185 | 2024-05-08 11:32:18 | 1 failed  | 0s          | false         |
|| 1715167849319 | 2024-05-08 11:30:49 | 1 failed  | 0s          | false         |
|| 1715167815198 | 2024-05-08 11:30:15 | 1 success | 58.733867ms | false         |
|| 1715153101591 | 2024-05-08 07:25:01 | 1 success | 36.752624ms | false         |
|| 1715077940402 | 2024-05-07 10:32:20 | 1 success | 23.926726ms | false         |
|| 1715009657333 | 2024-05-06 15:34:17 | 1 success | 32.592824ms | false         |
|+---------------+---------------------+-----------+-------------+---------------+
***  Total: 7 Pages: 1 Limit: 7 Offset: 0 Page: 1  ***

# Find the most recent session_id with status = failed, here it is 1715167938185

$ climc scheduler-history-show --raw --log 1715167938185
consuming: 0s
error: 'genericScheduler.Schedule: No resource are avaliable that match all of the
  following predicates: filter by baremetal_status(-1), session_id="1715167938185"'
  ...
  ...
  ...
time: "2024-05-08 11:32:18"

```

