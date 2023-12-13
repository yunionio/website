---
sidebar_position: 3
edition: ce
---

# Installation on Kubernetes

Deploy the Cloudpods CMP multi-cloud management version on Kubernetes using [Helm](https://helm.sh/).

:::tip Note
This solution automatically deploys the Cloudpods multi-cloud management version on an existing Kubernetes cluster using Helm.

This deployment method may result in compatibility issues due to different configurations of CSI, CNI, and Ingress Controller for different Kubernetes distributions. If deployment fails and you want to quickly experience the product features, it is recommended to use the [Ocboot Quick Install](./quickstart-ocboot) method for deployment.

In addition, VMWare currently cannot be managed using Docker Compose because disk management for VMWare currently depends on the kernel nbd module, which cannot be loaded within Docker Compose. If you require VMWare management, please use the [Quick Installation via Ocboot](./quickstart-ocboot) method for deployment.

Kubernetes distributions that have been verified include:
- Alibaba Cloud ACK
- Tencent Cloud TKE
- Azure AKS
- AWS ECS

This deployment method is only suitable for using multi-cloud management functions, such as managing public clouds (AWS, Alibaba Cloud, Tencent Cloud, etc.) or other private clouds (zstack, openstack, etc.), and cannot be used with built-in private cloud-related functions (because built-in private clouds require the installation and configuration of various virtualization software such as QEMU and Open vSwitch on the nodes).
:::

## Environment Preparation

Cloudpods components run on top of Kubernetes, and the environment and related software dependencies are as follows:

- Kubernetes cluster configuration requirements:
  - Kubernetes version: 1.15 ~ 1.24
  - System configuration: at least 4 CPUs, 8G memory, and 100G node storage
  - Nodes need to be able to access the public network
  - Provide ingress controller
  - Internal coredns resolution
  - Support Helm, please refer to https://helm.sh/docs/intro/install/ for installation of helm tools
- Provide a Mysql database (optional): You can choose whether to use a database connected within the Kubernetes cluster or externally. It is recommended to use a separately managed Mysql in production environment (if using public cloud RDS services)

## Deployment

### Clone Chart

The Cloudpods Helm Chart is located at https://github.com/yunionio/ocboot, and can be downloaded locally using the following command:

```bash
$ git clone https://github.com/yunionio/ocboot && cd charts/cloudpods
```

:::tip Note
Next, we will use helm to install the cloudpods chart. When using `helm install`, it is necessary to specify `--namespace onecloud` and cannot use another namespace.

The reason for this is that the operator service does not yet support deploying platform services to other namespaces, which will be improved later.
:::

### Test Environment Installation

The test environment installation method is as follows. This method will deploy mysql and the local-path-provisioner CSI dependent plug-in in the Kubernetes cluster, and does not need to connect to mysql outside the cluster.

```bash
# Note that `--namespace onecloud` cannot be changed to another value, it must be onecloud
$ helm install --name-template default --namespace onecloud --debug  . -f values-dev.yaml  --create-namespace
```

### Production Environment Installation

The previously deployed method is only for testing because there are few dependencies and the installation process is fast. However, if you use this method in a production environment, please modify the parameters in `./values-prod.yaml` according to your needs, and then create a Helm Release using this file.

The recommended modifications are as follows:

```diff
--- a/charts/cloudpods/values-prod.yaml
+++ b/charts/cloudpods/values-prod.yaml
 localPathCSI:
+  # Depending on the CSI deployment of the k8s cluster, select whether you want to deploy the default local-path CSI
+  # If the k8s cluster already has a stable CSI, you can set this value to false and not deploy this component
   enabled: true
   helperPod:
     image: registry.cn-beijing.aliyuncs.com/yunionio/busybox:1.35.0
@@ -60,11 +62,16 @@ localPathCSI:

 cluster:
   mysql:
+    # external mysql address
     host: 1.2.3.4
+    # external mysql port
     port: 3306
+    # the external mysql user, need to use a user with root privileges, because the cloudpods operator creates database users for other services.
     user: root
+    # external mysql user password
     password: your-db-password
     statefulset:
+      # This needs to be set to false for production deployments, otherwise a mysql will be deployed inside the k8s cluster and the connection will use this statefulset mysql
       enabled: false
       image:
         repository: "registry.cn-beijing.aliyuncs.com/yunionio/mysql"
@@ -91,15 +98,20 @@ cluster:
   # imageRepository defines default image registry
   imageRepository: registry.cn-beijing.aliyuncs.com/yunion
   # publicEndpoint is upstream ingress virtual ip address or DNS domain
+  # Domain name or ip address accessible from outside the cluster
   publicEndpoint: foo.bar.com
   # edition choose from:
   # - ce: community edition
   # - ee: enterprise edition
   edition: ce
   # storageClass for stateful component
+  # storageClass used by stateful services, if not set it will use local-path CSI
+  # This can be adjusted according to the k8s cluster.
   storageClass: ""
   ansibleserver:
     service:
+      # Specify the nodePort to which the service is exposed, if it conflicts with an existing service in the cluster
       nodePort: 30890
   apiGateway:
     apiService:
@@ -193,6 +205,7 @@ cluster:
     service:
       nodePort: 30889

+# Setting ingress
 ingress:
   enabled: true
+  # 设置 ingress 的 className，比如集群里面使用 nginx-ingress-controller
+  # 这里的 className 就写 nginx
+  # className: nginx
   className: ""
```

After modifying the values-prod.yaml file, deploy with the following command:

```bash
# Note that `--namespace onecloud` cannot be changed. It must be onecloud
$ helm install --name-template default --namespace onecloud . -f values-prod.yaml  --create-namespace
```

## Check deployment status

After installing the cloudpods chart using helm install, use the following command to check the deployment status of pods:

```bash
# Under normal circumstances, there will be these pods in the onecloud namespace
$ kubectl get pods -n onecloud
NAME                                               READY   STATUS    RESTARTS   AGE
default-cloudpods-ansibleserver-779bcbc875-nzj6k   1/1     Running   0          140m
default-cloudpods-apigateway-7877c64f5c-vljrs      1/1     Running   0          140m
default-cloudpods-climc-6f4bf8c474-nj276           1/1     Running   0          139m
default-cloudpods-cloudevent-79c894bbfc-zdqcs      1/1     Running   0          139m
default-cloudpods-cloudid-67c7894db7-86czj         1/1     Running   0          139m
default-cloudpods-cloudmon-5cd9866bdf-c27fc        1/1     Running   0          68m
default-cloudpods-cloudproxy-6679d94fc7-gm5tx      1/1     Running   0          139m
default-cloudpods-devtool-6db6f4d454-ldw69         1/1     Running   0          139m
default-cloudpods-esxi-agent-7bcc56987b-lgpnf      1/1     Running   0          139m
default-cloudpods-etcd-q8j5c29tm2                  1/1     Running   0          145m
default-cloudpods-glance-7547c455d5-fnzqq          1/1     Running   0          140m
default-cloudpods-influxdb-c9947bdc8-x8xth         1/1     Running   0          139m
default-cloudpods-keystone-6cc64bdcc7-xhh7m        1/1     Running   0          145m
default-cloudpods-kubeserver-5544d59c98-l9d74      1/1     Running   0          140m
default-cloudpods-logger-8f56cd9b5-f9kbp           1/1     Running   0          139m
default-cloudpods-monitor-746985b5cf-l8sqm         1/1     Running   0          139m
default-cloudpods-notify-dd566cfd6-hxzr4           10/10   Running   0          139m
default-cloudpods-operator-7478b6c64b-wbg26        1/1     Running   0          72m
default-cloudpods-region-7dfd9b888-hsvv8           1/1     Running   0          144m
default-cloudpods-scheduledtask-7d69b877f7-4ltm6   1/1     Running   0          139m
default-cloudpods-scheduler-8495f85798-zgvq2       1/1     Running   0          140m
default-cloudpods-web-5bc6fcf78d-4f7lw             1/1     Running   0          140m
default-cloudpods-webconsole-584cfb4796-4mtnj      1/1     Running   0          139m
default-cloudpods-yunionconf-677b4448b6-tz62m      1/1     Running   0          139m
```

## Create default management user

### Create account to log in to Web UI

If you are using the Enterprise Edition, the front-end will prompt you to register and obtain a license. The following steps apply only to the open-source version:### Enter the climc command line pod

If you're deploying the community open-source version (ce), use the platform command line tools to create a default user and perform related operations. The corresponding commands are as follows. First, enter the climc pod container:

```bash
#Enter the climc pod
$ kubectl exec -ti -n onecloud $(kubectl get pods -n onecloud | grep climc | awk '{print $1}') -- bash
Welcome to Cloud Shell :-) You may execute climc and other command tools in this shell.
Please exec 'climc' to get started

bash-5.1#
```

### Create user

Create an admin user inside the climc pod, the command is as follows:

```bash
# Create an admin user with the password 'admin@123', adjust as needed
[in-climc-pod]$ climc user-create --password 'admin@123' --enabled admin

# Allow web login
[in-climc-pod]$ climc user-update --allow-web-console admin

# Add the admin user to the system project and give it administrator privileges
[in-climc-pod]$ climc project-add-user system admin admin
```

## Access the Frontend

Access the platform-exposed frontend according to the created ingress. Check the ingress using the following command:

```bash
#The ingress information of my test cluster is as follows, different k8s clusters have different implementations according to the ingress plugin
$ kubectl get ingresses -n onecloud
NAME                    HOSTS   ADDRESS                 PORTS     AGE
default-cloudpods-web   *       10.127.100.207          80, 443   7h52m
```

Visit the platform frontend at https://10.127.100.207 using a browser, and then log in with the admin user created earlier.

## Change the api_server access url

The `api_server` option is the address of the access point for the entire platform, which affects the front-end vnc or web ssh connection.

You need to modify it manually according to your environment, refer to the document: [Change service api_server configuration](../../operations/fe/config-ssl-certs#change-api-server-via-climc).

## Upgrade

Upgrade can be done by modifying the corresponding values yaml file and then performing upgrade configuration. For example, if there is a port conflict with the cluster.regionServer.service.nodePort 30888 port and you need to change it to another port such as 30001, modify the corresponding values in values-prod.yaml:

```diff
--- a/charts/cloudpods/values-prod.yaml
+++ b/charts/cloudpods/values-prod.yaml
@@ -170,7 +170,7 @@ cluster:
       nodePort: 30885
   regionServer:
     service:
-      nodePort: 30888
+      nodePort: 30001
   report:
     service:
       nodePort: 30967
```

Then use the helm upgrade command to upgrade:

```bash
$ helm upgrade -n onecloud default . -f values-prod.yaml
```

Then, check the onecloudcluster resource, and you will find that the spec.regionServer.service.nodePort has changed to 30001, and the corresponding service nodePort will also change:

```bash
# Look up the regionServer's properties in onecloudcluster
$ kubectl get oc -n onecloud default-cloudpods -o yaml | grep -A 15 regionServer
  regionServer:
    affinity: {}
    disable: false
    dnsDomain: cloud.onecloud.io
    dnsServer: 10.127.100.207
    image: registry.cn-beijing.aliyuncs.com/yunion/region:v3.9.2
    imagePullPolicy: IfNotPresent
    limits:
cpu: "1.333333"
memory: 2045Mi
replicas: 1
requests:
  cpu: 10m
  memory: 10Mi
service:
  nodePort: 30001

# View the nodePort of the default-cloudpods-region service
$ kubectl get svc -n onecloud | grep region
default-cloudpods-region          NodePort    10.110.105.228   <none>        30001:30001/TCP                   7h30m
```

Check if the cluster.regionServer.service.nodePort that was changed previously has changed in the platform endpoints:

```bash
# Use the climc pod to specify the endpoint-list command to view
$ kubectl exec -ti -n onecloud $(kubectl get pods -n onecloud | grep climc | awk '{print $1}') -- climc endpoint-list --search compute
+----------------------------------+-----------+----------------------------------+----------------------------------------+-----------+---------+
|                ID                | Region_ID |            Service_ID            |                  URL                   | Interface | Enabled |
+----------------------------------+-----------+----------------------------------+----------------------------------------+-----------+---------+
| c88e03490c2543a987d86d733b918a2d | region0   | a9abfdd204e9487c8c4d6d85defbfaef | https://10.127.100.207:30001           | public    | true    |
| a04e161ee71346ac88ddd04fcebfe5ce | region0   | a9abfdd204e9487c8c4d6d85defbfaef | https://default-cloudpods-region:30001 | internal  | true    |
+----------------------------------+-----------+----------------------------------+----------------------------------------+-----------+---------+
*** Total: 2 Pages: 1 Limit: 20 Offset: 0 Page: 1 ***
```

## Deletion

```bash
$ helm delete -n onecloud default
```

## Other issues

### 1. Missing keystone, glance, region pods in onecloud namespace

If you execute `helm install` and execute `kubectl get pods -n onecloud` and find only the operator pod and no keystone, glance, or region pods related to the platform services appear, use the following command to check the operator pod's logs for troubleshooting.

The reason for this situation is generally that the operator encountered an error when creating platform-related services such as keystone and region. Common problems include the operator's inability to create users and databases using related mysql users, or the creation of the keystone service, but unable to access the keystone pod through the K8s internal service domain name.

```bash
# Redirect all operator logs to a file```
$ kubectl logs -n onecloud $(kubectl get pods -n onecloud | grep operator | awk '{print $1}') > /tmp/operator.log
# Then check if there are any related errors in /tmp/operator.log


# Check if there is a keyword "requeuing" in the operator log, general errors will be reflected here
$ kubectl logs -n onecloud $(kubectl get pods -n onecloud | grep operator | awk '{print $1}') | grep requeuing
```
