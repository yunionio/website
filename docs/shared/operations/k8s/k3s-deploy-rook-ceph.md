---
sidebar_position: 26
edition: ce
---

# k3s 集群部署 rook ceph

在此之前这篇[博客](../../../blog/rook-ceph-with-cloudpods) 介绍了如何在 kubernetes 集群上部署 rook ceph 集群，该博客适用的 kubernetes 集群版本为 v1.15.9，在新版本的 Cloudpods 中集群采用 k3s 部署，并且 k3s 的版本为 v1.28.5，此前博客中的文档已不适用，本文介绍如何在 cloudpods k3s 集群中部署 rook ceph。

## 部署准备

在 cloupods k3s 集群中部署 rook ceph v1.17.9 版本，
首先准备好 k3s 搭建的 cloudpods 集群，并且集群内都有可用的裸盘给 Ceph 使用, eg：

```
$ kubectl get nodes
NAME                 STATUS   ROLES                  AGE   VERSION
wyq-test-cluster-2   Ready    <none>                 39h   v1.28.5+k3s1
wyq-test-cluster     Ready    control-plane,master   40h   v1.28.5+k3s1
wyq-test-cluster-3   Ready    <none>                 39h   v1.28.5+k3s1

$ lsblk
NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sda      8:0    0  100G  0 disk 
├─sda1   8:1    0    1G  0 part /boot
└─sda2   8:2    0   99G  0 part /
sdb      8:16   0  300G  0 disk 
```

然后给对应的节点打上 role=storage-node 的标签：

```bash
# 打标签
$ kubectl label node wyq-test-cluster role=storage-node
$ kubectl label node wyq-test-cluster-2 role=storage-node
$ kubectl label node wyq-test-cluster-3 role=storage-node

# 查看标签对应的节点
$ kubectl get nodes -L role
NAME                 STATUS   ROLES                  AGE   VERSION        ROLE
wyq-test-cluster-3   Ready    <none>                 39h   v1.28.5+k3s1   storage-node
wyq-test-cluster-2   Ready    <none>                 39h   v1.28.5+k3s1   storage-node
wyq-test-cluster     Ready    control-plane,master   40h   v1.28.5+k3s1   storage-node
```

### 部署 Rook 前准备

下载 Rook 相关代码：

```bash
# clone rook 源码
$ git clone --single-branch --branch v1.17.9 https://github.com/rook/rook.git
$ cd rook/deploy/examples
```

部署前替换镜像，由于rook ceph 中默认的镜像可能国内无法拉取，所以同步了必要的镜像到 cloudpods aliyun registry, 需要的可以按需替换，对应关系如下：
```bash
docker.io/rook/ceph:v1.17.9
gcr.io/k8s-staging-sig-storage/objectstorage-sidecar:v20240513-v0.1.0-35-gefb3255
quay.io/ceph/ceph:v19.2.3
quay.io/ceph/cosi:v0.1.2
quay.io/cephcsi/cephcsi:v3.14.2
quay.io/csiaddons/k8s-sidecar:v0.12.0
registry.k8s.io/sig-storage/csi-attacher:v4.8.1
registry.k8s.io/sig-storage/csi-node-driver-registrar:v2.13.0
registry.k8s.io/sig-storage/csi-provisioner:v5.2.0
registry.k8s.io/sig-storage/csi-resizer:v1.13.2
registry.k8s.io/sig-storage/csi-snapshotter:v8.2.1

--------------------------

registry.cn-beijing.aliyuncs.com/yunionio/rook:ceph-v1.17.9
registry.cn-beijing.aliyuncs.com/yunionio/rook:objectstorage-sidecar-v20240513-v0.1.0-35-gefb3255
registry.cn-beijing.aliyuncs.com/yunionio/ceph:v19.2.3
registry.cn-beijing.aliyuncs.com/yunionio/rook:cosi-v0.1.2
registry.cn-beijing.aliyuncs.com/yunionio/rook:cephcsi-v3.14.2
registry.cn-beijing.aliyuncs.com/yunionio/rook:k8s-sidecar-v0.12.0
registry.cn-beijing.aliyuncs.com/yunionio/rook:csi-attacher-v4.8.1
registry.cn-beijing.aliyuncs.com/yunionio/rook:csi-node-driver-registrar-v2.13.0
registry.cn-beijing.aliyuncs.com/yunionio/rook:csi-provisioner-v5.2.0
registry.cn-beijing.aliyuncs.com/yunionio/rook:csi-resizer-v1.13.2
registry.cn-beijing.aliyuncs.com/yunionio/rook:csi-snapshotter-v8.2.1
```

