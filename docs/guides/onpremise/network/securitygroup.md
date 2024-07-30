---
sidebar_position: 10
---

# 安全组

安全组是承载主机网络防火墙规则的逻辑资源，主机一般默认关联一条安全组，同时允许关联多个安全组。

## 普通安全组与管理安全组

一台主机关联的安全组分为普通安全组和管理安全组两类。普通安全组默认有一条，同时允许多条，普通用户可以通过WebUI或者climc命令修改主机的普通安全组。

通过如下climc命令设置虚拟机的安全组：

```bash
# 全量设置主机的安全组，如果安全组列表为空，则表示清空安全组
climc server-set-secgroup <server_id> <secgroup_1> <secgroup_2> ...
```

平台管理员还可以设置每台主机的管理安全组，用户无法修改主机关联的管理安全组。主机只能关联一条管理安全组。

```bash
# 设置管理安全组
climc server-assign-admin-secgroup <server_id> <secgroup>
# 清除管理安全组
climc server-revoke-admin-secgroup <server_id>
```

## 经典网络安全组

经典网络的安全组规则由sdnagent转换为openflow流表规则, 下发到虚拟机所在宿主机的openvswitch实现功能。

### 禁用安全组

可以完全禁用经典网络的安全组。方法为：修改oc，设置 disableSecurityGroup: true 全局禁用安全组功能。修改后，需要重启 default-host 的daemonset。

```
kubectl -n onecloud edit oc
kubectl -n onecloud rollout restart daemonset default-host
```

## VPC网络安全组

VPC网络的安全组功能通过ovn实现，由vpcagent将安全组规则转换为ovn的LogicalSwitch的ACL规则实现。
