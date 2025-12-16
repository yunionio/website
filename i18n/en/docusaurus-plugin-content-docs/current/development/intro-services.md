---
sidebar_position: 5
---

# Service Component Introduction

Introduction to the architecture and functions of platform core components.

## Architecture Introduction

Cloudpods has many service components. Next, we'll introduce the functions of each component:

| Service Component   | Function Purpose                               |
|------------|----------------------------------------|
| keystone   | Authentication and permission management                           |
| region     | Multi-cloud resource controller                         |
| scheduler  | Resource scheduler                             |
| glance     | Virtual machine image management                         |
| host       | Private cloud virtual machine management                       |
| baremetal  | Private cloud physical machine management                       |
| esxi-agent | vmware esxi instance management                   |
| lb-agent   | Private cloud load balancer                         |
| webconsole | Provides vnc, ssh access                     |
| logger     | Records audit logs                           |
| apigateway | api gateway, can access all backend apis through this service |
| climc      | Command-line management tool                         |

Component architecture is shown in the figure below, divided into three main parts: access layer, control layer, and resource layer.

![](./images/onecloud-services.png)

## Access Layer

The access layer implements the access functions of the cloud management platform, allowing users to access cloud management platform functions through the following 3 methods:

1. **API Access**: Access cloud management platform functions through REST API. Users can directly access the cloud management platform's REST API through http interfaces, or use SDKs provided by the cloud management platform. Currently, SDKs support three languages: Java, Python, and Golang.

2. **Command-line Access**: Access cloud management platform functions through the climc command-line tool provided by the cloud management platform, allowing users to call climc through scripts to implement some automated operations functions. Climc uses Golang language and is developed based on the cloud management platform's Golang SDK.

3. **Web Console Access**: Access cloud management platform functions through Web UI. Allows users to access the cloud management platform through mainstream web browsers. The Web console provides management backends for administrators and regular function pages for regular users, providing most management and usage functions. The Web console is implemented based on Vue 2.0 JavaScript SPA framework.

## Control Layer

- The control layer implements the management and control functions of the cloud management platform. It is mainly composed of API gateway, authentication service, image service, cloud controller and scheduler, as well as webconsole vnc, ssh proxy services and other components.

- The API gateway provides unified REST API access interfaces for the Web console to access various services. Implements Web console login verification, session control, and API calls to various backend services. The API gateway is completely independently developed in Golang, with a completely stateless architecture and horizontal scaling capabilities.

- The authentication service provides the platform's account management and authentication system, and provides multi-tenant support based on projects, while providing service catalog functionality. The authentication service supports multiple authentication sources, allowing integration with enterprise LDAP/AD, allowing users to log into the system with the enterprise's unified account system. Authentication service versions before 2.10 were based on OpenStack Keystone Pika version, developed in Python. Based on the open source version, we fixed bugs and made several improvements. Versions after 2.10 are developed in golang language. Keystone adopts a stateless architecture, supports horizontal scaling, and can achieve high availability through horizontal splitting.

- The image service provides management functions for operating system images of various host resources in the cloud management platform. Provides image storage, metadata management and other functions. Image service 1.x version was improved from OpenStack Glance Folsom version, developed in Python. Based on the open source version, we fixed bugs and made several improvements. 2.x version is developed in golang language. Glance adopts a stateless architecture, supports horizontal scaling, and can achieve high availability through horizontal splitting.

- The cloud controller is the core of the entire cloud management platform, responsible for managing metadata information of various resources such as data center networks, hosts, networks, storage, virtual machines, etc., as well as scheduling and coordinating management of automated management operations such as virtual machines and bare metal. The cloud controller has a built-in distributed asynchronous task management framework based on REST API interfaces, implementing management and coordination of time-consuming operation tasks such as power on/off, create/delete performed on compute nodes. The cloud controller is completely independently developed. The cloud controller adopts a stateless architecture, can scale horizontally, and achieves high availability through horizontal splitting.

- The scheduler is responsible for the resource scheduling function of the cloud management platform and is the sole executor of resource acquisition decisions in the cloud management platform. Based on user requirements for resources, it provides the optimal resource provider. The scheduler supports batch scheduling, has excellent scheduling performance and good scalability. The scheduler is completely independently developed, based on Golang language.

## Resource Layer

- The resource layer implements management and control functions for computing resources such as KVM virtual machines, bare metal, and VMWare virtual machines. The cloud management platform currently mainly supports management of KVM virtual machines, bare metal, VMWare virtual machines, common private clouds openstack, zstack, as well as public cloud resources such as Aliyun, Azure, Tencent Cloud, AWS, etc.

