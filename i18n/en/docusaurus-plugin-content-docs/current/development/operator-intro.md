---
sidebar_position: 12
---

# Operator Introduction

When services all run in K8s clusters, there's a deployment called cloudpods-operator, used to deploy and control K8S resources needed by other services. Here we introduce the operations of this operator component.

[cloudpods-operator](https://github.com/yunionio/cloudpods-operator) is a separately written component that runs as a long-running service inside Kubernetes clusters. Its role is to automatically set up and maintain all Cloudpods services. Detailed introduction can refer to [cloudpods-operator Working Principles](https://github.com/yunionio/cloudpods-operator/blob/master/docs/intro.md).

## Introduction

The operator creates a resource called OnecloudCluster in K8S. This resource defines the docker image repository and version to be used by each service component. By modifying the OnecloudCluster resource, you can achieve multi-faceted image version control for each service.

```bash
# View OnecloudCluster resource
$ kubectl get onecloudclusters.onecloud.yunion.io -n onecloud
NAME      KEYSTONE
default   registry.cn-beijing.aliyuncs.com/yunionio/keystone:archdev-v36

# View YAML details of default OnecloudCluster resource
$ kubectl get onecloudclusters.onecloud.yunion.io -n onecloud default -o yaml

# Enter edit interface
$ kubectl edit onecloudclusters -n onecloud default
```


## Image Control

Key properties for image version control of OnecloudCluster resource are introduced as follows:

| Property                       | Function                       | Default Value                                               |
|----------------------------|----------------------------|------------------------------------------------------|
| .spec.imageRepository      | Controls image repository address for all services | registry.cn-beijing.aliyuncs.com/yunionio            |
| .spec.version              | Controls image tag for all services     | Specified during deployment, for example 'v3.6.9'                          |
| .spec.$(component).repository | Controls image repository address for this component   | Not set by default, can separately control component's image repository by setting this value |
| .spec.$(component).tag        | Controls image tag for this component       | Not set by default, can separately control component's tag by setting this value     |


### Unified Version Modification

By modifying the `spec.imageRepository` and `spec.version` properties of default onecloudcluster, you can uniformly change all service images. The following are usage scenario examples:

1. Modify all service images uniformly to archdev-v36, modify `spec.version`

```bash
# Here oc is the abbreviation for onecloudcluster, which can also be recognized
$ kubectl edit oc -n onecloud default
...
    tolerations:
    - effect: NoSchedule
      key: node-role.kubernetes.io/master
    - effect: NoSchedule
      key: node-role.kubernetes.io/controlplane
  # Modify the version here, then all service corresponding pod image tags will become archdev-v36
  version: archdev-v36
  vpcAgent:
    disable: false
    image: registry.cn-beijing.aliyuncs.com/yunionio/vpcagent:archdev-v36
...
```

2. Modify all service image repositories to pull images from registry.cn-beijing.aliyuncs.com/zexi, modify `spec.imageRepository`

```bash
$ kubectl edit oc -n onecloud default
spec:
...
    tolerations:
    - effect: NoSchedule
      key: node-role.kubernetes.io/master
    - effect: NoSchedule
      key: node-role.kubernetes.io/controlplane
  # Here modify the imageRepository value, all service corresponding pod images will be pulled from `registry.cn-beijing.aliyuncs.com/zexi` repository
  imageRepository: registry.cn-beijing.aliyuncs.com/zexi
  influxdb:
...
```

3. `spec.imageRepository` and `spec.version` can be used together, so you can uniformly configure image addresses for each service.

After modifying these properties, you can check pod status and find that all pods are pulling images and restarting.

### Modify Component Version Individually

By modifying the `spec.$(component).repository` and `spec.$(component).tag` properties in each component, you can modify the image of the deployment or daemonset corresponding to this service.

The priority of these two properties for setting images is higher than the outer `spec.imageRepository` and `spec.version`. That is, by modifying the component's `repository` and `tag` properties, you can modify a single component's image while other component images remain unchanged. This mechanism is useful during development.

Below we use region as an example:

1. Specify `spec.regionServer.repository` as `192.168.0.1:5000/yunionio` and `spec.regionServer.tag` as `lzx-dev`, which will change the image in default-region deployment to: `192.168.0.1:5000/yunionio/region:lzx-dev`.

```bash
$ kubectl edit oc -n onecloud default
spec:
...
  regionServer:
    disable: false
    dnsDomain: cloud.onecloud.io
    # Set repository here
    repository: 192.168.0.1:5000/yunionio
    # Set tag here
    tag: lzx-dev
    dnsServer: 10.127.40.252
    image: registry.cn-beijing.aliyuncs.com/yunionio/region:archdev-v36
    imagePullPolicy: IfNotPresent
    replicas: 1
...

# Now view the default-region deployment
# You'll find that the image inside has been modified by operator according to $(spec.regionServer.repository)/region:$(spec.regionServer.tag) format
$ kubectl get deployment -n onecloud default-region -o yaml | grep image:
        image: 192.168.0.1:5000/yunionio/region:lzx-dev
        image: 192.168.0.1:5000/yunionio/region:lzx-dev
```

