---
edition: ce
sidebar_position: 22
---

# 故障恢复

本文描述平台出现常见异常故障后的恢复手段。

## 恢复admin密码

admin 是平台部署后默认创建的默认用户，如果丢失了admin的密码，可以登录控制节点shell，执行如下climc命令重置admin密码：

```bash
climc user-update admin --password "new_password_of_admin"
```

## 恢复sysadmin密码

sysadmin 是平台的默认系统用户，控制节点shell的climc的用户就是sysadmin。可能在以下情况平台会丢失sysadmin的密码：
* 恢复平台的数据库到以前的一个版本
* 修改了sysadmin密码但不小心遗忘sysadmin密码

可以通过如下流程恢复sysadmin的密码：

首先修改keystone的configmaps:

```bash
kubectl -n onecloud edit configmaps default-keystone
```

修改如下两项：

```
bootstrap_admin_user_password: initial_sysadmin_password
reset_admin_user_password: true
```

重启default-keystone容器，则sysadmin的密码重置为 initial_sysadmin_password

注意：如上操作成功后应恢复 reset_admin_user_password 为false，否则每次重启keystone都会重置 sysadmin 密码。

## 恢复宿主机的主机目录

可能存在丢失宿主机上 /opt/cloud/workspace/servers 下特定主机或者所有主机的目录，此时，通过平台可以看到该虚拟机的状态变为 not_found 或 unknown，且无法恢复状态。

可以通过如下方法恢复虚拟机的目录：

假设虚拟机的ID为：89b69a7d-cc0b-428f-81dc-06fe1f283594

首先在宿主机的 /opt/cloud/workspace/servers 目录下创建目录 89b69a7d-cc0b-428f-81dc-06fe1f283594，并在该目录下创建一个desc文件，内容如下：

如果是虚拟机：

```json
{"uuid":"89b69a7d-cc0b-428f-81dc-06fe1f283594","hypervisor":"kvm"}
```

如果是容器主机：
```json
{"uuid":"89b69a7d-cc0b-428f-81dc-06fe1f283594","hypervisor":"pod"}
```

最后，重启该宿主机上的host服务，重启完成后，该虚拟机的状态将变为ready。
