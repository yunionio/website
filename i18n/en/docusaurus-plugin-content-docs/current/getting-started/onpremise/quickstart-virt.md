---
sidebar_position: 1
edition: ce
---

# Quick Installation via Ocboot

Use the [ocboot](https://github.com/yunionio/ocboot) deployment tool to quickly deploy the private cloud version in an All in One mode.


:::tip Note
The contents of this chapter describe the quick deployment of Cloudpods services using deployment tools. If you want to deploy a high-availability cluster in a production environment, please refer to: [High Availability Installation](./ha-ce).
:::

## Environment Preparation

### Machine Configuration Requirements

import OcbootEnv from '../_parts/_quickstart-ocboot-env.mdx';

<OcbootEnv />

## Install Ansible and Git

import OcbootAnsible from '../_parts/_quickstart-ocboot-ansible.mdx';

<OcbootAnsible />

## Install Cloudpods

import OcbootInstallCloudpods from '../_parts/_quickstart-ocboot-install-cloudpods.mdx';

<OcbootInstallCloudpods productVersion="virt" />

## Getting Started with Cloudpods

### Create the first private cloud virtual machine

import UseVirt from '../_parts/_quickstart-use-virt.mdx';

<UseVirt />

## FAQ

### 1. After All in One deployment is complete, why is there no host in the host list?

import FAQVirtHost from '../_parts/_quickstart-faq-virt-host.md';

<FAQVirtHost />

### 2. Why can't I find the virtual machine interface in All in One mode?

import FAQVirtVM from '../_parts/_quickstart-faq-virt-vm.md';

<FAQVirtVM />

### 3. Why can't the service start after the hostname of the node is modified?

Cloudpods uses Kubernetes to manage nodes. The Kubernetes node name depends on the hostname. Changing the hostname will result in the node being unable to register with the Kubernetes cluster. Therefore, do not modify the hostname. If you have modified it, please change it back to the previous name, and the service will automatically recover.

### 4. How do I reinstall?

import FAQReset from '../_parts/_quickstart-faq-reset.md';

<FAQReset />

### 5. How do I add more nodes?

Refer to the documentation on [Adding Compute Nodes](./host).

### 6. Other questions?

Submit other questions on the Cloudpods GitHub issues page: [https://github.com/yunionio/cloudpods/issues](https://github.com/yunionio/cloudpods/issues), and we will respond as soon as possible.