需要替换镜像的文件：
```diff
$ git diff operator.yaml
diff --git a/deploy/examples/operator.yaml b/deploy/examples/operator.yaml
index 99a220742..031545824 100644
--- a/deploy/examples/operator.yaml
+++ b/deploy/examples/operator.yaml
@@ -119,12 +119,12 @@ data:
   # The default version of CSI supported by Rook will be started. To change the version
   # of the CSI driver to something other than what is officially supported, change
   # these images to the desired release of the CSI driver.
-  # ROOK_CSI_CEPH_IMAGE: "quay.io/cephcsi/cephcsi:v3.14.2"
-  # ROOK_CSI_REGISTRAR_IMAGE: "registry.k8s.io/sig-storage/csi-node-driver-registrar:v2.13.0"
-  # ROOK_CSI_RESIZER_IMAGE: "registry.k8s.io/sig-storage/csi-resizer:v1.13.2"
-  # ROOK_CSI_PROVISIONER_IMAGE: "registry.k8s.io/sig-storage/csi-provisioner:v5.2.0"
-  # ROOK_CSI_SNAPSHOTTER_IMAGE: "registry.k8s.io/sig-storage/csi-snapshotter:v8.2.1"
-  # ROOK_CSI_ATTACHER_IMAGE: "registry.k8s.io/sig-storage/csi-attacher:v4.8.1"
+  ROOK_CSI_CEPH_IMAGE: "registry.cn-beijing.aliyuncs.com/yunionio/rook:cephcsi-v3.14.2"
+  ROOK_CSI_REGISTRAR_IMAGE: "registry.cn-beijing.aliyuncs.com/yunionio/rook:csi-node-driver-registrar-v2.13.0"
+  ROOK_CSI_RESIZER_IMAGE: "registry.cn-beijing.aliyuncs.com/yunionio/rook:csi-resizer-v1.13.2"
+  ROOK_CSI_PROVISIONER_IMAGE: "registry.cn-beijing.aliyuncs.com/yunionio/rook:csi-provisioner-v5.2.0"
+  ROOK_CSI_SNAPSHOTTER_IMAGE: "registry.cn-beijing.aliyuncs.com/yunionio/rook:csi-snapshotter-v8.2.1"
+  ROOK_CSI_ATTACHER_IMAGE: "registry.cn-beijing.aliyuncs.com/yunionio/rook:csi-attacher-v4.8.1"
 
   # To indicate the image pull policy to be applied to all the containers in the csi driver pods.
   # ROOK_CSI_IMAGE_PULL_POLICY: "IfNotPresent"
@@ -511,7 +511,7 @@ data:
   CSI_ENABLE_CSIADDONS: "false"
   # Enable watch for faster recovery from rbd rwo node loss
   ROOK_WATCH_FOR_NODE_FAILURE: "true"
-  # ROOK_CSIADDONS_IMAGE: "quay.io/csiaddons/k8s-sidecar:v0.12.0"
+  ROOK_CSIADDONS_IMAGE: "registry.cn-beijing.aliyuncs.com/yunionio/rook:k8s-sidecar-v0.12.0"
   # The CSI GRPC timeout value (in seconds). It should be >= 120. If this variable is not set or is an invalid value, it's default to 150.
   CSI_GRPC_TIMEOUT_SECONDS: "150"
 
@@ -617,7 +617,7 @@ spec:
       serviceAccountName: rook-ceph-system
       containers:
         - name: rook-ceph-operator
-          image: docker.io/rook/ceph:v1.17.9
+          image: registry.cn-beijing.aliyuncs.com/yunionio/rook:ceph-v1.17.9
           args: ["ceph", "operator"]
           securityContext:
             runAsNonRoot: true
```



### 开始部署 rook ceph:

首先根据自己的环境，修改 rook 提供的 `cluster.yaml` 里面的内容：
下面是修改后的 cluster.yaml 的 diff 内容：

