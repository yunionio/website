---
sidebar_position: 2
edition: ce
---

# High Availability Installation 

Use the [ocboot](https://github.com/yunionio/ocboot) deployment tool to perform high availability installation of Cloudpods services, which better meets production environment deployment requirements.

## Environment Preparation

import HAEnv from '../../shared/getting-started/_parts/_ha-env.mdx';

<HAEnv />

## Start Installation

import OcbootReleaseDownload from '../../../docusaurus-plugin-content-docs/current/getting-started/_parts/_quickstart-ocboot-release-download.mdx';

<OcbootReleaseDownload />

### Write Deployment Configuration

import OcbootConfigHA from '@site/src/components/OcbootConfigHA';

<OcbootConfigHA productVersion='Edge' />

### Start Deployment

```bash
$ ./ocboot.sh install ./config-ha.yml
```

After the deployment is complete, you can use a browser to access https://10.127.190.10 (VIP), enter username `admin` and password `admin@123`, and enter the frontend.

In addition, after deployment is complete, you can add nodes to the existing cluster. Refer to the documentation: [Add Compute Nodes](./host). Note that when adding nodes here, do not use the VIP for the control node IP, only use the actual IP of the first control node, because the VIP may drift to other nodes, but usually only the first node has SSH passwordless login permissions to other nodes configured. Using other control nodes will cause SSH login to fail.
