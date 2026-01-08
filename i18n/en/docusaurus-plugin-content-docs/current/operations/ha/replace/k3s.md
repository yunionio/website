---
edition: ce
sidebar_position: 3
---

# K3s Control Node Replacement Process

:::tip
Starting from v3.11.8, clusters deployed using ocboot will be deployed to K3s clusters by default. This document applies to K3s deployment environments. Users using K8s deployment please refer to the document: [K8s Control Node Replacement Process](./k8s).
:::

Even for high availability deployed 3-node cloudpods over K3s clusters, any 1 node may go down in production environments.
Some common failures, such as replacing memory, CPU, etc., can be solved by temporarily shutting down, then restarting the node after recovery.

But if failures like hard disk occur, such as when data cannot be recovered, you need to delete the node and rejoin a new node. The following describes the steps and precautions.

## Test Environment

- k3s_vip: 192.168.0.66
    - Uses staticpods keepalived running on 3 master nodes
    - Started directly by k3s, path: /var/lib/rancher/k3s/agent/pod-manifests/keepalived.yaml
- primary_master_node first initialized control node: 
    ip: 192.168.0.254
- master_node_1 second joined control node:
    ip: 192.168.0.244
- master_node_2 third joined control node:
    ip: 192.168.0.243
- Database: Database is deployed outside the cluster, not on the 3 nodes
- CSI: Uses local-path 
    - local-path CSI will strongly bind pods to specified nodes, special attention needed here
    - If the downed node has local-path pvc bound to it, pods using that pvc cannot drift to other Ready nodes. These pods are called stateful pods. You can see all local-path pvcs with the command `kubectl get pvc -A | grep local-path`

```bash
$ kubectl get nodes -o wide
NAME           STATUS   ROLES                       AGE    VERSION        INTERNAL-IP     EXTERNAL-IP   OS-IMAGE                KERNEL-VERSION                    CONTAINER-RUNTIME
lzx-ha-env     Ready    control-plane,etcd,master   7d5h   v1.28.5+k3s1   192.168.0.254   <none>        CentOS Linux 7 (Core)   5.4.130-1.yn20230805.el7.x86_64   containerd://1.7.11-k3s2
lzx-ha-env-2   Ready    control-plane,etcd,master   7d5h   v1.28.5+k3s1   192.168.0.244   <none>        CentOS Linux 7 (Core)   5.4.130-1.yn20230805.el7.x86_64   containerd://1.7.11-k3s2
lzx-ha-env-3   Ready    control-plane,etcd,master   7d5h   v1.28.5+k3s1   192.168.0.243   <none>        CentOS Linux 7 (Core)   5.4.130-1.yn20230805.el7.x86_64   containerd://1.7.11-k3s2
```

- minio:
    - Uses minio as glance backend storage in high availability deployment
    - statefulset
    - Uses local-path CSI as backend storage

```bash
$ kubectl get pods -n onecloud-minio -o wide
NAME      READY   STATUS    RESTARTS   AGE     IP              NODE           NOMINATED NODE   READINESS GATES
minio-0   1/1     Running   0          5d22h   10.40.47.23     lzx-ha-env-2   <none>           <none>
minio-1   1/1     Running   0          14h     10.40.139.221   lzx-ha-env     <none>           <none>
minio-2   1/1     Running   0          2d20h   10.40.147.34    lzx-ha-env-3   <none>           <none>
minio-3   1/1     Running   0          2d20h   10.40.147.35    lzx-ha-env-3   <none>           <none>

$ kubectl get pvc -n onecloud-minio
NAME             STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
export-minio-0   Bound    pvc-9c052647-73c2-4eb8-a5f0-69abf6cfc898   1Ti        RWO            local-path     7d3h
export-minio-1   Bound    pvc-aaded012-d6ca-42b9-bc3a-c03da7c66ec8   1Ti        RWO            local-path     7d3h
export-minio-2   Bound    pvc-aae12617-3e12-4a27-9cd8-fef84e609b12   1Ti        RWO            local-path     7d3h
export-minio-3   Bound    pvc-721329f0-c961-43f4-a7cc-ccd0f650dbd0   1Ti        RWO            local-path     7d3h
```

## Test