```diff
diff --git a/deploy/examples/cluster.yaml b/deploy/examples/cluster.yaml
index f9820f384..d48a966a1 100644
--- a/deploy/examples/cluster.yaml
+++ b/deploy/examples/cluster.yaml
@@ -21,7 +21,7 @@ spec:
     # versions running within the cluster. See tags available at https://hub.docker.com/r/ceph/ceph/tags/.
     # If you want to be more precise, you can always use a timestamp tag such as quay.io/ceph/ceph:v19.2.3-20250717
     # This tag might not contain a new Ceph version, just security fixes from the underlying operating system, which will reduce vulnerabilities
-    image: quay.io/ceph/ceph:v19.2.3
+    image: registry.cn-beijing.aliyuncs.com/yunionio/ceph:v19.2.3
     # Whether to allow unsupported versions of Ceph. Currently Reef and Squid are supported.
     # Future versions such as Tentacle (v20) would require this to be set to `true`.
     # Do not set to true in production.
@@ -113,7 +113,7 @@ spec:
       # Requires a kernel that supports msgr v2 (kernel 5.11 or CentOS 8.4 or newer).
       requireMsgr2: false
     # enable host networking
-    #provider: host
+    provider: host
     # enable the Multus network provider
     #provider: multus
     #selectors:
@@ -175,22 +175,22 @@ spec:
   # To control where various services will be scheduled by kubernetes, use the placement configuration sections below.
   # The example under 'all' would have all services scheduled on kubernetes nodes labeled with 'role=storage-node' and
   # tolerate taints with a key of 'storage-node'.
-  # placement:
-  #   all:
-  #     nodeAffinity:
-  #       requiredDuringSchedulingIgnoredDuringExecution:
-  #         nodeSelectorTerms:
-  #         - matchExpressions:
-  #           - key: role
-  #             operator: In
-  #             values:
-  #             - storage-node
-  #     podAffinity:
-  #     podAntiAffinity:
-  #     topologySpreadConstraints:
-  #     tolerations:
-  #     - key: storage-node
-  #       operator: Exists
+  placement:
+    all:
+      nodeAffinity:
+        requiredDuringSchedulingIgnoredDuringExecution:
+          nodeSelectorTerms:
+          - matchExpressions:
+            - key: role
+              operator: In
+              values:
+              - storage-node
+      podAffinity:
+      podAntiAffinity:
+      topologySpreadConstraints:
+      tolerations:
+      - key: storage-node
+        operator: Exists
   # The above placement information can also be specified for mon, osd, and mgr components
   #   mon:
   # Monitor deployments may contain an anti-affinity rule for avoiding monitor
@@ -262,8 +262,8 @@ spec:
     mgr: system-cluster-critical
     #crashcollector: rook-ceph-crashcollector-priority-class
   storage: # cluster level storage configuration and selection
-    useAllNodes: true
-    useAllDevices: true
+    useAllNodes: false
+    useAllDevices: false
     #deviceFilter:
     config:
       # crushRoot: "custom-root" # specify a non-default root label for the CRUSH map
@@ -287,6 +287,16 @@ spec:
     #     config: # configuration can be specified at the node level which overrides the cluster level config
     #   - name: "172.17.4.301"
     #     deviceFilter: "^sd."
+    nodes:
+      - name: "wyq-test-cluster"
+        devices:
+          - name: "sdb"
+      - name: "wyq-test-cluster2"
+        devices:
+          - name: "sdb"
+      - name: "wyq-test-cluster3"
+        devices:
+          - name: "sdb"
     # Whether to always schedule OSD pods on nodes declared explicitly in the "nodes" section, even if they are
     # temporarily not schedulable. If set to true, consider adding placement tolerations for unschedulable nodes.
     scheduleAlways: false

diff --git a/deploy/examples/toolbox.yaml b/deploy/examples/toolbox.yaml
index 5559e064a..812716e96 100644
--- a/deploy/examples/toolbox.yaml
+++ b/deploy/examples/toolbox.yaml
@@ -19,7 +19,7 @@ spec:
       serviceAccountName: rook-ceph-default
       containers:
         - name: rook-ceph-tools
-          image: quay.io/ceph/ceph:v19
+          image: registry.cn-beijing.aliyuncs.com/yunionio/ceph:v19.2.3
           command:
             - /bin/bash
             - -c
```

