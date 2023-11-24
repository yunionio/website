---
sidebar_position: 4
edition: ce
---

# High Availability Installation

Use [ocboot](https://github.com/yunionio/ocboot) deployment tool for high-availability installation of Cloudpods services, which is more in line with the deployment requirements of production environments.

## Environment Preparation

import HAEnv from '../_parts/_ha-env.mdx';

<HAEnv />

## Getting Started with Installation

### Download ocboot

import OcbootClone from '@site/src/components/OcbootClone';

<OcbootClone />

### Write Deployment Configuration

import OcbootConfigHA from '@site/src/components/OcbootConfigHA';

<OcbootConfigHA productVersion='CMP' />

### Start Deployment

```bash
$ ./ocboot.py install ./config-k8s-ha.yml
```

After the deployment is complete, you can use a web browser to access https://10.127.190.10 (VIP), enter username `admin` and password `admin@123`, and access the front-end.

## Frequently Asked Questions

### 1. How to manually re-add the control node?

import HAFAQReadd from '../_parts/_ha-faq-readd.mdx';

<HAFAQReadd />
