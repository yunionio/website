---
edition: ce
sidebar_position: 3
---

# K3s 控制节点替换流程

:::tip
从 v3.11.8 开始，使用 ocboot 部署的集群默认会部署到 K3s 集群上，本文档适用于 K3s 部署的环境。使用 K8s 部署的用户请参考文档：[K8s 控制节点替换流程](./k8s)。
:::

即使是高可用部署的 3 节点 cloudpods over K3s 集群，在生产环境可能会出现任意 1 个节点挂掉的情况。
一些普通的故障，比如更换内存，CPU 之类可以解决的问题，可以临时关机，恢复后再重启节点解决。

但如果发生硬盘之类的故障，比如数据无法恢复的情况，需要把该节点删除再重新加入新的节点，接下来描述该步骤以及注意事项。

## 测试环境

- k3s_vip: 192.168.0.66
    - 使用 staticpods keepalived 运行在 3 个 master 节点上
    - 由 k3s 直接启动，路径在：/var/lib/rancher/k3s/agent/pod-manifests/keepalived.yaml
- primary_master_node 第1个初始化的控制节点: 
    ip: 192.168.0.254
- master_node_1 第2个加入控制节点:
    ip: 192.168.0.244
- master_node_2 第3个加入的控制节点:
    ip: 192.168.0.243
- 数据库: 数据库部署在集群之外，不在 3 个节点之上
- CSI: 使用 local-path 
    - local-path 的 CSI 会强绑定 pod 到指定的 node，这里需要特别注意
    - 如果挂掉的节点有对应 local-path 的 pvc 绑定在上面，使用该 pvc 的 pod 就没办法漂移到其它 Ready 的 node ，这种 pod 叫有状态的 pod，可以通过命令 `kubectl get pvc -A | grep local-path` 就可以看到所有的 local-path pvc

```bash
$ kubectl get nodes -o wide
NAME           STATUS   ROLES                       AGE    VERSION        INTERNAL-IP     EXTERNAL-IP   OS-IMAGE                KERNEL-VERSION                    CONTAINER-RUNTIME
lzx-ha-env     Ready    control-plane,etcd,master   7d5h   v1.28.5+k3s1   192.168.0.254   <none>        CentOS Linux 7 (Core)   5.4.130-1.yn20230805.el7.x86_64   containerd://1.7.11-k3s2
lzx-ha-env-2   Ready    control-plane,etcd,master   7d5h   v1.28.5+k3s1   192.168.0.244   <none>        CentOS Linux 7 (Core)   5.4.130-1.yn20230805.el7.x86_64   containerd://1.7.11-k3s2
lzx-ha-env-3   Ready    control-plane,etcd,master   7d5h   v1.28.5+k3s1   192.168.0.243   <none>        CentOS Linux 7 (Core)   5.4.130-1.yn20230805.el7.x86_64   containerd://1.7.11-k3s2
```

- minio:
    - 高可用部署下使用 minio 作为 glance 的后端存储
    - statefulset
    - 使用 local-path CSI 作为后端存储

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

## 测试

### 目标

下线 primary_master_node 192.168.0.254 节点，加入新的节点替换该节点。

### 步骤

#### 1. 需要确认有哪些有状态的 pod 和 pvc 运行在该节点

