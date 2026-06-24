---
sidebar_position: 27
edition: ce
---

# 更新 k3s 集群证书

介绍如何更新 ocboot 部署的 k3s 集群内部证书。

:::tip
本文介绍的是 **k3s 集群内部证书**（API Server、kubelet 等组件间通信证书）的更新，与 [更换前端证书](../fe/config-ssl-certs) 中描述的浏览器 HTTPS 证书不同。
:::

## 适用场景

- 使用 **老版本 ocboot** 部署的 k3s 集群，内部证书即将过期或已经过期
- 需要将证书有效期延长至 10 年（`CATTLE_NEW_SIGNED_CERT_EXPIRATION_DAYS=3650`）

## 背景说明

新版 ocboot 在部署 k3s 集群时，会自动在 `/etc/systemd/system/k3s.service.env` 中设置 `CATTLE_NEW_SIGNED_CERT_EXPIRATION_DAYS=3650`，签发的内部证书有效期为 **10 年**，一般无需手动处理。

若集群是使用老版本 ocboot 部署的，可能遇到内部证书失效的问题，可按本文手动轮换证书，并将有效期延长至 10 年。

## 注意事项

- 建议在 **维护窗口** 内执行，control plane 节点在轮换过程中会短暂不可用
- 操作顺序：**先更新所有 control plane（server）节点，再更新 worker（agent）节点**
- HA 集群需对 **每一个** control plane 节点执行 server 证书更新
- 脚本需从能 SSH 到各节点的管理机上执行；若无法远程 SSH，可参考下文手动执行步骤

## 使用 ocboot 脚本（推荐）

ocboot 在 `scripts/` 目录下提供了两个辅助脚本（自 v4.0.3 起）：

| 脚本 | 作用节点 | 说明 |
|------|----------|------|
| [`renew-k3s-server-certs.sh`](https://github.com/yunionio/ocboot/blob/master/scripts/renew-k3s-server-certs.sh) | control plane | 设置证书有效期环境变量，执行 `k3s certificate rotate` 并重启 k3s |
| [`renew-k3s-agent-certs.sh`](https://github.com/yunionio/ocboot/blob/master/scripts/renew-k3s-agent-certs.sh) | worker | 重启 k3s-agent，使其从 server 获取轮换后的新证书 |

### 1. 更新 control plane 证书

在管理机上进入 ocboot 仓库的 `scripts` 目录，对所有 control plane 节点执行：

```bash
$ cd ocboot/scripts

# 单节点
$ ./renew-k3s-server-certs.sh 10.0.0.1

# 指定 SSH 用户和端口
$ ./renew-k3s-server-certs.sh 10.0.0.1 root 22

# HA 集群，一次传入多个 control plane 节点
$ ./renew-k3s-server-certs.sh "10.0.0.1 10.0.0.2 10.0.0.3"
```

脚本会在每个节点上依次执行：

1. 检查 `k3s` 服务是否存在
2. 在 `/etc/systemd/system/k3s.service.env` 中设置 `CATTLE_NEW_SIGNED_CERT_EXPIRATION_DAYS=3650`
3. 停止 `k3s` 服务
4. 执行 `k3s certificate rotate` 轮换证书
5. 重新加载 systemd 配置并启动 `k3s` 服务

### 2. 更新 worker 节点

所有 control plane 节点证书更新完成并验证正常后，对所有 worker 节点执行：

```bash
$ ./renew-k3s-agent-certs.sh 10.0.0.10

# 多个 worker 节点
$ ./renew-k3s-agent-certs.sh "10.0.0.10 10.0.0.11 10.0.0.12"
```

脚本会在每个 worker 节点上停止并重启 `k3s-agent` 服务，使 agent 从 control plane 拉取轮换后的新证书。

:::info
`renew-k3s-agent-certs.sh` 当前仅重启 `k3s-agent` 服务，不在 agent 节点上单独执行 `k3s certificate rotate`。agent 证书会在 server 证书轮换完成后，通过重启 agent 自动更新。
:::

## 手动执行步骤

若无法从外部 SSH 批量执行脚本，可登录各节点手动操作。

### control plane 节点

```bash
# 1. 设置证书有效期环境变量
$ K3S_SERVICE_ENV="/etc/systemd/system/k3s.service.env"
$ if [ -f "${K3S_SERVICE_ENV}" ]; then
    if grep -q "^CATTLE_NEW_SIGNED_CERT_EXPIRATION_DAYS=" "${K3S_SERVICE_ENV}"; then
      sed -i 's/^CATTLE_NEW_SIGNED_CERT_EXPIRATION_DAYS=.*/CATTLE_NEW_SIGNED_CERT_EXPIRATION_DAYS=3650/' "${K3S_SERVICE_ENV}"
    else
      echo "CATTLE_NEW_SIGNED_CERT_EXPIRATION_DAYS=3650" >> "${K3S_SERVICE_ENV}"
    fi
  else
    echo "CATTLE_NEW_SIGNED_CERT_EXPIRATION_DAYS=3650" > "${K3S_SERVICE_ENV}"
  fi

# 2. 停止 k3s 并轮换证书
$ systemctl stop k3s
$ k3s certificate rotate

# 3. 重新启动 k3s
$ systemctl daemon-reload
$ systemctl start k3s
```

### worker 节点

```bash
$ systemctl stop k3s-agent
$ systemctl start k3s-agent
```

## 验证

确认各节点服务状态正常：

```bash
# control plane 节点
$ systemctl is-active k3s
active

# worker 节点
$ systemctl is-active k3s-agent
active
```

确认集群节点全部 Ready：

```bash
$ kubectl get nodes
NAME                 STATUS   ROLES                  AGE   VERSION
control-plane-1      Ready    control-plane,master   1y    v1.28.5+k3s1
worker-1             Ready    <none>                 1y    v1.28.5+k3s1
```

可选：检查 API Server 证书有效期：

```bash
$ openssl x509 -in /var/lib/rancher/k3s/server/tls/serving-kube-apiserver.crt -noout -dates
notBefore=Jun 24 00:00:00 2025 GMT
notAfter=Jun 22 00:00:00 2035 GMT
```

## 故障排查

若服务启动失败，查看日志：

```bash
# control plane 节点
$ journalctl -u k3s -n 50

# worker 节点
$ journalctl -u k3s-agent -n 50
```