### Goal

Take down primary_master_node 192.168.0.254 node and join a new node to replace it.

### Steps

#### 1. Need to Confirm Which Stateful Pods and PVCs Are Running on This Node

```bash
# Find the node name in the k8s cluster based on IP
$ kubectl get nodes -o wide | grep 192.168.0.254
lzx-ha-env     Ready    control-plane,etcd,master   7d5h   v1.28.5+k3s1   192.168.0.254   <none>        CentOS Linux 7 (Core)   5.4.130-1.yn20230805.el7.x86_64   containerd://1.7.11-k3s2

# View all local-path pvcs
$ kubectl get pvc -A | grep local-path
# onecloud-minio namespace's export-minio-x is responsible for storing glance images, is a key component
onecloud-minio        export-minio-0             Bound     pvc-9c052647-73c2-4eb8-a5f0-69abf6cfc898   1Ti        RWO            local-path     7d3h
onecloud-minio        export-minio-1             Bound     pvc-aaded012-d6ca-42b9-bc3a-c03da7c66ec8   1Ti        RWO            local-path     7d3h
onecloud-minio        export-minio-2             Bound     pvc-aae12617-3e12-4a27-9cd8-fef84e609b12   1Ti        RWO            local-path     7d3h
onecloud-minio        export-minio-3             Bound     pvc-721329f0-c961-43f4-a7cc-ccd0f650dbd0   1Ti        RWO            local-path     7d3h

# onecloud-monitoring namespace's export-monitor-minio-x is responsible for storing service logs, is not a key component
onecloud-monitoring   export-monitor-minio-0     Bound     pvc-9b2c4065-ea17-415c-bbec-840db89cf88e   1Ti        RWO            local-path     7d3h
onecloud-monitoring   export-monitor-minio-1     Bound     pvc-9cd740c2-0044-49df-8cfb-1ead09127b4a   1Ti        RWO            local-path     7d3h
onecloud-monitoring   export-monitor-minio-2     Bound     pvc-e5fc90f7-8457-43a6-9b50-b4244e53eff2   1Ti        RWO            local-path     7d3h
onecloud-monitoring   export-monitor-minio-3     Bound     pvc-7b2563db-7904-4297-9bed-bf6e0cb8f626   1Ti        RWO            local-path     7d3h

# These pvcs under onecloud namespace are all system service dependencies
# default-baremetal-agent stores bare metal management storage, if baremetal-agent is not enabled, can ignore, default is also Pending pending binding state
onecloud              default-baremetal-agent   Pending                                                                        local-path     3h35m
# default-glance stores glance service images, in high availability deployment environment, deployment default-glance will not mount this pvc, will use minio s3 storage in onecloud-minio to store images, can ignore
onecloud              default-glance            Pending
# default-victoria-metrics stores platform monitoring data, monitoring data can tolerate loss, if the node it's on goes down, can delete and recreate
onecloud              default-victoria-metrics   Bound     pvc-b0d78630-b4fd-4521-898d-e76b4b1f8e1b   20G        RWO            local-path     7d5h

# View which pods are on this node
$ kubectl get pods -A -o wide | grep onecloud | grep 'lzx-ha-env '
onecloud-minio        minio-1                                     1/1     Running     0               14h     10.40.139.221   lzx-ha-env     <none>           <none>
onecloud-monitoring   monitor-minio-1                             1/1     Running     0               14h     10.40.139.218   lzx-ha-env     <none>           <none>
onecloud              default-etcd-2lnzlkt4fc                     1/1     Running     0               14h     10.40.139.227   lzx-ha-env     <none>           <none>
onecloud              default-host-deployer-9fcck                 1/1     Running     0               31h     192.168.0.254   lzx-ha-env     <none>           <none>
onecloud              default-host-health-bxgbk                   1/1     Running     0               7d5h    192.168.0.254   lzx-ha-env     <none>           <none>
onecloud              default-host-image-h4m8v                    1/1     Running     0               7d5h    192.168.0.254   lzx-ha-env     <none>           <none>
onecloud              default-host-ntjrv                          3/3     Running     1 (14h ago)     31h     192.168.0.254   lzx-ha-env     <none>           <none>
onecloud              default-region-dns-8sdhs                    1/1     Running     0               31h     192.168.0.254   lzx-ha-env     <none>           <none>
onecloud              default-telegraf-p7zc4                      1/1     Running     0               7d5h    192.168.0.254   lzx-ha-env     <none>           <none>
```

