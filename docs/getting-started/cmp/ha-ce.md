---
sidebar_position: 4
edition: ce
draft: true
---

# 高可用安装 

使用 [ocboot](https://github.com/yunionio/ocboot) 部署工具高可用安装 Cloudpods 服务，更符合生产环境的部署需求。

## 环境准备

import HAEnv from '../_parts/_ha-env.mdx';

<HAEnv />

## 开始安装

### 下载 ocboot

import OcbootClone from '@site/src/components/OcbootClone';

<OcbootClone />

### 编写部署配置

import OcbootConfigHA from '@site/src/components/OcbootConfigHA';

<OcbootConfigHA productVersion='CMP' />

### 开始部署

```bash
$ ./ocboot.py install ./config-k8s-ha.yml
```

等待部署完成后，就可以使用浏览器访问 https://10.127.190.10 (VIP), 输入用户名 `admin` 和密码 `admin@123`，进入前端。

## 常见问题

### 1. 如何手动重新添加控制控制节点？

import HAFAQReadd from '../_parts/_ha-faq-readd.mdx';

<HAFAQReadd />