```bash
# 根据 IP 找到节点在 k8s 集群中的名称
$ kubectl get nodes -o wide | grep 192.168.0.254
lzx-ha-env     Ready    control-plane,etcd,master   7d5h   v1.28.5+k3s1   192.168.0.254   <none>        CentOS Linux 7 (Core)   5.4.130-1.yn20230805.el7.x86_64   containerd://1.7.11-k3s2

# 查看所有为 local-path 的 pvc
$ kubectl get pvc -A | grep local-path
# onecloud-minio namespace 的 export-minio-x 负责存储 glance 的镜像，是关键组件
onecloud-minio        export-minio-0             Bound     pvc-9c052647-73c2-4eb8-a5f0-69abf6cfc898   1Ti        RWO            local-path     7d3h
onecloud-minio        export-minio-1             Bound     pvc-aaded012-d6ca-42b9-bc3a-c03da7c66ec8   1Ti        RWO            local-path     7d3h
onecloud-minio        export-minio-2             Bound     pvc-aae12617-3e12-4a27-9cd8-fef84e609b12   1Ti        RWO            local-path     7d3h
onecloud-minio        export-minio-3             Bound     pvc-721329f0-c961-43f4-a7cc-ccd0f650dbd0   1Ti        RWO            local-path     7d3h

# onecloud-monitoring namespace 的 export-monitor-minio-x 负责存储服务的日志，不是关键组件
onecloud-monitoring   export-monitor-minio-0     Bound     pvc-9b2c4065-ea17-415c-bbec-840db89cf88e   1Ti        RWO            local-path     7d3h
onecloud-monitoring   export-monitor-minio-1     Bound     pvc-9cd740c2-0044-49df-8cfb-1ead09127b4a   1Ti        RWO            local-path     7d3h
onecloud-monitoring   export-monitor-minio-2     Bound     pvc-e5fc90f7-8457-43a6-9b50-b4244e53eff2   1Ti        RWO            local-path     7d3h
onecloud-monitoring   export-monitor-minio-3     Bound     pvc-7b2563db-7904-4297-9bed-bf6e0cb8f626   1Ti        RWO            local-path     7d3h

# onecloud namespace 下面的这些 pvc 都是系统服务依赖的
# default-baremetal-agent 是存储物理机管理的存储，不开启 baremetal-agent 可以不用管，默认也是 Pending 待绑定状态
onecloud              default-baremetal-agent   Pending                                                                        local-path     3h35m
# default-glance 负责存 glance 服务的镜像，在高可用部署环境下，deployment default-glance 不会挂载这个 pvc ，会使用 onecloud-minio 里面的 minio s3 存储镜像，可以不用管
onecloud              default-glance            Pending
# default-victoria-metrics 负责存平台的监控数据，监控数据可以容忍丢失，如果所在节点挂了，可以删掉重建
onecloud              default-victoria-metrics   Bound     pvc-b0d78630-b4fd-4521-898d-e76b4b1f8e1b   20G        RWO            local-path     7d5h

# 查看该节点上有哪些 pod
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

通过上面命令的结果，可以筛选出 onecloud-minio/minio-1 onecloud-minio/minio-1 这些有状态的 pod 在 primary_master_node 上。

#### 2. 接下来将 primary_master_node 关机踢出集群

```bash
# 登录其它两个 master_node 节点，比如：192.168.0.244
$ ssh root@192.168.0.244

# 查看节点状态，发现 primary_master_node 已经变成 NotReady
[root@lzx-ha-env-2 ~]# kubectl get nodes -o wide
NAME           STATUS     ROLES                       AGE    VERSION     
lzx-ha-env     NotReady   control-plane,etcd,master   7d6h   v1.28.5+k3s1
lzx-ha-env-2   Ready      control-plane,etcd,master   7d6h   v1.28.5+k3s1
lzx-ha-env-3   Ready      control-plane,etcd,master   7d6h   v1.28.5+k3s1

# 删除 primary_master_node 节点：lzx-ha-env
[root@lzx-ha-env-2 ~]$ kubectl drain --delete-local-data --ignore-daemonsets lzx-ha-env
Warning: ignoring DaemonSet-managed Pods: kube-system/calico-node-dmcnq, kube-system/traefik-sj9gw, onecloud/default-host-deployer-9fcck, onecloud/default-host-health-bxgbk, onecloud/default-host-image-h4m8v, onecloud/default-host-ntjrv, onecloud/default-region-dns-8sdhs, onecloud/default-telegraf-p7zc4
evicting pod onecloud/default-etcd-2lnzlkt4fc
evicting pod onecloud-minio/minio-1
evicting pod onecloud-monitoring/monitor-minio-1
# 该命令会卡停住，因为 primary_master_node 已经关机了，无法删除 pod ，这个时候 'Ctrl-c' 取消命令
^C

# 使用 kubectl delete node 直接删除 primary_master_node 节点
$ kubectl delete node lzx-ha-env

