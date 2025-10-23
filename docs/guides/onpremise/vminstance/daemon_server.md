---
sidebar_position: 16
---

# Daemon 虚拟机

本节介绍如何设置虚拟机随宿主机操作系统开机启动。虚机的开机启动是通过设置虚机为 daemon 虚机来实现的，如果设置虚机为 daemon 虚机，则每一次 host-agent 启动时会确保该虚机是运行中的状态。


## 设置 daemon 虚机

### 创建虚机时设置 daemon 虚机

```bash
$ climc server-create --is-daemon ...

# 查看虚机是否设置为 daemon 虚机
$ climc server-show <ID> | grep is_daemon
| is_daemon                  | true
```

### 设置已有虚机 daemon 模式

```bash
# [--is-daemon/--no-daemon]
$ climc server-update --is-daemon <ID>
```

## 设置新建虚机默认为 daemon 虚机

```bash
# 修改 region 配置 添加 set_kvm_server_as_daemon_on_create: true
$ climc service-config-edit region2

# 添加完配置后重启 region
$ kubectl rollout restart deploy -n onecloud default-region
```

完成后新建的虚机默认设置为 daemon 虚机。