Through the results of the above commands, we can filter out that stateful pods like onecloud-minio/minio-1 are on the primary_master_node.

#### 2. Next, Shut Down and Remove primary_master_node from the Cluster

```bash
# Log in to the other two master_node nodes, for example: 192.168.0.244
$ ssh root@192.168.0.244

# View node status, find primary_master_node has become NotReady
[root@lzx-ha-env-2 ~]# kubectl get nodes -o wide
NAME           STATUS     ROLES                       AGE    VERSION     
lzx-ha-env     NotReady   control-plane,etcd,master   7d6h   v1.28.5+k3s1
lzx-ha-env-2   Ready      control-plane,etcd,master   7d6h   v1.28.5+k3s1
lzx-ha-env-3   Ready      control-plane,etcd,master   7d6h   v1.28.5+k3s1

# Delete primary_master_node node: lzx-ha-env
[root@lzx-ha-env-2 ~]$ kubectl drain --delete-local-data --ignore-daemonsets lzx-ha-env
Warning: ignoring DaemonSet-managed Pods: kube-system/calico-node-dmcnq, kube-system/traefik-sj9gw, onecloud/default-host-deployer-9fcck, onecloud/default-host-health-bxgbk, onecloud/default-host-image-h4m8v, onecloud/default-host-ntjrv, onecloud/default-region-dns-8sdhs, onecloud/default-telegraf-p7zc4
evicting pod onecloud/default-etcd-2lnzlkt4fc
evicting pod onecloud-minio/minio-1
evicting pod onecloud-monitoring/monitor-minio-1
# This command will hang because primary_master_node is already shut down and cannot delete pods. At this time, press 'Ctrl-c' to cancel the command
^C

# Use kubectl delete node to directly delete primary_master_node node
$ kubectl delete node lzx-ha-env

# Then view pods in Pending status, all are stateful pods that were on primary_master_node before
# Because these pods use local-path pvcs, these pvcs are strongly bound to nodes and still exist in the cluster
[root@lzx-ha-env-2 ~]$ kubectl get pods -A | grep Pending
onecloud-minio        minio-1                                     0/1     Pending   0               11s
onecloud-monitoring   monitor-minio-1                             0/1     Pending   0               12s
onecloud              default-etcd-4pvj4fxc8g                     0/1     Pending   0               18m
```

#### 3. Delete Old primary_master_node's etcd endpoint

Download etcdctl:

```bash
$ wget https://github.com/etcd-io/etcd/releases/download/v3.5.5/etcd-v3.5.5-linux-amd64.tar.gz
$ tar xf etcd-v3.5.5-linux-amd64.tar.gz
$ cp etcd-v3.5.5-linux-amd64/etcdctl /usr/local/bin/
```

View etcd members

```bash
# Use etcdctl to view member list
$ etcdctl member list \
    --endpoints https://127.0.0.1:2379 \
    --cacert /var/lib/rancher/k3s/server/tls/etcd/server-ca.crt \
    --cert /var/lib/rancher/k3s/server/tls/etcd/client.crt \
    --key /var/lib/rancher/k3s/server/tls/etcd/client.key
```

You will find the old primary_master_node member lzx-ha-env is no longer in the etcd cluster.

```
ce0d368c9b2596df, started, lzx-ha-env-3-f8946fea, https://192.168.0.243:2380, https://192.168.0.243:2379, false
eed2e0188ca5085c, started, lzx-ha-env-2-110bc617, https://192.168.0.244:2380, https://192.168.0.244:2379, false
```

:::tip
If the lzx-ha-env node is still in the etcd cluster, you can use the following command to delete this member. Normally k3s automatically removes this member.

```
$ etcdctl member remove xxxxx-id \
    --endpoints https://127.0.0.1:2379 \
    --cacert /var/lib/rancher/k3s/server/tls/etcd/server-ca.crt \
    --cert /var/lib/rancher/k3s/server/tls/etcd/client.crt \
    --key /var/lib/rancher/k3s/server/tls/etcd/client.key
```
:::

