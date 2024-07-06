---
sidebar_position: 1
edition: ce
---

# Ocboot 快速安装

使用 [ocboot](https://github.com/yunionio/ocboot) 部署工具以 All in One 的方式快速部署私有云版本。


:::tip 注意
- 本章内容是通过部署工具快速搭建 Cloudpods 服务，如果想在生产环境部署高可用集群请参考: [高可用安装](./ha-ce) 。

- 如果使用 Ubuntu 发行版，建议使用 [Ocboot k3s 快速安装](./buildah-k3s) 的方案，因为 Ubuntu 的其他网络组件以及内核和目前低版本的 K8s 部署方案适配的不好，会出现首次部署容器网络访问不通等问题。
:::

## 环境准备

### 机器配置要求

import OcbootEnv from '../_parts/_quickstart-ocboot-env.mdx';

<OcbootEnv />

## 安装 ansible 和 git

import OcbootAnsible from '../_parts/_quickstart-ocboot-ansible.mdx';

<OcbootAnsible />

## 安装 Cloudpods

import OcbootInstallCloudpods from '../_parts/_quickstart-ocboot-install-cloudpods.mdx';

<OcbootInstallCloudpods productVersion="virt" />

## 开始使用 Cloudpods

### 创建第一台私有云虚拟机

import UseVirt from '../_parts/_quickstart-use-virt.mdx';

<UseVirt />

## FAQ

### 1. 在 All in One 部署完成后宿主机列表没有宿主机？

import FAQVirtHost from '../_parts/_quickstart-faq-virt-host.md';

<FAQVirtHost />

### 2. 在 All in One 中找不到虚拟机界面？

import FAQVirtVM from '../_parts/_quickstart-faq-virt-vm.md';

<FAQVirtVM />

### 3. 为什么修改了节点的 hostname ，服务启动不了了？

Cloudpods 底层使用了 Kubernetes 管理节点，Kubernetes 节点名称依赖 hostname，改了 hostname 会导致节点无法注册到 Kubernetes 集群，所以不要修改 hostname ，如果修改了，请改之前的名称，服务就会自动恢复了。

### 4. 如何重装?

import FAQReset from '../_parts/_quickstart-faq-reset.md';

<FAQReset />

### 5. 如何添加更多的节点？

参考文档 [添加计算节点](./host) 。

### 6. 其它问题？

其它问题欢迎在 Cloudpods github issues 界面提交: [https://github.com/yunionio/cloudpods/issues](https://github.com/yunionio/cloudpods/issues) , 我们会尽快回复。
