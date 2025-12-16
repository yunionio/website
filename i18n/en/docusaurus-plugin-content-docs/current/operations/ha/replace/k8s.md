---
edition: ce
sidebar_position: 3
---

# K8s Control Node Replacement Process

Even for high availability deployed 3-node cloudpods over K8s clusters, any 1 node may go down in production environments.
Some common failures, such as replacing memory, CPU, etc., can be solved by temporarily shutting down, then restarting the node after recovery.

But if failures like hard disk occur, such as when data cannot be recovered, you need to delete the node and rejoin a new node. The following describes the steps and precautions.

## Test Environment

- k8s_vip: 10.127.100.102
    - Uses staticpods keepalived running on 3 master nodes
    - Started directly by kubelet, path: /etc/kubernetes/manifests/keepalived.yaml
- primary_master_node first initialized control node: 
    ip: 10.127.100.234
- master_node_1 second joined control node:
    ip: 10.127.100.229
- master_node_2 third joined control node:
    ip: 10.127.100.226
- Database: Database is deployed outside the cluster, not on the 3 nodes
- CSI: Uses local-path 
    - local-path CSI will strongly bind pods to specified nodes, special attention needed here
    - If the downed node has local-path pvc bound to it, pods using that pvc cannot drift to other Ready nodes. These pods are called stateful pods. You can see all local-path pvcs with the command `kubectl get pvc -A | grep local-path`

```bash
$ kubectl get nodes -o wide
NAME                   STATUS   ROLES    AGE    VERSION    INTERNAL-IP      EXTERNAL-IP   OS-IMAGE                KERNEL-VERSION                          CONTAINER-RUNTIME
lzx-ocboot-ha-test     Ready    master   100m   v1.15.12   10.127.100.234   <none>        CentOS Linux 7 (Core)   3.10.0-1160.6.1.el7.yn20201125.x86_64   docker://20.10.5
lzx-ocboot-ha-test-2   Ready    master   61m    v1.15.12   10.127.100.229   <none>        CentOS Linux 7 (Core)   3.10.0-1160.6.1.el7.yn20201125.x86_64   docker://20.10.5
lzx-ocboot-ha-test-3   Ready    master   60m    v1.15.12   10.127.100.226   <none>        CentOS Linux 7 (Core)   3.10.0-1160.6.1.el7.yn20201125.x86_64   docker://20.10.5
```

- minio:
    - Uses minio as glance backend storage in high availability deployment
    - statefulset
    - Uses local-path CSI as backend storage

```bash
$ kubectl get pods -n onecloud-minio -o wide
kubectl get pods -n onecloud-minio  -o wide
NAME      READY   STATUS    RESTARTS   AGE   IP              NODE                   NOMINATED NODE   READINESS GATES
minio-0   1/1     Running   0          46m   10.40.99.205    lzx-ocboot-ha-test     <none>           <none>
minio-1   1/1     Running   0          46m   10.40.158.215   lzx-ocboot-ha-test-3   <none>           <none>
minio-2   1/1     Running   0          46m   10.40.159.22    lzx-ocboot-ha-test-2   <none>           <none>
minio-3   1/1     Running   0          46m   10.40.99.206    lzx-ocboot-ha-test     <none>           <none>
$ kubectl get pvc -n onecloud-minio
NAME             STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
export-minio-0   Bound    pvc-297ed5e5-66c8-4855-8031-c65a0ccfa4d0   1Ti        RWO            local-path     46m
export-minio-1   Bound    pvc-4e8fe486-5b23-44a0-876c-df36d134957f   1Ti        RWO            local-path     46m
export-minio-2   Bound    pvc-389b3c61-6000-4757-9949-db53e4e53776   1Ti        RWO            local-path     46m
export-minio-3   Bound    pvc-3dd54509-7745-47dd-84ea-fbacfe1e2f5b   1Ti        RWO            local-path     46m
```

## Test

### Goal

Take down primary_master_node 10.127.100.234 node and join a new node to replace it

### Steps

