---
sidebar_position: 1
---

# 启用/禁用宿主机

控制宿主机的启用状态，启用状态下的宿主机用于创建虚拟机。

## Climc操作

### 启用


```bash
# 找到禁用的宿主机
$ climc host-list --disabled

# 启用宿主机
$ climc host-enable <host_id>
```

### 禁用

```bash
# 禁用宿主机
$ climc host-disable <host_id>
```
