---
sidebar_position: 2
---

# Integrating a Cloud Platform

Introduces how to integrate a new cloud platform. Assume the cloud to be integrated here is TestCloud.

## Basic Concepts

- Platform Name
  - Each cloud integration requires defining a cloud platform name. [Provider](https://github.com/yunionio/cloudmux/blob/master/pkg/apis/compute/cloudaccount_const.go) shows the names of currently integrated clouds
  - Note: Tencent Cloud's name is **Qcloud**. The best definition would be TencentCloud, but the earliest console address used was *https://qcloud.com*, so it was defined as **Qcloud**

- Resource Interface
  - To shield differences between clouds, we separated the [Cloudmux](https://github.com/yunionio/cloudmux) repository and unified cloud resource operations into this repository
  - Each resource type has a corresponding interface in [Resource](https://github.com/yunionio/cloudmux/blob/master/pkg/cloudprovider/resources.go)
  - For each cloud, implementing the interfaces defined in **Resource** completes about 80% of cloud platform integration
  - The implementation file list for resource interfaces should be in pkg/multicloud/testcloud/
- Cloud Account Integration
  - Cloud account integration is similar to resource interfaces. The interface is defined in [ICloudProvider](https://github.com/yunionio/cloudmux/blob/master/pkg/cloudprovider/cloudprovider.go). You need to implement **ICloudProviderFactory** and **ICloudProvider**
  - **ICloudProviderFactory** is the interface for validating cloud accounts and cloud account attributes
  - **ICloudProvider** is the entry point for cloud accounts to actually obtain and operate cloud platform resources
  - The implementation file for cloud account integration should be in pkg/multicloud/testcloud/provider/
- Quick Operations
  - For quick debugging of each cloud's interfaces, each cloud platform has a corresponding cloud platform CLI command implementation, for example [aliyuncli](https://github.com/yunionio/cloudmux/blob/master/cmd/aliyuncli/main.go)
  - aliyuncli imports subcommands from [Shell](https://github.com/yunionio/cloudmux/tree/master/pkg/multicloud/aliyun/shell) when starting, for example: aliyuncli instance-list
  - In the early stages of interface implementation, you can implement basic API calls based on the cloud platform resource API to be integrated, then write shell subcommands to quickly debug APIs through shell commands

### testcli Debug Command

- Create pkg/multicloud/testcloud/test.go file
  - Define **STestCloudClient** struct to save aksk
  - Implement **NewTestCloudClient** method. This method needs to verify whether the test cloud's aksk is correct and return \*STestCloudClient
  - Create pkg/multicloud/testcloud/region.go and define SRegion struct, implement GetClient method
  - Implement binding GetRegions method to STestCloudClient. Private cloud regions are generally simulated. You can refer to already implemented private clouds

:::tip
During integration, you need to use an incorrect aksk once. Based on the returned error message, convert the error to **cloudprovider.ErrInvalidAccessKey** error to distinguish error types
:::

- Create pkg/multicloud/testcloud/shell/region.go
  - Implement region-list command, refer to pkg/multicloud/aliyun/shell/region.go

- Create cmd/testcli/main.go file
  - Implement command debug entry, refer to cmd/aliyuncli/main.go

Debug region-list command

```shell
# Compile testcli binary
$ make cmd/testcli 
# Debug interface through command
$ ./_output/bin/testcli --debug region-list
```

:::tip
- When integrating various cloud platforms, cloud platforms generally provide corresponding golang SDKs. Here, try to only use the authentication part of the provided SDK, and design the rest through REST API documentation. This has the following benefits:
  - Break free from golang SDK limitations
  - Can uniformly handle err errors, such as the cloudprovider.ErrNotFound error to be used later
  - Convenient to implement read-only cloud account synchronization and proxy
  - Lightweight. Some cloud platform SDKs use many pointers, and just pointer checks add a lot of unnecessary code
:::

### Add Resource Interface Implementations

Resource implementation is like tree growth, from root to branches to leaves, spreading out. region is like the root, region has vpc, zone... under it, zone has host, storage... under it. You can implement corresponding resource interfaces in this order

- Add shell commands for each resource
- Implement corresponding interfaces for each resource according to resource interface definitions

:::tip
Here are some notes on interface and method implementation:

- Resource GetGlobalId requires global uniqueness
  - For example, two region-1s cannot appear simultaneously in the region list
  - region-1 can have zone1 under it, but region-2 cannot have zone1
- Resource Refresh
  - When refreshing a resource that doesn't exist, need to return ErrNotFound error
  - When calling jsonutils.Update on itself, need to set pointer or slice attributes to nil, otherwise this information won't be updated
- Resource IsEmulated
  - This attribute is used by cloudpods to show or hide certain simulated resources. For example, public clouds don't have the concept of hosts, so public cloud hosts are emulated
- GetCapabilities Interface
  - This interface defines which resources this cloud implements, including whether resources are read-only
  - If certain resource interfaces are implemented, these resources need to be added to the return list, otherwise resources will have synchronization issues
:::

### Cloud Account Integration

First need to implement the interfaces defined in **Cloud Account Integration** in the **Basic Concepts** above

- Mainly implement the following interfaces
  - ICloudProviderFactory
    - GetProvider
    - GetId
    - GetName
    - ValidateCreateCloudaccountData
  - ICloudProvider
    - GetFactory
    - GetIRegions
    - GetIRegionById
    - GetSubAccounts
    - GetAccountId
    - GetCloudRegionExternalIdPrefix

After implementation is complete, edit the pkg/multicloud/loader/loader.go file and import the package

:::tip
Note that GetSubAccounts actually returns cloud subscription information. The number of SubAccounts is the number of cloud subscriptions
The number of cloud subscriptions is determined based on cloud subscription characteristics. Even for the same cloud account A, resources under subscription a of account A cannot be associated with resources under subscription b of account A. For example, eip of subscription a cannot be bound to virtual machines of subscription b

GetAccountId returns the unique identifier of this account, used to prevent duplicate cloud account imports
:::

### cloudpods Integration

After resource interfaces and cloud account integration are implemented, you can formally integrate with cloudpods to debug resources

```shell
# Enter cloudpods code directory, import cloudmux. /path/to/local/cloudmux/path needs to be replaced with the local cloudmux absolute path
$ go mod edit -replace yunion.io/x/cloudmux=/path/to/local/cloudmux/path
$ make mod
```

- Add pkg/compute/guestdrivers/testcloud.go pkg/compute/hostdrivers/testcloud.go pkg/compute/regiondrivers/testcloud.go files, implement basic init methods
- Edit cmd/climc/shell/compute/cloudaccounts.go file, add create-testcloud subcommand
- Edit cmd/climc/shell/compute/usages.go file, add cloud platform name to corresponding variables
- Edit cmd/climc/shell/misc/feature.go, add cloud platform name to features
- Edit pkg/apis/compute/cloudaccount\_const.go file, add cloud platform name to corresponding variables
- Edit pkg/apis/compute/host\_const.go file, add corresponding host\_type, and some variables below need corresponding additions
- Edit pkg/apis/compute/guest\_const.go file, add corresponding hypersor, and some variables below need corresponding additions
- If the corresponding cloud subnet to be added is region-level, need to edit pkg/apis/compute/network\_const.go file, add to REGIONAL\_NETWORK\_PROVIDERS

```shell
# Compile region binary, or package region image https://www.cloudpods.org/zh/docs/development/dev-env/#docker-%E9%95%9C%E5%83%8F%E7%BC%96%E8%AF%91%E4%B8%8A%E4%BC%A0
$ make cmd/region
# Compile latest climc command
$ make cmd/climc
# Import cloud account
$ ./_output/bin/climc cloud-account-create-testcloud --xxx -xxx -xxx -xxx
```

Troubleshooting

- Confirm whether the currently deployed service image has been updated to the compiled packaged image

```shell
# Check
kubectl get pods -n oneclouds
```

- First add cloud platform accounts like Alibaba Cloud that have already been integrated to unlock resource creation functionality from the test cloud platform.

- You can send a SIGUSR1 signal to the service process to trigger the service process to print the current call stack. For specific methods, refer to [Troubleshooting Tools](https://www.cloudpods.org/zh/docs/development/devtools/#%E8%8E%B7%E5%8F%96%E8%B0%83%E7%94%A8%E6%A0%88).

- Locate corresponding backend code from API requests, refer to [Locating Backend Code](https://www.cloudpods.org/zh/docs/development/api-model/).

Monitoring Data Collection

- Modify cloudmux's pkg/cloudmux/testcloud/provider/provider.go to add GetMetrics interface implementation
- Add cloudpods's pkg/cloudmon/providerdriver/testcloud.go file
- go mod edit --replace && make mod && make cmd/cloudmon package and publish latest cloudmon image for debugging

