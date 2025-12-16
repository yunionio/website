---
sidebar_position: 4
edition: ce
---

# Modify OC to Update Cluster Status

Introduction to updating cluster status by modifying OC (cloudpods-operator's CRD resource).

cloudpods-operator will inject CRD resource oc into the Kubernetes cluster. This CRD defines the status of a service cluster. You can modify oc to change the cluster status, achieving IaC effects.

## 1. Modify Overall Cluster Status

Main parameters:

```
disableResourceManagement: true|false
```

Whether to disable cgroup v1 resource limits. This option is disabled by default. For some newer operating systems, such as CentOS 8, etc., only cgroup v2 API is supported. If resource limits are enabled, containers cannot start. At this time, you need to disable cgroup v1 resource limits.

```
disableLocalVpc: true|false
```

Whether to disable built-in private cloud VPC functionality. This option is disabled by default.

```
enableCloudNet: true|false
```

Whether to enable Cloudnet component. This option is disabled by default

```
enableS3Gateway: true|false
```

Whether to enable S3 gateway service. This option is disabled by default

```
productVersion: CMP|Edge|FullStack
```

Cluster deployment mode. Three options: CMP (only deploy cloud management related functional components), Edge (deploy built-in private cloud related functional components), FullStack (deploy all functional components of cloud management and built-in private cloud)

```
imageRepository: <string>
```

Specify the cluster's image repo address. Default is registry.cn-beijing.aliyuncs.com/yunion

```
loadBalancerEndpoint: <ip>
```

Virtual IP address or domain name for accessing cluster control services

```
version: <string>
```

Cluster's main version number, such as v3.10.7. When component tag is not specified, version is used as the image tag by default. You can achieve overall cluster image version switching by modifying this attribute.

```
region: <string>
```

Current region, default is region0

```
zone: <string>
```

Current availability zone, default is zone0


## 2. Modify Individual Component Attributes

Each component can set the following attributes:

```
disable: true|false
```

Whether this component is disabled. Default is false. If set to true, operator will not update corresponding k8s resources (deployment or daemonset)

```
imageName: <string>
```

Image name

```
imagePullPolicy: <string>
```

Image pull policy. Default is IfNotPresent, can also be set to: Always

```
repository: <string>
```

This component's image address. This attribute overrides the global imageRepository attribute

```
tag: <string>
```

Image tag. This attribute overrides the global version attribute


Supported component list is as follows:

| Component Name                 | Function                               | Open Source | Commercial |
|-------------------------|-----------------------------------|-------|-------|
| ansibleserver           | ansible management service                    |  (x)  |  (x)  |
| apiGateway              | API gateway service                        |  (x)  |  (x)  |
| autoupdate              | Update service                           |       |  (x)  |
| baremetalagent          | Bare metal agent, responsible for bare metal server API and operations |  (x)  |  (x)  |
| climc                   | Container providing climc                     | (x)  | (x)   |
| cloudevent              | cloudevent service, provides public cloud log collection    | (x)  | (x)   |
| cloudid                 | Component responsible for CloudSSO functionality                | (x)  | (x)   |
| cloudmon                | Monitoring data collection service                     | (x)  | (x)   |
| cloudnet                | Inter-cloud network service                        | (x)  | (x)   |
| cloudproxy              | ssh proxy service                        | (x)  | (x)   |
| devtool                 | Application deployment service                        | (x)  | (x)   |
| esxiagent               | VMWare agent                         | (x)  | (x)  |
| glance                  | Image service                            | (x)  | (x)  |
| hostagent               | Host agent                          | (x)   | (x) |
| hostdeployer            | Disk data deployment service                     | (x)   | (x) |
| hostimage               | Disk data download service                     | (x)   | (x) |
| influxdb                | Open source monitoring database                       | (x)   | (x) |
| itsm                    | Work order process service                        |       | (x) |
| keystone                | Authentication service                           | (x)  | (x) |
| kubeserver              | Kubernetes cluster management agent              | (x)  | (x) |
| logger                  | Operation log service                        | (x)  | (x) |
| meter                   | Billing metering service                        |      | (x) |
| monitor                 | Monitoring service                           | (x)  | (x) |
| notify                  | Notification alert service                        | (x)  | (x) |
| onecloudServiceOperator | Orchestration service                           | (x)  | (x) |
| ovnNorth                | OVN control service                        | (x)  | (x) |
| regionDNS               | DNS service                           | (x)  | (x) |
| regionServer            | Cloud resource management service                      | (x)  | (x) |
| report                  | Report service                           |      | (x) |
| s3gateway               | S3 proxy gateway service                      | (x)  | (x) |
| scheduledtask           | Scheduled task service                        | (x)  | (x) |
| scheduler               | Scheduler                             | (x)  | (x) |
| suggestion              | Cost optimization service                        |      | (x) |
| telegraf                | Monitoring Agent, open source telegraf             | (x) | (x)  |
| vpcAgent                | VPC agent                            | (x) | (x)  |
| web                     | Frontend nginx                          | (x) | (x)  |
| webconsole              | H5 console service                        | (x) | (x)  |
| yunionagent             | Enterprise edition authorization service                       |     | (x)  |
| yunionconf              | Configuration management service                         | (x) | (x)  |



