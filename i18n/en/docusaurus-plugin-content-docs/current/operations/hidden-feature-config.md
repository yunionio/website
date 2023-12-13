---
edition: ce
sidebar_position: 20
---

# Hidden Feature Configuration

## Introduction

Cloudpods has been developed since 2017 and has accumulated for a long time. However, the codebase is large, the functionality is complex, and some of the code has not been iterated and maintained for some time. Therefore, we selectively hide some of the features with the following characteristics in the community edition's frontend:

1. Immature;
2. Lacks maintenance;
3. Few people use it;
4. Function components with high complexity and difficult to understand and use;

This can reduce maintenance and support costs while improving the user experience.

The code for hidden features is still maintained in the open-source project code repository.

For these reasons, starting from v3.8.7, we have gradually hidden some features. If users need these features, they can choose to turn them on in the following ways:

1. Submit an issue request to open the feature;
2. Some features can be opened using the climc tool;
3. Fork your own frontend version and turn on this feature.

## Use climc to Enable Hidden Features

For example, in version 3.9, we hide the k8s container cluster management and JD Cloud management functions by default; we have opened commonly used public cloud management functions such as Alibaba Cloud and AWS by default. Users can use the climc command-line tool to open or close the corresponding features according to their needs.

### Example

```bash
# View all supported feature configurations 
$ climc --help | grep feature-config
```

The format and parameters of the subcommand are as follows:

```bash
$ climc feature-config-$feature --switch {on|off}
# $feature: Represents the specific feature name, such as k8s, s3, jdcloud, etc.
# on: Indicates turn on
# off: Indicates turn off
```

For example, the command to enable/disable the k8s container cluster management feature is:

```bash
# Turn on
$ climc feature-config-k8s --switch on

# Turn off
$ climc feature-config-k8s --switch off
```

For example, the command to enable/disable the JD Cloud management feature is:

```bash
# Turn on
$ climc feature-config-jdcloud --switch on

# Turn off
$ climc feature-config-jdcloud --switch off
```

### Function Reference Table

| Name      | Function         | climc subcommand         |
|-----------|----------------------|--------------------------|
| onestack  | KVM virtualization management | `feature-config-onestack` |
| baremetal | Bare metal management | `feature-config-baremetal` |
| lb        | Load balancing management | `feature-config-lb` |
| aliyun    | Alibaba Cloud management | `feature-config-aliyun` |
| aws       | AWS Amazon Cloud management | `feature-config-aws` |
| azure     | Microsoft Azure Cloud management | `feature-config-azure` |
| google    | Google Cloud management | `feature-config-google` |
| qcloud    | Tencent Cloud management | `feature-config-qcloud` |
| ctyun     | China Telecom Cloud management | `feature-config-ctyun` |
| huawei    | Huawei Cloud management | `feature-config-huawei` |
| ucloud    | UCloud management | `feature-config-ucloud` |
| ecloud    | China Mobile Cloud management | `feature-config-ecloud` |
| jdcloud   | JD Cloud management | `feature-config-jdcloud` |
| vmware    | VMWare management | `feature-config-vmware` |
| openstack | OpenStack private cloud management | `feature-config-openstack` |
| zstack    | ZStack private cloud management | `feature-config-zstack` |
| cloudpods | Cloudpods private cloud management           | `feature-config-cloudpods` |
| hcso      | Huawei HCSO private cloud management         | `feature-config-hcso`      |
| nutanix   | Nutanix hyperconverged infrastructure management | `feature-config-nutanix` |
| s3        | General S3 object storage management         | `feature-config-s3`        |
| ceph      | Ceph rados object storage management         | `feature-config-ceph`      |
| xsky      | Xsky storage management                      | `feature-config-xsky`      |
| k8s       | K8S container cluster management             | `feature-config-k8s`       |
| proxmox   | PVE virtualization management                | `feature-config-proxmox`   |