#### 1. Need to Confirm Which Stateful Pods and PVCs Are Running on This Node

```bash
# Find the node name in the k8s cluster based on IP
$ kubectl get nodes -o wide | grep 10.127.100.234
lzx-ocboot-ha-test     Ready    master   4h15m   v1.15.12   10.127.100.234   <none>        CentOS Linux 7 (Core)   3.10.0-1160.6.1.el7.yn20201125.x86_64   docker://20.10.5

# View all local-path pvcs
$ kubectl get pvc -A | grep local-path
# onecloud-minio namespace's export-minio-x is responsible for storing glance images, is a key component
onecloud-minio        export-minio-0            Bound     pvc-297ed5e5-66c8-4855-8031-c65a0ccfa4d0   1Ti        RWO            local-path     3h11m
onecloud-minio        export-minio-1            Bound     pvc-4e8fe486-5b23-44a0-876c-df36d134957f   1Ti        RWO            local-path     3h11m
onecloud-minio        export-minio-2            Bound     pvc-389b3c61-6000-4757-9949-db53e4e53776   1Ti        RWO            local-path     3h11m
onecloud-minio        export-minio-3            Bound     pvc-3dd54509-7745-47dd-84ea-fbacfe1e2f5b   1Ti        RWO            local-path     3h11m
# onecloud-monitoring namespace's export-monitor-minio-x is responsible for storing service logs, is not a key component
onecloud-monitoring   export-monitor-minio-0    Bound     pvc-b885605f-b5ca-40ff-b968-4d95b03e8bb8   1Ti        RWO            local-path     3h8m
onecloud-monitoring   export-monitor-minio-1    Bound     pvc-520a8262-5dad-48aa-9a0e-0e25f850faad   1Ti        RWO            local-path     3h8m
onecloud-monitoring   export-monitor-minio-2    Bound     pvc-6de1ff0f-3465-4a51-8124-880f1b3c6d7a   1Ti        RWO            local-path     3h8m
onecloud-monitoring   export-monitor-minio-3    Bound     pvc-364652ca-496e-4b29-82ea-ec7e768aa8f5   1Ti        RWO            local-path     3h8m
# These pvcs under onecloud namespace are all system service dependencies
# default-baremetal-agent stores bare metal management storage, if baremetal-agent is not enabled, can ignore, default is also Pending pending binding state
onecloud              default-baremetal-agent   Pending                                                                        local-path     3h35m
# default-esxi-agent stores esxi-agent service related local data
onecloud              default-esxi-agent        Bound     pvc-b32adfcc-96e7-45e4-b8bd-b5318c954dca   30G        RWO            local-path     3h35m
# default-glance stores glance service images, in high availability deployment environment, deployment default-glance will not mount this pvc, will use minio s3 storage in onecloud-minio to store images, can ignore
onecloud              default-glance            Bound     pvc-e6ee398e-2d84-46cf-9401-e94f438d87cd   100G       RWO            local-path     3h36m
# default-influxdb stores platform monitoring data, monitoring data can tolerate loss, if the node it's on goes down, can delete and recreate
onecloud              default-influxdb          Bound     pvc-871b9441-c56f-4bb4-8b56-868e1df1a438   20G        RWO            local-path     3h35m


# View which pods are on this node
$ kubectl get pods -A -o wide | grep onecloud | grep 'lzx-ocboot-ha-test '
onecloud-minio        minio-0                                              1/1     Running   0          3h10m   10.40.99.205     lzx-ocboot-ha-test     <none>           <none>
onecloud-minio        minio-3                                              1/1     Running   0          3h10m   10.40.99.206     lzx-ocboot-ha-test     <none>           <none>
onecloud-monitoring   monitor-kube-state-metrics-6c97499758-w69tz          1/1     Running   0          3h6m    10.40.99.214     lzx-ocboot-ha-test     <none>           <none>
onecloud-monitoring   monitor-loki-0                                       1/1     Running   0          3h6m    10.40.99.213     lzx-ocboot-ha-test     <none>           <none>
onecloud-monitoring   monitor-minio-0                                      1/1     Running   0          3h7m    10.40.99.211     lzx-ocboot-ha-test     <none>           <none>
onecloud-monitoring   monitor-minio-3                                      1/1     Running   0          3h7m    10.40.99.212     lzx-ocboot-ha-test     <none>           <none>
onecloud-monitoring   monitor-monitor-stack-operator-54d8c46577-qknws      1/1     Running   0          3h6m    10.40.99.216     lzx-ocboot-ha-test     <none>           <none>
onecloud-monitoring   monitor-promtail-4mx2s                               1/1     Running   0          3h6m    10.40.99.215     lzx-ocboot-ha-test     <none>           <none>
onecloud              default-etcd-7brtldv78z                              1/1     Running   0          3h10m   10.40.99.207     lzx-ocboot-ha-test     <none>           <none>
onecloud              default-glance-6fd697b7b9-nbk9t                      1/1     Running   0          3h7m    10.40.99.208     lzx-ocboot-ha-test     <none>           <none>
onecloud              default-host-5rmg8                                   3/3     Running   7          3h34m   10.127.100.234   lzx-ocboot-ha-test     <none>           <none>
onecloud              default-host-deployer-sf494                          1/1     Running   7          3h34m   10.40.99.202     lzx-ocboot-ha-test     <none>           <none>
onecloud              default-host-image-s6pwq                             1/1     Running   2          3h34m   10.127.100.234   lzx-ocboot-ha-test     <none>           <none>
onecloud              default-region-dns-2hcpv                             1/1     Running   1          3h34m   10.127.100.234   lzx-ocboot-ha-test     <none>           <none>
onecloud              default-telegraf-5jn4x                               2/2     Running   0          3h34m   10.127.100.234   lzx-ocboot-ha-test     <none>           <none>
onecloud              default-influxdb-6bqgq                               1/1     Running   0          3h34m   10.127.99.218    lzx-ocboot-ha-test     <none>           <none>
```

