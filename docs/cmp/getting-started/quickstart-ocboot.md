---
edition: ce
sidebar_position: 1
draft: true
---

# Ocboot 快速安装

使用 [ocboot](https://github.com/yunionio/ocboot) 部署工具以 All in One 的方式部署 Cloudpods CMP 多云管理版本。

## 前提

:::tip 注意
本章内容是通过部署工具快速搭建 Cloudpods 服务，如果想在生产环境部署高可用集群请参考: [高可用安装](./ha-ce) 。
:::

## 环境准备

### 机器配置要求

import OcbootEnv from '../../getting-started/_parts/_quickstart-ocboot-env.mdx';

<OcbootEnv />

## 安装 ansible 和 git

import OcbootAnsible from '../../getting-started/_parts/_quickstart-ocboot-ansible.mdx';

<OcbootAnsible />

## 安装 Cloudpods

import OcbootInstallCloudpods from '../../getting-started/_parts/_quickstart-ocboot-install-cloudpods.mdx';

<OcbootInstallCloudpods productVersion="cmp" />


## 开始使用 Cloudpods

### 导入公有云或者其它私有云平台资源

import UseCMP from '../../getting-started/_parts/_quickstart-use-cmp.mdx';

<UseCMP />

## FAQ

### 1. 如何重装?

import FAQReset from '../../getting-started/_parts/_quickstart-faq-reset.md';

<FAQReset />

### 2. 创建云账号的时候没有想要管理的云平台?

请参考 [隐藏功能配置](../../operations/hidden-feature-config) 打开需要管理的云平台。

### 3. 其它问题？

其它问题欢迎在 Cloudpods github issues 界面提交: [https://github.com/yunionio/cloudpods/issues](https://github.com/yunionio/cloudpods/issues) , 我们会尽快回复。