#### 4. Replace Old primary_master_node Node, Join New master_node

The old primary_master_node node has been deleted. You will find keepalived's vip has drifted to the lzx-ha-env-2 node (vip may drift to any control node, need to manually check):

```bash
# View vip is 192.168.0.66
# If this node runs cloud platform host service, ip will be bound to br0
[root@lzx-ha-env-2 ~]$ ip addr show br0
18: br0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UNKNOWN group default qlen 1000
    link/ether 00:22:5f:cf:fa:66 brd ff:ff:ff:ff:ff:ff
    inet 192.168.0.244/24 brd 192.168.0.255 scope global br0
       valid_lft forever preferred_lft forever
    inet 192.168.0.66/32 scope global br0
       valid_lft forever preferred_lft forever
    inet6 fe80::222:5fff:fecf:fa66/64 scope link
       valid_lft forever preferred_lft forever

# View /var/lib/rancher/k3s/agent/pod-manifests/keepalived.yaml env configuration
[root@lzx-ha-env-2 ~]$ cat /var/lib/rancher/k3s/agent/pod-manifests/keepalived.yaml | grep -A 17 env
    env:
    # Corresponds to keepalived weight, except primary_master_node's keepalived will be set to 100, others on master_node are 90
    - name: KEEPALIVED_PRIORITY
      value: "90"
    # Set VIP
    - name: KEEPALIVED_VIRTUAL_IPS
      value: "#PYTHON2BASH:['192.168.0.66']"
    # Is BACKUP role
    - name: KEEPALIVED_STATE
      value: BACKUP
    # Password
    - name: KEEPALIVED_PASSWORD
      value: "MTkyLjE2"
    # router id
    - name: KEEPALIVED_ROUTER_ID
      value: "66"
    # This node's network interface actual ip
    - name: KEEPALIVED_NODE_IP
      value: "192.168.0.244"
    # keepalived bound network interface
    - name: KEEPALIVED_INTERFACE
      value: "eth0"
    # keepalived health check command
    - name: CHECK_KUBE_CMD
      value: "curl -k -XGET https://192.168.0.244:6443/healthz --cert /var/lib/rancher/k3s/server/tls/client-kube-apiserver.crt --key /var/lib/rancher/k3s/server/tls/client-kube-apiserver.key --cacert /var/lib/rancher/k3s/server/tls/client-ca.crt"

# View cluster currently only has 2 nodes
[root@lzx-ha-env-2 ocboot]$ kubectl get nodes -o wide
NAME           STATUS   ROLES                       AGE    VERSION        INTERNAL-IP     EXTERNAL-IP   OS-IMAGE                KERNEL-VERSION                    CONTAINER-RUNTIME
lzx-ha-env-2   Ready    control-plane,etcd,master   7d6h   v1.28.5+k3s1   192.168.0.244   <none>        CentOS Linux 7 (Core)   5.4.130-1.yn20230805.el7.x86_64   containerd://1.7.11-k3s2
lzx-ha-env-3   Ready    control-plane,etcd,master   7d6h   v1.28.5+k3s1   192.168.0.243   <none>        CentOS Linux 7 (Core)   5.4.130-1.yn20230805.el7.x86_64   containerd://1.7.11-k3s2
```

Download ocboot deployment tool code.

import OcbootReleaseDownload from '../../../getting-started/_parts/_quickstart-ocboot-release-download.mdx';

<OcbootReleaseDownload />

Now use ocboot to join a new node, edit ocboot yaml configuration:

- Treat current lzx-ha-env-2 node as primary_master_node
- Need to add new master_node node information:
  - IP: 192.168.0.239
  - Name: lzx-test-add-node

Because the old primary_master_node has been deleted, and the current master_node_1 is treated as the new cluster's primary_master_node, the configuration now becomes:

:::tip
- Before joining a new node, need to ensure master_node_1 can ssh passwordless login to the newly added node
- MySQL password can be queried with the following command:
```bash
[root@lzx-ha-env-2 ~]$ kubectl get oc -n onecloud -o yaml | grep mysql: -A 5
    mysql:
      host: 192.168.0.252
      password: 0neC1oudDB#
      port: 3306
      username: root
```
:::

