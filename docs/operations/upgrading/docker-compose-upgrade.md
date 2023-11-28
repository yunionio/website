---
edition: ce
sidebar_position: 2
---

# 通过 docker compose 升级

:::tip
该方法只能升级使用 docker compose 部署的环境，如果你的环境是 ocboot 部署的，请参考以下文档升级:

- [通过 ocboot 升级](./ocboot-upgrade)
:::


通过 docker compose 升级很方便，只用更新 docker-compose.yml 的配置文件。

当上游的 [ocboot/compose/docker-compose.yml](https://github.com/yunionio/ocboot/blob/master/compose/docker-compose.yml) 更新了，就可以通过 git pull 命令，拉取最新的代码，然后重新启动就可以了，步骤如下：


## 更新 ocboot 代码

登录运行 docker compose 的节点，进入 ocboot 代码目录。

```bash
$ cd ocboot
```

拉取最新的代码，并 checkout 到对应的发布版本。

import OcbootFetchCheckout from '@site/src/components/OcbootFetchCheckout';

<OcbootFetchCheckout />

## 重启 compose 服务

拉取最新的 docker-compose.yml 配置文件后，使用下面命令重启服务就行了。

```bash
$ cd compose
$ docker compose down
$ docker compose up -d
```
