---
sidebar_position: 1
edition: ce
---

# Introduction

Cloudpods is a simple and reliable enterprise IaaS resource management software. It helps non-cloud enterprises comprehensively cloudize IDC physical resources and improves enterprise IT management efficiency.

Cloudpods helps customers manage all cloud computing resources in one place. It unifiedly manages heterogeneous IT infrastructure resources, greatly simplifying the complexity and difficulty of multi-cloud architecture, and helps enterprises easily control multi-cloud environments.

![](./img/intro1.png)

## Product Features

The product features include:

- Open source: Zero threshold, fast online access and installation, core code completely hosted on Github, fast iteration speed;
- Multi-cloud management: One system manages resources on different clouds at the same time;
- Multi-tenant system: One system through our certification system realizes the simultaneous use of multiple subsidiaries and departments;
- Multi-application support: Databases, Kubernetes;
- Superior performance: Cloud-native architecture, full-stack Golang;
- Self-owned and controllable: 100% completely self-developed, self-owned intellectual property rights;
- Mature and stable: Since its launch, it has been widely verified by hundreds of enterprise customers;

## User Interface

![](./img/interface1.gif)

## Function List

- Resource management, including public clouds such as Alibaba Cloud, Tencent Cloud, Huawei Cloud, etc.;
- Resource management, including private clouds such as OpenStack, ZStack, etc.;
- Resource management, including VMware, bare metal, etc.;
- Built-in private cloud;
- k8s container cluster management;
- Monitoring and operation and maintenance;
- Multi-cloud SSO;
- RBAC and IAM;
- Command line tool climc;
- API and SDK;

## Security Information

- Through deploying system-level network security measures, ensure the security of the system platform. Specific measures are:

    - Communication between components is completely encrypted using HTTPS to effectively prevent man-in-the-middle attacks, replay attacks, and prevent information from being monitored.
    - Each service uses an independent service account, and the account used to access the database for each service is an independent account to avoid risks caused by account information leakage.
    - REST API calls between services need to be authorized through keystone authentication to prevent unauthorized API access.
    - Adopt network security policies, in the private deployment environment, use Calico network policies to limit unnecessary server port exposure, and in the public cloud deployment environment, apply public cloud VPC security group policies to limit unnecessary service port exposure and reduce the risk of network attacks on services.

- Through account security measures, ensure the security of the platform. The main measures are:

    - Account security: To ensure the security of login account passwords, mandatory password complexity (password length and character types included), regular password expiration, and historical password repetition verification.
    - Login Security: To ensure account login security, enable multi-factor authentication (MFA), restrict users to have only one valid login session, allow disabling of console login permissions or API access permissions for specific users, and disable accounts if a user fails to log in with the correct password multiple times.

## Commercial Products

:::info

[New generation of enterprise-level product Hybrid Cloud](https://www.yunion.cn/)

[New generation of enterprise-level product Cloud Native Private Cloud](https://www.yunion.cn/private/index.html)

[New generation of product-oriented Cloud Native Multi-cloud Management Platform](https://www.yunion.cn/cmp/index.html)

[Public cloud billing management and optimization (FinOps)](https://www.yunion.cn/finops/index.html)

:::