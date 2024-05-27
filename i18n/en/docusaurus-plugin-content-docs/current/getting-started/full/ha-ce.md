---
sidebar_position: 2
edition: ce
draft: true
---

# Highly Available Installation 

Use [ocboot](https://github.com/yunionio/ocboot) deployment tool for high availability installation of Cloudpods service, which is more in line with the deployment needs of production environment.

## Environment Preparation

import HAEnv from '../_parts/_ha-env.mdx';

<HAEnv />

## Getting Started

### Download ocboot

import OcbootClone from '@site/src/components/OcbootClone';

<OcbootClone />

### Write Deployment Configuration

import OcbootConfigHA from '@site/src/components/OcbootConfigHA';

<OcbootConfigHA productVersion='FullStack' />

### Begin Deployment

```bash
$ ./ocboot.py install ./config-k8s-ha.yml
```

After the deployment is complete, you can use a browser to access https://10.127.190.10 (VIP), enter the username `admin` and password `admin@123` to enter the front end.

In addition, after the deployment is complete, you can add nodes to the existing cluster. Refer to the document: [Add a compute node](../onpremise/host). Note that when adding a node, do not use vip for the control node IP. Only the actual IP of the first control node can be used. Because the vip may float to other nodes, only the first node usually has the permission to log in other nodes via ssh without a password. Using other control nodes may cause ssh login failure.

## FAQ

### 1. How to manually re-add a control node?

import HAFAQReadd from '../_parts/_ha-faq-readd.mdx';

<HAFAQReadd />
