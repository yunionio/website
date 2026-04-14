---
sidebar_position: 20
---

# 基本操作

本文介绍容器主机的常见climc命令

## 创建容器主机

```bash
# 创建一个名称为test-climc的容器主机
# 内存配额2g
# 容器镜像为 registry.cn-beijing.aliyuncs.com/yunion/climc:v4.0.2
# 创建好后自动运行
# 容器运行命令 sleep 3600
# 容器接入网络 vnet221
# 创建一个10g大小的本地数据盘，格式为raw，格式化为ext4
# 将该数据盘挂载到容器的 /data
climc pod-create test-climc \
    2g \
    registry.cn-beijing.aliyuncs.com/yunion/climc:v4.0.2 \
    --auto-start \
    --command sleep --args 3600 \
    --net vnet221 \
    --disk local:10g:raw:ext4 \
    --volume-mount 'mount_path=/data,disk_index=0'
```

## 查看容器主机

```bash
# 容器主机还是主机(server)，通过hypervisor过滤
climc server-list --hypervisor pod
```

## 开机/关机/重启等操作

```bash
# 容器主机还是主机，可以通过server-start/stop/restart来操作
climc server-start <pod_id> ...
climc server-stop <pod_id> ...
climc server-restart <pod_id> ...
```

## 查看容器列表

```bash
# 查看容器主机(pod)下的所有container
climc container-list --guest-id <pod_id>
```
## 停止/启动容器

可以单独停止或启动一个pod下的某个容器
```bash
climc container-stop <container_id>
climc container-start <container_id>
```

## 修改container的配置(spec)

只有container状态为exited时才能修改容器的spec
```bash
climc container-update-spec <container_id>
```

## 查看容器的日志

```bash
climc container-log [--follow|-f] [--tail TAIL] [--timestamps] [--limit-bytes LIMIT_BYTES] [--since SINCE] <container_id>
# 举例: 查看过去3小时的 claw-0 容器日志，并等待实时输出
climc container-log -f claw-0 --since 3h
```

## 在容器内执行命令

只有container状态为running才能进入容器exec执行命令

```bash
climc container-exec <container_id> <command> [--args arg0 --args arg1 ...]
# 举例: 进入claw-0 的shell
climc container-exec claw-0 sh
```

## 容器拷文件

只有container状态为running才能执行拷贝命令

```bash
# 将本地文件拷贝进入容器的指定路径
climc container-cp <local_path> <container_id:container_path>
# 举例
climc container-cp /etc/hosts claw-0:/etc/hosts
```