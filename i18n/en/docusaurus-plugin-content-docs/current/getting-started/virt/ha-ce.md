---
sidebar_position: 2
edition: ce
---

# High Availability Installation

Use [ocboot](https://github.com/yunionio/ocboot) deployment tool for high availability installation of Cloudpods service, which better meets the deployment needs of production environments.

## Environment Preparation

import HAEnv from '../_parts/_ha-env.mdx';

<HAEnv />

## Getting Started with Installation

### Download ocboot

import OcbootClone from '@site/src/components/OcbootClone';

<OcbootClone />

### Write Deployment Configuration

import OcbootConfigHA from '@site/src/components/OcbootConfigHA';

<OcbootConfigHA productVersion='Edge' />

### Start Deployment

```bash
$ ./ocboot.py install ./config-k8s-ha.yml
```

After the deployment completes, you can use a web browser to access https://10.127.190.10 (VIP), enter the username `admin` and password `admin@123`, then access the frontend.

Additionally, after deployment is complete, you can add nodes to an existing cluster. Refer to the document: [Add Compute Nodes](./host). Note that when adding nodes, the ip of the control node cannot use vip. Only use the actual ip of the first control node, because vip may have drifted to other nodes. Usually, only the first node is configured with ssh to login to other nodes without password. Using other control nodes will cause ssh login to fail.

## Frequently Asked Questions

### 1. How to manually re-add the control node?

import HAFAQReadd from '../_parts/_ha-faq-readd.mdx';

<HAFAQReadd />