# 然后再查看处于 Pending 状态的 pod 全部都是之前 primary_master_node 上面有状态的 pod
# 因为这些 pod 使用了 local-path 的 pvc ，这些 pvc 是和节点强绑定的，还存在集群中
[root@lzx-ha-env-2 ~]$ kubectl get pods -A | grep Pending
onecloud-minio        minio-1                                     0/1     Pending   0               11s
onecloud-monitoring   monitor-minio-1                             0/1     Pending   0               12s
onecloud              default-etcd-4pvj4fxc8g                     0/1     Pending   0               18m
```

#### 3. 删除旧的 primary_master_node 的 etcd endpoint

下载 etcdctl：

```bash
$ wget https://github.com/etcd-io/etcd/releases/download/v3.5.5/etcd-v3.5.5-linux-amd64.tar.gz
$ tar xf etcd-v3.5.5-linux-amd64.tar.gz
$ cp etcd-v3.5.5-linux-amd64/etcdctl /usr/local/bin/
```

查看 etcd member

```bash
# 使用 etcdctl 查看 member list
$ etcdctl member list \
    --endpoints https://127.0.0.1:2379 \
    --cacert /var/lib/rancher/k3s/server/tls/etcd/server-ca.crt \
    --cert /var/lib/rancher/k3s/server/tls/etcd/client.crt \
    --key /var/lib/rancher/k3s/server/tls/etcd/client.key
```

会发现旧的 primary_master_node member lzx-ha-env 已经不在 etcd 集群了。

```
ce0d368c9b2596df, started, lzx-ha-env-3-f8946fea, https://192.168.0.243:2380, https://192.168.0.243:2379, false
eed2e0188ca5085c, started, lzx-ha-env-2-110bc617, https://192.168.0.244:2380, https://192.168.0.244:2379, false
```

:::tip
如果 lzx-ha-env 节点还在 etcd 集群，可以用下面的命令把这个 member 删掉，正常情况是 k3s 自动把这个 member 剔除掉了。

```
$ etcdctl member remove xxxxx-id \
    --endpoints https://127.0.0.1:2379 \
    --cacert /var/lib/rancher/k3s/server/tls/etcd/server-ca.crt \
    --cert /var/lib/rancher/k3s/server/tls/etcd/client.crt \
    --key /var/lib/rancher/k3s/server/tls/etcd/client.key
```
:::

#### 4. 替换旧的 primary_master_node 节点，加入新的 master_node

旧的 primary_master_node 节点已经被删掉，会发现 keepalived 的 vip 漂移到了 lzx-ha-env-2 节点上(vip可能漂移到任意控制节点，需要手动查看)：

```bash
# 查看 vip 为 192.168.0.66
# 如果该节点运行了云平台 host 服务，ip 会绑定到 br0 上
[root@lzx-ha-env-2 ~]$ ip addr show br0
18: br0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UNKNOWN group default qlen 1000
    link/ether 00:22:5f:cf:fa:66 brd ff:ff:ff:ff:ff:ff
    inet 192.168.0.244/24 brd 192.168.0.255 scope global br0
       valid_lft forever preferred_lft forever
    inet 192.168.0.66/32 scope global br0
       valid_lft forever preferred_lft forever
    inet6 fe80::222:5fff:fecf:fa66/64 scope link
       valid_lft forever preferred_lft forever

# 查看 /var/lib/rancher/k3s/agent/pod-manifests/keepalived.yaml env 配置
[root@lzx-ha-env-2 ~]$ cat /var/lib/rancher/k3s/agent/pod-manifests/keepalived.yaml | grep -A 17 env
    env:
    # 对应 keepalived 的权重，除了 primary_master_node 的 keepalived 会设置 100，其余 master_node 上面的都是 90
    - name: KEEPALIVED_PRIORITY
      value: "90"
    # 设置的 VIP
    - name: KEEPALIVED_VIRTUAL_IPS
      value: "#PYTHON2BASH:['192.168.0.66']"
    # 是 BACKUP 角色
    - name: KEEPALIVED_STATE
      value: BACKUP
    # 密码
    - name: KEEPALIVED_PASSWORD
      value: "MTkyLjE2"
    # router id
    - name: KEEPALIVED_ROUTER_ID
      value: "66"
    # 改节点网卡实际 ip
    - name: KEEPALIVED_NODE_IP
      value: "192.168.0.244"
    # keepalived 绑定的网卡
    - name: KEEPALIVED_INTERFACE
      value: "eth0"
    # keepalived 探活命令
    - name: CHECK_KUBE_CMD
      value: "curl -k -XGET https://192.168.0.244:6443/healthz --cert /var/lib/rancher/k3s/server/tls/client-kube-apiserver.crt --key /var/lib/rancher/k3s/server/tls/client-kube-apiserver.key --cacert /var/lib/rancher/k3s/server/tls/client-ca.crt"

