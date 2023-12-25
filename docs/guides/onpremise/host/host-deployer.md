---
sidebar_position: 6
---

# host-deployer 服务介绍

host-deployer 在 cloudpods 中是以 daemonset 的方式部署的，主要对虚机镜像文件进行初始化和系统探测操作。具体内容包括
- 设置虚机密码和密钥
- 注入自定义数据
- 注入虚机监控组件
- 配置虚机网络环境
- 磁盘格式化，制作文件系统
- 镜像系统信息探测
- ......

可通过 `kubectl -n onecloud get pods -l app=host-deployer` 查看
```bash
$ kubectl -n onecloud get pods -l app=host-deployer
NAME                          READY   STATUS    RESTARTS   AGE
default-host-deployer-6qtzz   1/1     Running   2          19d
default-host-deployer-78rk9   1/1     Running   0          19d
```

对虚机的镜像文件进行初始化，host-deployer 目前支持两种方式：
- 使用 nbd 模块在宿主机上挂载虚拟机磁盘文件（3.10.8 之前的默认方式）
- 通过运行虚机将需要部署的镜像在虚机内部署（3.10.8 开始默认方式）

qemu-nbd 挂载磁盘示例：
```bash
$ qemu-nbd -c /dev/nbd1 /disk1_path
$ mount /dev/nbd1p2 /mount_path
# 接下来就可以对 mount_path 做虚机部署操作了

# 断开连接
$ umount /mount_path
$ qemu-nbd -d /dev/nbd1
```

在 3.10.8 之前使用 nbd 的方式部署虚机，不过这种方法存在一些缺陷:
- 并发环境下可能会引起资源冲突，如 lvm uuid 和 xfs uuid 冲突
- 依赖宿主机内核支持虚机系统的文件系统，比如高版本的 xfs, btrfs等
- 依赖宿主机安装 qemu-nbd 和宿主机内核含有 nbd 模块，并且经常会遇到 nbd 设备残留的问题；
nbd 设备残留的问题主要原因是在 qemu-nbd disconnect 时磁盘文件系统中残留文件被操作系统打开

所以在 3.10.8 版本开发了支持使用轻量虚机的方式部署磁盘。

# 虚机部署介绍

部署虚机运行的是一个定制化的 initramfs，是一个内存系统，里面除了要部署的磁盘文件没有其他磁盘设备。
宿主机上的 host-deployer 负责部署虚机的生命周期管理，并且在部署虚机启动后通过 ssh 控制虚机对虚机的镜像文件部署。
initramfs 的制作参考：https://github.com/yunionio/yunionos
相比于 nbd 挂载磁盘的依赖宿主机的环境来说，更新 initramfs 相对更方便一些。


虚机部署运行示例：
```bash
$ /usr/libexec/qemu-kvm -smp 2 -m 256M -kernel kernel_path -initrd initrd_path -netdev user,id=hostnet0,hostfwd=tcp::10022-:22 ...
# 虚机通过暴露 22 端口让宿主机 host-deployer 服务控制部署流程
```

通过虚机部署默认最多可以同时运行 5 台部署虚机，可以通过修改 /etc/yunion/host.conf 来修改并发度：
```bash
# 例如修改并发度为 10
$ vi /etc/yunion/host.conf
deploy_concurrent: 10
```

相比于 nbd 部署，使用虚机部署的时间相对来说会长一些。如果需要切回 nbd 部署可以修改configmap default-host:
```bash
$ kubectl edit cm -n onecloud default-host
image_deploy_driver: nbd
```