```yaml
$ vim config-new-k8s-ha.yaml
primary_master_node:
  # Here treat the previous master_node_1 192.168.0.244 as primary_master_node
  hostname: 192.168.0.244
  use_local: false
  user: root
  onecloud_version: "v3.11.9"
  # Database connection information, fill in according to your environment
  db_host: 192.168.0.252
  db_user: "root"
  db_password: "0neC1oudDB#"
  db_port: "3306"
  image_repository: registry.cn-beijing.aliyuncs.com/yunionio
  ha_using_local_registry: false
  node_ip: "192.168.0.244"
  # keepalived exposed vip
  controlplane_host: 192.168.0.66
  controlplane_port: "6443"
  as_host: true
  # Enable ha, deploy keepavlied by default
  high_availability: true
  use_ee: false
  # High availability uses minio
  enable_minio: true
  host_networks: "eth0/br0/192.168.0.244"

master_nodes:
  # Join to k8s cluster with 192.168.0.66 vip
  controlplane_host: 192.168.0.66
  controlplane_port: "6443"
  # Run cloud platform control related components
  as_controller: true
  # As cloud platform private cloud host compute node
  as_host: true
  # Enable keepavlied
  high_availability: true
  hosts:
  - user: root
    hostname: "192.168.0.239"
    host_networks: "eth0/br0/192.168.0.239"
  - user: root
    hostname: "192.168.0.243"
    host_networks: "eth0/br0/192.168.0.243"
```

After writing the configuration, use ocboot to join the new node.

```bash
$ ./ocboot.sh run.py virt config-new-k8s-ha.yaml
```

After ocboot's ./run.py finishes running, view node information again, find the new node lzx-test-add-node(192.168.0.239) has joined:

```bash
$ kubectl get nodes -o wide
NAME                STATUS   ROLES                       AGE   VERSION        INTERNAL-IP     EXTERNAL-IP   OS-IMAGE                    KERNEL-VERSION                       CONTAINER-RUNTIME
lzx-ha-env-2        Ready    control-plane,etcd,master   8d    v1.28.5+k3s1   192.168.0.244   <none>        CentOS Linux 7 (Core)       5.4.130-1.yn20230805.el7.x86_64      containerd://1.7.11-k3s2
lzx-ha-env-3        Ready    control-plane,etcd,master   8d    v1.28.5+k3s1   192.168.0.243   <none>        CentOS Linux 7 (Core)       5.4.130-1.yn20230805.el7.x86_64      containerd://1.7.11-k3s2
lzx-test-add-node   Ready    control-plane,etcd,master   69m   v1.28.5+k3s1   192.168.0.239   <none>        openEuler 22.03 (LTS-SP3)   5.10.0-182.0.0.95.oe2203sp3.x86_64   containerd://1.7.11-k3s2
```

#### 5. Restore Stateful Pods

After the new master node joins, you will find the original stateful pods are still Pending. Next, need to delete old pvcs and start them on the new master node.

```bash
# View pods in Pending status
[root@lzx-ha-env-2 ~]$ kubectl get pods -A | grep Pending
onecloud-minio        minio-1                                     0/1     Pending             0             39m
onecloud-monitoring   monitor-minio-1                             0/1     Pending             0             35m

# First cordon the current primary_master_node and old master_node, so we can ensure subsequent stateful pods are created on the new master node
# Ensure minio multiple replicas are scattered across different master nodes
[root@lzx-ha-env-2 ~]$ kubectl cordon lzx-ha-env-2 lzx-ha-env-3
```

First restore the minio statefulset component in onecloud-minio, because it stores images that glance depends on. Through previous commands, we found minio-1 in the onecloud-minio namespace is in Pending status. Next, delete the pvc it depends on, then the pod will restart on the new master_node, as follows:

```bash
# Find the corresponding pvc
$ kubectl get pvc -n onecloud-minio  | egrep 'minio-1'
export-minio-1   Bound    pvc-aaded012-d6ca-42b9-bc3a-c03da7c66ec8   1Ti        RWO            local-path     8d

# Delete pvc
$ kubectl delete pvc -n onecloud-minio export-minio-1

# Delete pod
$ kubectl delete pods -n onecloud-minio minio-1

# View newly created started minio-1, has started on the new node
$ kubectl get pods -n onecloud-minio  -o wide
kubectl get pods -n onecloud-minio  -o wide
NAME      READY   STATUS              RESTARTS   AGE     IP             NODE                NOMINATED NODE   READINESS GATES
minio-0   1/1     Running             0          6d19h   10.40.47.23    lzx-ha-env-2        <none>           <none>
minio-1   0/1     ContainerCreating   0          34s     <none>         lzx-test-add-node   <none>           <none>
minio-2   1/1     Running             0          43m     10.40.147.13   lzx-ha-env-3        <none>           <none>
minio-3   1/1     Running             0          43m     10.40.147.23   lzx-ha-env-3        <none>           <none>

# View minio-1 logs, find it has self-healed
$ kubectl logs  -n onecloud-minio minio-1
....
Healing disk '/export' on 1st pool
Healing disk '/export' on 1st pool complete
Summary:
{
  "ID": "ab42567e-de12-4b4c-b8d1-9c0d85fa2196",
  "PoolIndex": 0,
  "SetIndex": 0,
  "DiskIndex": 1,
  "Path": "/export",
  "Endpoint": "http://minio-1.minio-svc.onecloud-minio.svc.cluster.local:9000/export",
  "Started": "2024-12-27T06:45:21.563513912Z",
  "LastUpdate": "2024-12-27T06:45:49.066891239Z",
  "ObjectsHealed": 10,
  "ObjectsFailed": 0,
  "BytesDone": 612353850,
  "BytesFailed": 0,
  "QueuedBuckets": [],
  "HealedBuckets": [
    ".minio.sys/config",
    ".minio.sys/buckets",
    "onecloud-images"
  ]
}
...

# You can also log in to lzx-test-add-node to check if there are corresponding image parts in the minio onecloud-images bucket in local-path csi
$ ssh root@10.127.100.224

# Enter the corresponding pvc directory, directory name can be obtained using kubectl get pvc -n onecloud-minio | grep minio-1
[root@lzx-test-add-node ~]$ cd /opt/k3s/storage/pvc-42778b3d-aa41-4d9e-a6b6-443ca0b09b3a_onecloud-minio_export-minio-1/
[root@lzx-test-add-node pvc-42778b3d-aa41-4d9e-a6b6-443ca0b09b3a_onecloud-minio_export-minio-1]$ du -smh onecloud-images/
293M    onecloud-images/
```

Then use the same method as restoring onecloud-minio to restore monitor-minio, reference commands as follows:

```bash
$ kubectl  delete pvc -n onecloud-monitoring export-monitor-minio-1
persistentvolumeclaim "export-monitor-minio-1" deleted

$ kubectl  delete pods -n onecloud-monitoring monitor-minio-1
pod "monitor-minio-1" deleted

$ kubectl get pods -n onecloud-monitoring  | grep minio
monitor-minio-0                                   1/1     Running   0          5h17m
monitor-minio-1                                   1/1     Running   0          24s
monitor-minio-2                                   1/1     Running   0          5h17m
monitor-minio-3                                   1/1     Running   0          5h17m
```

Restore victoria-metrics deployment. influxdb and minio are different. minio uses statefulset management. After deleting pod and pvc, k8s will automatically create corresponding numbered pod and pvc, but deployment won't. So the steps to restore victoria-metrics are: delete pvc, then simultaneously delete the default-victoria-metrics deployment. Our onecloud-operator component will create corresponding resources, steps as follows:

```bash
# Restore victoria-metrics
$ kubectl delete  pvc -n onecloud default-victoria-metrics
$ kubectl delete  deployment -n onecloud default-victoria-metrics
$ kubectl get pods -n onecloud -o wide | grep victoria-metrics
default-victoria-metrics-774fc8499b-4rjzx   0/1     ContainerCreating   0             7s      <none>          lzx-test-add-node   <none>           <none>
```

Now all components on the old primary_master_node are restored. Next, enable scheduling on the cordoned nodes:

```bash
$ kubectl uncordon lzx-ha-env-2 lzx-ha-env-3
```