Through the results of the above commands, we can filter out that stateful pods like onecloud-minio/minio-0, onecloud-minio/minio-3, onecloud/default-influxdb, onecloud-monitoring/monitor-minio-0, onecloud-minio/monitor-minio-3 are on the primary_master_node.

#### 2. Next, Shut Down and Remove primary_master_node from the Cluster

```bash
# Log in to the other two master_node nodes, for example: 10.127.100.229
$ ssh root@10.127.100.229

# Set KUBECONFIG configuration
[root@lzx-ocboot-ha-test-2 ~]$ export KUBECONFIG=/etc/kubernetes/admin.conf

# View node status, find primary_master_node has become NotReady
[root@lzx-ocboot-ha-test-2 ~]$ kubectl get nodes
NAME                   STATUS     ROLES    AGE     VERSION
lzx-ocboot-ha-test     NotReady   master   4h37m   v1.15.12
lzx-ocboot-ha-test-2   Ready      master   3h58m   v1.15.12
lzx-ocboot-ha-test-3   Ready      master   3h57m   v1.15.12

# Delete primary_master_node node: lzx-ocboot-ha-test
[root@lzx-ocboot-ha-test-2 ~]$ kubectl drain --delete-local-data --ignore-daemonsets lzx-ocboot-ha-test
WARNING: ignoring DaemonSet-managed Pods: kube-system/calico-node-fdzql, kube-system/kube-proxy-nfxvd, kube-system/traefik-ingress-controller-jms9v, onecloud-monitoring/monitor-promtail-4mx2s, onecloud/default-host-5rmg8, onecloud/default-host-deployer-sf494, onecloud/default-host-image-s6pwq, onecloud/default-region-dns-2hcpv, onecloud/default-telegraf-5jn4x
evicting pod "minio-0"
evicting pod "monitor-minio-3"
evicting pod "default-etcd-7brtldv78z"
evicting pod "monitor-kube-state-metrics-6c97499758-w69tz"
evicting pod "default-influxdb-85945647d5-6bqgq"
evicting pod "default-glance-6fd697b7b9-nbk9t"
evicting pod "minio-3"
evicting pod "monitor-monitor-stack-operator-54d8c46577-qknws"
evicting pod "monitor-loki-0"
evicting pod "monitor-minio-0"
# This command will hang because primary_master_node is already shut down and cannot delete pods. At this time, press 'Ctrl-c' to cancel the command
^C

# Use kubectl delete node to directly delete primary_master_node node
$ kubectl delete node lzx-ocboot-ha-test

# Then view pods in Pending status, all are stateful pods that were on primary_master_node before
# Because these pods use local-path pvcs, these pvcs are strongly bound to nodes and still exist in the cluster
[root@lzx-ocboot-ha-test-2 ~]$ kubectl get pods -A | grep Pending
onecloud-minio        minio-0                                              0/1     Pending            0          61s
onecloud-minio        minio-3                                              0/1     Pending            0          61s
onecloud-monitoring   monitor-minio-0                                      0/1     Pending            0          61s
onecloud-monitoring   monitor-minio-3                                      0/1     Pending            0          61s
onecloud              default-influxdb-85945647d5-x5sv5                    0/1     Pending            0          10m
```