开始创建 rook ceph 集群：
```bash
kubectl create -f crds.yaml -f common.yaml -f operator.yaml
kubectl create -f cluster.yaml

# 查看 rook-ceph namespace 里面的 pod 健康状况，等待 pod running
$ kubectl -n rook-ceph get pods
NAME                                                           READY   STATUS      RESTARTS   AGE
rook-ceph-operator-99bcd958c-29t7f                             1/1     Running     0          12h
csi-rbdplugin-tnnw4                                            3/3     Running     0          12h
csi-cephfsplugin-rnprg                                         3/3     Running     0          12h
csi-rbdplugin-g57qr                                            3/3     Running     0          12h
csi-cephfsplugin-7ft2q                                         3/3     Running     0          12h
csi-cephfsplugin-l84w5                                         3/3     Running     0          12h
csi-rbdplugin-r5722                                            3/3     Running     0          12h
rook-ceph-mon-a-68644647b6-9qdk8                               2/2     Running     0          12h
rook-ceph-mon-b-b5fd4569d-fhr9j                                2/2     Running     0          12h
rook-ceph-mon-c-7fc4667b4c-pvr9r                               2/2     Running     0          12h
csi-cephfsplugin-provisioner-64d55dff4f-86qk9                  6/6     Running     0          12h
csi-rbdplugin-provisioner-d5d7f5d5-qfxm5                       6/6     Running     0          12h
csi-rbdplugin-provisioner-d5d7f5d5-frw88                       6/6     Running     0          12h
csi-cephfsplugin-provisioner-64d55dff4f-5wk4x                  6/6     Running     0          12h
rook-ceph-crashcollector-wyq-test-cluster-795564c75b-vqv5f     1/1     Running     0          12h
rook-ceph-exporter-wyq-test-cluster-7d955fff7d-8tqj8           1/1     Running     0          12h
rook-ceph-mgr-a-6cc8d446b7-j2jbx                               3/3     Running     0          12h
rook-ceph-mgr-b-f7897c956-98w7q                                3/3     Running     0          12h
rook-ceph-tools-56fbc74755-flwz5                               1/1     Running     0          12h
rook-ceph-osd-prepare-wyq-test-cluster-6x2s4                   0/1     Completed   0          12h
rook-ceph-osd-prepare-wyq-test-cluster-2-gxzlj                 0/1     Completed   0          12h
rook-ceph-osd-prepare-wyq-test-cluster-3-c8mqr                 0/1     Completed   0          12h
rook-ceph-osd-0-557d7678b-xfjnl                                2/2     Running     0          12h
rook-ceph-crashcollector-wyq-test-cluster-3-5594748df6-4bksb   1/1     Running     0          12h
rook-ceph-crashcollector-wyq-test-cluster-2-5cc578c887-7tns8   1/1     Running     0          12h
rook-ceph-exporter-wyq-test-cluster-2-6cc44967cc-jh9bf         1/1     Running     0          12h
rook-ceph-exporter-wyq-test-cluster-3-57d757879d-lfmvd         1/1     Running     0          12h
rook-ceph-osd-2-755d54f95f-z42mw                               2/2     Running     0          12h
rook-ceph-osd-1-6897fb8bfd-nhlw4                               2/2     Running     0          12h

kubectl -n rook-ceph get cephcluster
NAME        DATADIRHOSTPATH   MONCOUNT   AGE   PHASE   MESSAGE                        HEALTH      EXTERNAL   FSID
rook-ceph   /var/lib/rook     3          13h   Ready   Cluster created successfully   HEALTH_OK              0fa8e642-7e3c-4096-9d24-4781199632c3
```

ceph 集群部署完后，我们需要部署 `toolbox.yaml` pod 获取集群连接信息：

```bash
$ kubectl apply -f toolbox.yaml
deployment.apps/rook-ceph-tools created

$ kubectl -n rook-ceph get pods | grep tools
rook-ceph-tools-666bf4b894-knfvk                               1/1     Running     0          2m9s

# 进入 toolbox pod
$ kubectl -n rook-ceph exec -it $(kubectl -n rook-ceph get pod -l "app=rook-ceph-tools" -o jsonpath='{.items[0].metadata.name}') -- bash
# 查看ceph.conf 和 keyring
$ cat /etc/ceph/ceph.conf
[global]
mon_host = 10.168.26.185:6789,10.168.26.184:6789,10.168.26.187:6789

[client.admin]
keyring = /etc/ceph/keyring

$ cat /etc/ceph/keyring
[client.admin]
key = AQCwoNdp1+ziORAAwRmOqnJg8ZAdUInn1MRyRA==
```

至此 rook ceph 集群以创建完毕，后续添加到 cloudpods 集群可以继续查看此[博客](../../../blog/rook-ceph-with-cloudpods) 。

## 支持的 ceph 版本

rook ceph v1.17 版本支持的 ceph 版本为：
- Squid (v19.2.0+)
- Reef (v18.2.0+)

如要部署不同的 ceph 版本需要替换 cluster.yaml 中的 ceph 镜像版本。