# 查看集群当前只有 2 个节点
[root@lzx-ha-env-2 ocboot]$ kubectl get nodes -o wide
NAME           STATUS   ROLES                       AGE    VERSION        INTERNAL-IP     EXTERNAL-IP   OS-IMAGE                KERNEL-VERSION                    CONTAINER-RUNTIME
lzx-ha-env-2   Ready    control-plane,etcd,master   7d6h   v1.28.5+k3s1   192.168.0.244   <none>        CentOS Linux 7 (Core)   5.4.130-1.yn20230805.el7.x86_64   containerd://1.7.11-k3s2
lzx-ha-env-3   Ready    control-plane,etcd,master   7d6h   v1.28.5+k3s1   192.168.0.243   <none>        CentOS Linux 7 (Core)   5.4.130-1.yn20230805.el7.x86_64   containerd://1.7.11-k3s2
```

下载 ocboot 部署工具代码。

import OcbootReleaseDownload from '../../../getting-started/_parts/_quickstart-ocboot-release-download.mdx';

<OcbootReleaseDownload />

现在使用 ocboot 加入新的节点，编辑 ocboot yaml 配置：

- 把当前的 lzx-ha-env-2 这个节点当做 primary_master_node
- 需要新加入 master_node 节点信息：
  - IP: 192.168.0.239
  - Name: lzx-test-add-node

因为旧的 primary_master_node 已经被删除了，又把当前的 master_node_1 当做新集群的 primary_master_node，现在的配置变成下面这样:

:::tip
- 加入新节点之前，需要确保 master_node_1 能够ssh免密登录新加的节点
- 其中 mysql 密码可以通过下面的命令查询：
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
  # 这里把之前的 master_node_1 192.168.0.244 当做 primary_master_node
  hostname: 192.168.0.244
  use_local: false
  user: root
  onecloud_version: "v3.11.9"
  # 数据库连接信息，根据自己的环境填写
  db_host: 192.168.0.252
  db_user: "root"
  db_password: "0neC1oudDB#"
  db_port: "3306"
  image_repository: registry.cn-beijing.aliyuncs.com/yunionio
  ha_using_local_registry: false
  node_ip: "192.168.0.244"
  # keepalived 暴露出去的 vip
  controlplane_host: 192.168.0.66
  controlplane_port: "6443"
  as_host: true
  # 启用 ha ，默认部署 keepavlied
  high_availability: true
  use_ee: false
  # 高可用使用 minio
  enable_minio: true
  host_networks: "eth0/br0/192.168.0.244"

master_nodes:
  # 加入到 192.168.0.66 vip 的 k8s 集群
  controlplane_host: 192.168.0.66
  controlplane_port: "6443"
  # 运行云平台控制相关组件
  as_controller: true
  # 作为云平台私有云宿主机计算节点
  as_host: true
  # 启用 keepavlied
  high_availability: true
  hosts:
  - user: root
    hostname: "192.168.0.239"
    host_networks: "eth0/br0/192.168.0.239"
  - user: root
    hostname: "192.168.0.243"
    host_networks: "eth0/br0/192.168.0.243"
```

写好配置后，使用 ocboot 加入新节点。

```bash
$ ./ocboot.sh run.py virt config-new-k8s-ha.yaml
```

等到 ocboot 的 ./run.py 运行完成后，再查看 node 信息，发现新的节点 lzx-test-add-node(192.168.0.239) 已经加入进来：

```bash
$ kubectl get nodes -o wide
NAME                STATUS   ROLES                       AGE   VERSION        INTERNAL-IP     EXTERNAL-IP   OS-IMAGE                    KERNEL-VERSION                       CONTAINER-RUNTIME
lzx-ha-env-2        Ready    control-plane,etcd,master   8d    v1.28.5+k3s1   192.168.0.244   <none>        CentOS Linux 7 (Core)       5.4.130-1.yn20230805.el7.x86_64      containerd://1.7.11-k3s2
lzx-ha-env-3        Ready    control-plane,etcd,master   8d    v1.28.5+k3s1   192.168.0.243   <none>        CentOS Linux 7 (Core)       5.4.130-1.yn20230805.el7.x86_64      containerd://1.7.11-k3s2
lzx-test-add-node   Ready    control-plane,etcd,master   69m   v1.28.5+k3s1   192.168.0.239   <none>        openEuler 22.03 (LTS-SP3)   5.10.0-182.0.0.95.oe2203sp3.x86_64   containerd://1.7.11-k3s2
```

