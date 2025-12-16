---
sidebar_position: 1
edition: ce
---

# Ocboot Quick Installation

Use the [ocboot](https://github.com/yunionio/ocboot) deployment tool to quickly deploy the private cloud version in an All in One manner.


:::tip Note
- This chapter covers quickly setting up Cloudpods services through the deployment tool. For production environment high-availability cluster deployment, please refer to: [High Availability Installation](./ha-ce) .
:::

## Environment Preparation

import OcbootEnv from '../../shared/getting-started/_parts/_quickstart-ocboot-k3s-env.mdx';

<OcbootEnv />

## Install Cloudpods

import OcbootInstallCloudpods from '../../../docusaurus-plugin-content-docs/current/getting-started/_parts/_quickstart-ocboot-install-cloudpods-k3s.mdx';

<OcbootInstallCloudpods productVersion="virt" />

## Start Using Cloudpods

### Create the First Private Cloud Virtual Machine

import UseVirt from '../../../docusaurus-plugin-content-docs/current/getting-started/_parts/_quickstart-use-virt.mdx';

<UseVirt />

## FAQ

### 1. No host in the host list after All in One deployment?

import FAQVirtHost from '../../../docusaurus-plugin-content-docs/current/getting-started/_parts/_quickstart-faq-virt-host.md';

<FAQVirtHost />

### 2. Cannot find the virtual machine interface in All in One?

import FAQVirtVM from '../../../docusaurus-plugin-content-docs/current/getting-started/_parts/_quickstart-faq-virt-vm.md';

<FAQVirtVM />

### 3. Why can't the service start after modifying the node's hostname?

Cloudpods uses Kubernetes at the bottom layer to manage nodes. Kubernetes node names depend on hostname. Changing the hostname will cause nodes to fail to register with the Kubernetes cluster. Therefore, do not modify the hostname. If you have modified it, please change it back to the previous name, and the service will automatically recover.

### 4. How to reinstall?

import FAQReset from '../../../docusaurus-plugin-content-docs/current/getting-started/_parts/_quickstart-faq-reset.md';

<FAQReset />

### 5. How to add more nodes?

Refer to the documentation [Add Compute Nodes](./host) .

### 6. How to upgrade?

Refer to the documentation [Upgrade via ocboot](../operations/upgrading/ocboot-upgrade) .

### 7. Other questions?

For other questions, please submit them on the Cloudpods github issues page: [https://github.com/yunionio/cloudpods/issues](https://github.com/yunionio/cloudpods/issues) , and we will reply as soon as possible.
