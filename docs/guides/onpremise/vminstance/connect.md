---
sidebar_position: 2
---

# 登录虚拟机

创建好虚拟机后，登录的方式大概分为以下几种：

- ssh: linux 通用，要求虚拟机网络可达。
- rdp: windows 远程桌面，要求虚拟机网络可达；可通过RDP对应的客户端连接Windows操作系统的虚拟机。
- vnc: vnc 链接，对虚拟机网络没有要求，只要能链接云平台前端即可。

## 通过前端登录

### VNC

在虚拟机页面，单击虚拟机右侧操作列操作列 “远程终端” 按钮，选择 “VNC远程终端” 菜单项。

![](./images/webvnc.png)

### SSH

单击 “远程终端” 按钮，选择 “SSH IP地址” 菜单项，与虚拟机建立web SSH连接。

![](./images/webssh.png)

## 通过 climc 登录

针对以上的链接方式，我们提供以下命令行链接云虚拟机：

### SSH 远程登录

查询 server 的 ip

```bash
# 可通过 server-list --search --details 的方式找到虚拟机的 ip
$ climc server-list --search <server_name> --details 

# 或者通过 server-show <server_id> 的方式得到 ip
$ climc server-show <server_name> | grep ip
| ips                  | 10.168.222.226 |
```

查询 server 的登录信息

```bash
$ climc server-logininfo <server_name>
+----------+-----------------------------+
|  Field   |            Value            |
+----------+-----------------------------+
| password | @2aWXB6AmCbV                |
| updated  | 2019-07-03T10:00:20.801716Z |
| username | root                        |
+----------+-----------------------------+
```

ssh 登录

```bash
$ ssh root@10.168.222.226
```

### SSH 直接登录

因为平台会自动给虚拟机注入公钥，所以可以直接免密登录 Linux 虚拟机，命令如下。

:::tip
该命令对 VPC 里面的虚拟机也生效，对于 VPC 的虚拟机，会自动创建 forward 隧道。
:::

```bash
$ climc server-ssh <server_name>
```

