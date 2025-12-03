---
sidebar_position: 2
edition: ce
---

# 高可用安装 

使用 [ocboot](https://github.com/yunionio/ocboot) 部署工具高可用安装 Cloudpods 服务，更符合生产环境的部署需求。

## 环境准备

import HAEnv from '../../getting-started/_parts/_ha-env.mdx';

<HAEnv />

## 开始安装

import OcbootReleaseDownload from '../../getting-started/_parts/_quickstart-ocboot-release-download.mdx';

<OcbootReleaseDownload />

### 编写部署配置

import OcbootConfigHA from '@site/src/components/OcbootConfigHA';

<OcbootConfigHA productVersion='Edge' />

### 开始部署

```bash
$ ./ocboot.sh install ./config-ha.yml
```

等待部署完成后，就可以使用浏览器访问 https://10.127.190.10 (VIP), 输入用户名 `admin` 和密码 `admin@123`，进入前端。

另外部署完成后，可以给已有集群添加节点，参考文档：[添加计算节点](./host)，注意这里添加节点的控制节点 ip 不要用 vip ，只能用第1个控制节点的实际 ip ，因为 vip 有可能漂移到其他节点上，但通常只有第1个节点配置了 ssh 免密登陆登陆其他节点的权限，用其他控制节点会导致 ssh 登陆不上。