#### 5. 恢复有状态的 pod

新的 master 节点加入后，会发现原来的有状态 pod 还是 Pending，接下来就需要删除旧的 pvc ，把它们启动到新的 master 节点上。

```bash
# 查看 Pending 状态的 pod
[root@lzx-ha-env-2 ~]$ kubectl get pods -A | grep Pending
onecloud-minio        minio-1                                     0/1     Pending             0             39m
onecloud-monitoring   monitor-minio-1                             0/1     Pending             0             35m

# 把现在的 primary_master_node 和旧的 master_node 先禁止调度，这样可以保证后面的有状态 pod 创建到新的 master 节点上
# 保证 minio 多副本打散到不同的 master 节点
[root@lzx-ha-env-2 ~]$ kubectl cordon lzx-ha-env-2 lzx-ha-env-3
```

首先恢复 onecloud-minio 里面的 minio statefulset 组件，因为里面存储了 glance 依赖的镜像，通过之前的命令发现 onecloud-minio namespace 里面的 minio-0 和 minio-3 是 Pending 状态，接下来删除它们依赖的 pvc ，然后 pod 就会重启到新的 master_node 节点上，操作如下：

```bash
# 找到对应的 pvc
$ kubectl get pvc -n onecloud-minio  | egrep 'minio-1'
export-minio-1   Bound    pvc-aaded012-d6ca-42b9-bc3a-c03da7c66ec8   1Ti        RWO            local-path     8d

# 删除 pvc
$ kubectl delete pvc -n onecloud-minio export-minio-1

# 删除 pod
$ kubectl delete pods -n onecloud-minio minio-1

# 查看新创建启动 minio-1 ，已经启动到新的 node 上
$ kubectl get pods -n onecloud-minio  -o wide
kubectl get pods -n onecloud-minio  -o wide
NAME      READY   STATUS              RESTARTS   AGE     IP             NODE                NOMINATED NODE   READINESS GATES
minio-0   1/1     Running             0          6d19h   10.40.47.23    lzx-ha-env-2        <none>           <none>
minio-1   0/1     ContainerCreating   0          34s     <none>         lzx-test-add-node   <none>           <none>
minio-2   1/1     Running             0          43m     10.40.147.13   lzx-ha-env-3        <none>           <none>
minio-3   1/1     Running             0          43m     10.40.147.23   lzx-ha-env-3        <none>           <none>

# 查看 minio-1 的日志，发现已经自愈完毕
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

# 也可以登录到 lzx-test-add-node 上，查看 local-path csi 里面的 minio onecloud-images bucket 里面有没有对应的镜像 parts
$ ssh root@10.127.100.224

# 进入对应的 pvc 目录，目录名可以使用 kubectl get pvc -n onecloud-minio | grep minio-1 获得
[root@lzx-test-add-node ~]$ cd /opt/k3s/storage/pvc-42778b3d-aa41-4d9e-a6b6-443ca0b09b3a_onecloud-minio_export-minio-1/
[root@lzx-test-add-node pvc-42778b3d-aa41-4d9e-a6b6-443ca0b09b3a_onecloud-minio_export-minio-1]$ du -smh onecloud-images/
293M    onecloud-images/
```

然后使用恢复 onecloud-minio 相同的方法，恢复 monitor-minio 就可以，参考命令如下：

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

恢复 victoria-metrics deployment，influxdb 和 minio 不太一样，minio 使用的 statefulset 管理，删掉 pod 和 pvc 后，k8s 会自动创建对应序号的 pod 和 pvc ，但是 deployment 不会，所以恢复 victoria-metrics 的步骤是删掉 pvc，然后同时删掉 default-victoria-metrics 这个 deployment ，我们的 onecloud-operator 组件就会新建对应的资源，步骤如下：

```bash
# 恢复 victoria-metrics
$ kubectl delete  pvc -n onecloud default-victoria-metrics
$ kubectl delete  deployment -n onecloud default-victoria-metrics
$ kubectl get pods -n onecloud -o wide | grep victoria-metrics
default-victoria-metrics-774fc8499b-4rjzx   0/1     ContainerCreating   0             7s      <none>          lzx-test-add-node   <none>           <none>
```

现在所有在旧的 primary_master_node 上的组件都恢复，接下来把禁止调度的节点启用调度：

```bash
$ kubectl uncordon lzx-ha-env-2 lzx-ha-env-3
```
