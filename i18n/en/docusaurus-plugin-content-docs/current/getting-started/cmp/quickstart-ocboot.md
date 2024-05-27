---
edition: ce
sidebar_position: 1
draft: true
---

# Quick Installation via Ocboot 

Use [ocboot](https://github.com/yunionio/ocboot) deployment tool to deploy Cloudpods CMP multi-cloud management version in All in One mode.

## Prerequisites

:::tip Note
The content in this chapter is to quickly deploy Cloudpods service through the deployment tool. If you want to deploy a highly available cluster in a production environment, please refer to: [High Availability Installation](./ha-ce).
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

<OcbootInstallCloudpods productVersion="cmp" />


## Start using Cloudpods

### Import public cloud or other private cloud platform resources

import UseCMP from '../_parts/_quickstart-use-cmp.mdx';

<UseCMP />

## FAQ


### 1. How to reinstall?

import FAQReset from '../_parts/_quickstart-faq-reset.md';

<FAQReset />

### 2. When creating a cloud account, there is no desired cloud platform to manage?

Please refer to feature-config  ............... TODO

### 3. Other questions?

Other questions are welcome to be submitted on the Cloudpods github issues page: [https://github.com/yunionio/cloudpods/issues](https://github.com/yunionio/cloudpods/issues), we will reply as soon as possible.
