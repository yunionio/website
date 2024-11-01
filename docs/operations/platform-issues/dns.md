---
sidebar_position: 1
---

# dns_domain 导致虚拟机域名解析失败

因为历史原因遗留问题，在 v3.11.8 版本之前部署的版本会默认设置虚拟机的 `/etc/resolve.conf` 里面的配置为 `search cloud.onecloud.io`。

这样的设置有可能导致虚拟机内部域名解析失败，如果出现此问题，可以通过下面的步骤取消全局 dns_domain 的配置，这样新建的虚拟机 DNS 配置就不会默认添加 `search` 配置。


## 取消默认配置

### 1. 取消 configmap 里面的 dns_domain 配置

```bash
kubectl edit configmap -n onecloud default-region

# 找到 dns_domain: cloud.yunion.io 这行的配置
...
    dns_domain: cloud.yunion.io
...
# 删掉这行，直接保存退出
```

### 2. 取消当前 region 服务的配置

```bash
climc service-config-edit region2

default:
  ...
  # 也是删除 dns_domain: cloud.yunion.io 这项
  dns_domain: cloud.yunion.io
  ...
```


### 3. 重启 region 服务

```bash
kubectl -n onecloud rollout restart deployment default-region
```

然后等待 default-region pod 变成 Running，新建虚拟机查看 `/etc/resolv.conf` 文件，如果里面没有设置 search 则配置生效。


## 对于已有虚拟机的影响

- 如果虚拟机是通过 dhcp 从平台分配的 ip ，则再次重新 dhcp 请求，就会修改 DNS 配置
- 如果虚拟机是静态配置的网络(比如纳管 vmware 虚拟机或者裸金属)，则需要手工修改
