---
sidebar_position: 9
---

# Resource Model

Cloud platform resources are roughly divided into **"virtual resources"** and **"infrastructure"** two types. Only with infrastructure-type resources can virtualized resources be built on top of them. Specific classifications are as follows:

- infra: Indicates infrastructure type
- virtual: Indicates virtual resource type, belongs to specific projects

| Name         | Abstract Resource                 | Function                                          | Type    |
|--------------|--------------------------|-----------------------------------------------|---------|
| cloudregion  | Cloud platform region               | Marks the region where the data center is located                          | infra   |
| zone         | Cloud platform data center           | Marks the data center                                  | infra   |
| vpc          | Logically isolated network space         | Abstract collection of virtualized networks                          | infra   |
| wire         | Corresponds to Layer 2 flat network broadcast domain | Abstract Layer 2 flat network broadcast domain                        | infra   |
| storage      | Storage                     | Marks storage, provides cloud disk capabilities                      | infra   |
| host         | Server                   | Marks server, provides computing virtualization                    | infra   |
| server       | Cloud host                   | Runs on host, uses virtualization technology to provide computing capabilities    | virtual |
| disk         | Cloud disk                   | Created on storage, uses virtualization technology to provide storage capabilities | virtual |
| network      | Network                     | Created in vpc, uses virtualization technology to provide network         | virtual |
| image        | Image                     | Virtual machine disk with operating system installed, also belongs to disk type  | virtual |
| eip          | External network floating ip              | Corresponds to external network available ip                               | virtual |
| loadbalancer | Load balancer               | Marks load balancer, provides service load balancing              | virtual |

In addition to the common resources introduced above, for multi-cloud management, we have also introduced the following concepts:

| Name         | Resource         | Function                               | Type  |
|--------------|--------------|------------------------------------|-------|
| cloudaccount | Cloud platform account | Corresponds to authentication information for each cloud platform           | infra |
| project      | Project         | Cloudpods internal division of virtual machine resources    | infra |
| schedtag     | Scheduling tag     | Can mark multiple types of resources, provides resource scheduling capabilities | infra |
| sku          | Instance type information     | Corresponds to specification information for creating virtual resources         | infra |

