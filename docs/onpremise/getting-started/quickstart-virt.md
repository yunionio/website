---
sidebar_position: 1
edition: ce
---

# Ocboot 快速安装

使用 [ocboot](https://github.com/yunionio/ocboot) 部署工具以 All in One 的方式快速部署私有云版本。


:::tip 注意
- 本章内容是通过部署工具快速搭建 Cloudpods 服务，如果想在生产环境部署高可用集群请参考: [高可用安装](./ha-ce) 。
:::

## 环境准备

import OcbootEnv from '../../getting-started/_parts/_quickstart-ocboot-k3s-env.mdx';

<OcbootEnv />

## 安装 Cloudpods

import OcbootInstallCloudpods from '../../getting-started/_parts/_quickstart-ocboot-install-cloudpods-k3s.mdx';

<OcbootInstallCloudpods productVersion="virt" />

## 开始使用 Cloudpods

### 创建第一台私有云虚拟机

import UseVirt from '../../getting-started/_parts/_quickstart-use-virt.mdx';

<UseVirt />

## FAQ

### 1. 在 All in One 部署完成后宿主机列表没有宿主机？

import FAQVirtHost from '../../getting-started/_parts/_quickstart-faq-virt-host.md';

<FAQVirtHost />

### 2. 在 All in One 中找不到虚拟机界面？

import FAQVirtVM from '../../getting-started/_parts/_quickstart-faq-virt-vm.md';

<FAQVirtVM />

### 3. 为什么修改了节点的 hostname ，服务启动不了了？

Cloudpods 底层使用了 Kubernetes 管理节点，Kubernetes 节点名称依赖 hostname，改了 hostname 会导致节点无法注册到 Kubernetes 集群，所以不要修改 hostname ，如果修改了，请改之前的名称，服务就会自动恢复了。

### 4. 如何重装?

import FAQReset from '../../getting-started/_parts/_quickstart-faq-reset.md';

<FAQReset />

### 5. 如何添加更多的节点？

参考文档 [添加计算节点](./host) 。

### 6. 如何升级？

参考文档 [通过 ocboot 升级](../operations/upgrading/ocboot-upgrade) 。

### 7. 其它问题？

其它问题欢迎在 Cloudpods github issues 界面提交: [https://github.com/yunionio/cloudpods/issues](https://github.com/yunionio/cloudpods/issues) , 我们会尽快回复。