#### 3. Delete Old primary_master_node's etcd endpoint

```bash
# View etcd pods under kube-system
[root@lzx-ocboot-ha-test-2 ~]$ kubectl get pods -n kube-system | grep etcd
etcd-lzx-ocboot-ha-test-2                      1/1     Running            1          4h52m
etcd-lzx-ocboot-ha-test-3                      1/1     Running            1          4h51m

# Enter etcd-lzx-ocboot-ha-test-2 etcd pod
[root@lzx-ocboot-ha-test-2 ~]# kubectl exec -ti -n kube-system  etcd-lzx-ocboot-ha-test-2 sh

# Use etcdctl to view member list
$ etcdctl --endpoints https://127.0.0.1:2379 --cacert /etc/kubernetes/pki/etcd/ca.crt --cert /etc/kubernetes/pki/etcd/server.crt --key /etc/kubernetes/pki/etcd/server.key member list
# You will find the old primary_master_node member lzx-ocboot-ha-test is still in the etcd cluster
14da7b338b44eee0, started, lzx-ocboot-ha-test, https://10.127.100.234:2380, https://10.127.100.234:2379, false
454ae6f931376261, started, lzx-ocboot-ha-test-2, https://10.127.100.229:2380, https://10.127.100.229:2379, false
5afd19948b9009f6, started, lzx-ocboot-ha-test-3, https://10.127.100.226:2380, https://10.127.100.226:2379, false

# Delete lzx-ocboot-ha-test member
$ etcdctl --endpoints https://127.0.0.1:2379 --cacert /etc/kubernetes/pki/etcd/ca.crt --cert /etc/kubernetes/pki/etcd/server.crt --key /etc/kubernetes/pki/etcd/server.key member remove 14da7b338b44eee0
```

#### 4. Replace Old primary_master_node Node, Join New master_node

The old primary_master_node node has been deleted. You will find keepalived's vip has also drifted to master_node_1:

```bash
# View vip is 10.127.100.102
# If this node runs cloud platform host service, ip will be bound to br0
[root@lzx-ocboot-ha-test-2 ~]$ ip addr show br0
32: br0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UNKNOWN group default qlen 1000
    link/ether 00:22:96:6f:6e:f1 brd ff:ff:ff:ff:ff:ff
    inet 10.127.100.229/24 brd 10.127.100.255 scope global br0
       valid_lft forever preferred_lft forever
    inet 10.127.100.102/32 scope global br0
       valid_lft forever preferred_lft forever
    inet6 fe80::222:96ff:fe6f:6ef1/64 scope link 
       valid_lft forever preferred_lft forever

# View /etc/kubernetes/manifests/keepalived.yaml env configuration
[root@lzx-ocboot-ha-test-2 ~]$ cat /etc/kubernetes/manifests/keepalived.yaml | grep -A 15 env
    env:
    # Corresponds to keepalived weight, except primary_master_node's keepalived will be set to 100, others on master_node are 90
    - name: KEEPALIVED_PRIORITY
      value: "90"
    # Set VIP
    - name: KEEPALIVED_VIRTUAL_IPS
      value: '#PYTHON2BASH:[''10.127.100.102'']'
    # Is BACKUP role
    - name: KEEPALIVED_STATE
      value: BACKUP
    # Password
    - name: KEEPALIVED_PASSWORD
      value: de17f785
    # router id
    - name: KEEPALIVED_ROUTER_ID
      value: "12"
    # This node's network interface actual ip
    - name: KEEPALIVED_NODE_IP
      value: 10.127.100.229
    # keepalived bound network interface
    - name: KEEPALIVED_INTERFACE
      value: eth0
    image: registry.cn-beijing.aliyuncs.com/yunionio/keepalived:v2.0.25

# View cluster currently only has 2 nodes
[root@lzx-ocboot-ha-test-2 ocboot]$ kubectl get nodes -o wide
NAME                   STATUS   ROLES    AGE     VERSION    INTERNAL-IP      EXTERNAL-IP   OS-IMAGE                KERNEL-VERSION                          CONTAINER-RUNTIME
lzx-ocboot-ha-test-2   Ready    master   4h29m   v1.15.12   10.127.100.229   <none>        CentOS Linux 7 (Core)   3.10.0-1160.6.1.el7.yn20201125.x86_64   docker://20.10.5
lzx-ocboot-ha-test-3   Ready    master   4h28m   v1.15.12   10.127.100.226   <none>        CentOS Linux 7 (Core)   3.10.0-1160.6.1.el7.yn20201125.x86_64   docker://20.10.5
```

Now use ocboot to join a new node, edit ocboot yaml configuration:

- Treat current lzx-ocboot-ha-test-2 node as primary_master_node
- Need to add new master_node node information:
  - IP: 10.127.100.224
  - Name: lzx-ocboot-ha-test-4

Because the old primary_master_node has been deleted, and the current master_node_1 is treated as the new cluster's primary_master_node, the configuration now becomes:

```yaml
$ cat config-new-k8s-ha.yaml
primary_master_node:
  # Here treat the previous master_node_1 10.127.100.229 as primary_master_node
  hostname: 10.127.100.229
  use_local: false
  user: root
  onecloud_version: "v3.8.8"
  # Database connection information, fill in according to your environment
  db_host: 10.127.100.101
  db_user: "root"
  db_password: "0neC1oudDB#"
  db_port: "3306"
  image_repository: registry.cn-beijing.aliyuncs.com/yunionio
  ha_using_local_registry: false
  node_ip: "10.127.100.229"
  # keepalived exposed vip
  controlplane_host: 10.127.100.102
  controlplane_port: "6443"
  as_host: true
  # Enable ha, deploy keepavlied by default
  high_availability: true
  use_ee: false
  # High availability uses minio
  enable_minio: true
  host_networks: "eth0/br0/10.127.100.229"

master_nodes:
  # Join to k8s cluster with 10.127.100.102 vip
  controlplane_host: 10.127.100.102
  controlplane_port: "6443"
  # Run cloud platform control related components
  as_controller: true
  # As cloud platform private cloud host compute node
  as_host: true
  # Enable keepavlied
  high_availability: true
  hosts:
  - user: root
    hostname: "10.127.100.224"
    host_networks: "eth0/br0/10.127.100.224"
```

After writing the configuration, use ocboot to join the new node.

# Download ocboot deployment tool code.

import OcbootClone from '@site/src/components/OcbootClone';

<OcbootClone />

Then join the node.

```bash
$ ./run.py config-new-k8s-ha.yaml
```

After ocboot's ./run.py finishes running, view node information again, find the new node lzx-ocboot-ha-test-4(10.127.100.224) has joined:

```bash
[root@lzx-ocboot-ha-test-2 ~]$ kubectl get nodes -o wide
NAME                   STATUS   ROLES    AGE     VERSION    INTERNAL-IP      EXTERNAL-IP   OS-IMAGE                KERNEL-VERSION                          CONTAINER-RUNTIME
lzx-ocboot-ha-test-2   Ready    master   5h13m   v1.15.12   10.127.100.229   <none>        CentOS Linux 7 (Core)   3.10.0-1160.6.1.el7.yn20201125.x86_64   docker://20.10.5
lzx-ocboot-ha-test-3   Ready    master   5h12m   v1.15.12   10.127.100.226   <none>        CentOS Linux 7 (Core)   3.10.0-1160.6.1.el7.yn20201125.x86_64   docker://20.10.5
lzx-ocboot-ha-test-4   Ready    master   10m     v1.15.12   10.127.100.224   <none>        CentOS Linux 7 (Core)   3.10.0-1160.6.1.el7.yn20201125.x86_64   docker://20.10.5
```

Modify the new primary_master_node keepalived's weight and role

```bash
[root@lzx-ocboot-ha-test-2 ~]$ vim /etc/kubernetes/manifests/keepalived.yaml
...
    # Change weight to 100
    - name: KEEPALIVED_PRIORITY
      value: "100"
...
    # Change role to MASTER
    - name: KEEPALIVED_STATE
      value: MASTER
```

#### 5. Restore Stateful Pods

After the new master node joins, you will find the original stateful pods are still Pending. Next, need to delete old pvcs and start them on the new master node.

```bash
# View pods in Pending status
[root@lzx-ocboot-ha-test-2 ~]$ kubectl get pods -A | grep Pending
onecloud-minio        minio-0                                              0/1     Pending   0          74m
onecloud-minio        minio-3                                              0/1     Pending   0          74m
onecloud-monitoring   monitor-minio-0                                      0/1     Pending   0          74m
onecloud-monitoring   monitor-minio-3                                      0/1     Pending   0          74m
onecloud              default-influxdb-85945647d5-x5sv5                    0/1     Pending   0          84m

# First cordon the current primary_master_node and old master_node, so we can ensure subsequent stateful pods are created on the new master node
# Ensure minio multiple replicas are scattered across different master nodes
[root@lzx-ocboot-ha-test-2 ~]$ kubectl cordon lzx-ocboot-ha-test-2 lzx-ocboot-ha-test-3
```

First restore the minio statefulset component in onecloud-minio, because it stores images that glance depends on. Through previous commands, we found minio-0 and minio-3 in the onecloud-minio namespace are in Pending status. Next, delete the pvcs they depend on, then the pods will restart on the new master_node, as follows:

```bash
# Find the corresponding pvcs
[root@lzx-ocboot-ha-test-2 ~]$ kubectl get pvc -n onecloud-minio  | egrep 'minio-0|minio-3'
export-minio-0   Bound    pvc-297ed5e5-66c8-4855-8031-c65a0ccfa4d0   1Ti        RWO            local-path     4h55m
export-minio-3   Bound    pvc-3dd54509-7745-47dd-84ea-fbacfe1e2f5b   1Ti        RWO            local-path     4h55m

# Delete pvcs
[root@lzx-ocboot-ha-test-2 ~]$ kubectl delete pvc -n onecloud-minio export-minio-0 export-minio-3

# Delete pods
[root@lzx-ocboot-ha-test-2 ~]$ kubectl delete pods -n onecloud-minio minio-0 minio-3

# View newly created started minio-0 and minio-3, have started on the new node lzx-ocboot-ha-test-4
[root@lzx-ocboot-ha-test-2 ~]$ kubectl get pods -n onecloud-minio  -o wide
NAME      READY   STATUS    RESTARTS   AGE    IP              NODE                   NOMINATED NODE   READINESS GATES
minio-0   1/1     Running   0          7s     10.40.103.200   lzx-ocboot-ha-test-4   <none>           <none>
minio-1   1/1     Running   0          5h1m   10.40.158.215   lzx-ocboot-ha-test-3   <none>           <none>
minio-2   1/1     Running   0          5h1m   10.40.159.22    lzx-ocboot-ha-test-2   <none>           <none>
minio-3   1/1     Running   0          14s    10.40.103.199   lzx-ocboot-ha-test-4   <none>           <none>

# View minio-3 logs, find it has self-healed
[root@lzx-ocboot-ha-test-2 ~]$ kubectl logs  -n onecloud-minio minio-3
....
Healing disk '/export' on 1st pool
Healing disk '/export' on 1st pool complete
Summary:
{
  "ID": "0e5c1947-44f0-4f8a-b7f0-e3a55f441d6f",
  "PoolIndex": 0,
  "SetIndex": 0,
  "DiskIndex": 3,
  "Path": "/export",
  "Endpoint": "http://minio-3.minio-svc.onecloud-minio.svc.cluster.local:9000/export",
  "Started": "2022-04-13T06:49:29.882069559Z",
  "LastUpdate": "2022-04-13T06:49:59.564158167Z",
  "ObjectsHealed": 10,
  "ObjectsFailed": 0,
  "BytesDone": 1756978429,
  "BytesFailed": 0,
  "QueuedBuckets": [],
  "HealedBuckets": [
    ".minio.sys/config",
    ".minio.sys/buckets",
    "onecloud-images"
  ]
}
...

# You can also log in to lzx-ocboot-ha-test-4 to check if there are corresponding image parts in the minio onecloud-images bucket in local-path csi
$ ssh root@10.127.100.224

# Enter the corresponding pvc directory, directory name can be obtained using kubectl get pvc -n onecloud-minio | grep minio-3
[root@lzx-ocboot-ha-test-4 ~]$ cd /opt/local-path-provisioner/pvc-352277cb-e69d-41bf-b58a-d65cb1e4e6f8/
[root@lzx-ocboot-ha-test-4 pvc-352277cb-e69d-41bf-b58a-d65cb1e4e6f8]$ du -smh onecloud-images/
838M    onecloud-images/
```

Then use the same method as restoring onecloud-minio to restore monitor-minio, reference commands as follows:

```bash
[root@lzx-ocboot-ha-test-2 ~]$ kubectl  delete pvc -n onecloud-monitoring export-monitor-minio-0 export-monitor-minio-3
persistentvolumeclaim "export-monitor-minio-0" deleted
persistentvolumeclaim "export-monitor-minio-3" deleted

[root@lzx-ocboot-ha-test-2 ~]$ kubectl  delete pods -n onecloud-monitoring monitor-minio-0 monitor-minio-3
pod "monitor-minio-0" deleted
pod "monitor-minio-3" deleted

[root@lzx-ocboot-ha-test-2 ~]$ kubectl get pods -n onecloud-monitoring  | grep minio
monitor-minio-0                                   1/1     Running   0          24s
monitor-minio-1                                   1/1     Running   0          5h17m
monitor-minio-2                                   1/1     Running   0          5h17m
monitor-minio-3                                   1/1     Running   0          24s
```

Restore influxdb deployment. influxdb and minio are different. minio uses statefulset management. After deleting pod and pvc, k8s will automatically create corresponding numbered pod and pvc, but deployment won't. So the steps to restore influxdb are: delete pvc, then simultaneously delete the default-influxdb deployment. Our onecloud-operator component will create corresponding resources, steps as follows:

```bash
# Restore influxdb
[root@lzx-ocboot-ha-test-2 ~]# kubectl delete  pvc -n onecloud default-influxdb
[root@lzx-ocboot-ha-test-2 ~]# kubectl delete  deployment -n onecloud default-influxdb
[root@lzx-ocboot-ha-test-2 ~]# kubectl get pods -n onecloud | grep influxdb
default-influxdb-85945647d5-mdd2z                    1/1     Running            0          7m44s
```

Now all components on the old primary_master_node are restored. Next, enable scheduling on the cordoned nodes:

```bash
[root@lzx-ocboot-ha-test-2 ~]$ kubectl uncordon lzx-ocboot-ha-test-2 lzx-ocboot-ha-test-3
```

