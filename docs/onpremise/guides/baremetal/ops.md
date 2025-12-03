---
sidebar_position: 3.1
---

# 物理机相关操作

## 查看物理机列表信息

### 查询物理机

```bash
# list baremetal 记录
climc host-list --baremetal true

# list 已经安装系统的物理机
climc host-list --baremetal true --occupied

# list 未安装系统的物理机
climc host-list --baremetal true --empty

# 查询物理机详情，包括硬件信息，机房信息
climc host-show <host_id>
```

### 获取物理机登录信息

```bash
climc host-logininfo <host_id>
```

## 远程终端

通过远程终端连接到物理机。该功能支持使用SOL（Serial over LAN）和ssh远程连接到物理机。SOL即通过串口进行远程连接。连接之后需要使用初始账号列中的用户名和密码进行登录。

:::tip
- 若用户启用了MFA，打开远程终端需要先进行MFA验证。
:::

### 前端界面操作

1. 在左侧导航栏，选择 **_"主机/基础资源/物理机"_** 菜单项，进入物理机页面。
2. 单击物理机右侧操作列 **_"远程终端"_** 按钮，选择下拉菜单 **_"SOL远程终端"_** 菜单项，通过SOL方式远程连接物理机。
3. 单击物理机右侧操作列 **_"远程终端"_** 按钮，选择下拉菜单 **_"SSH IP地址"_** 菜单项，与物理机建立web SSH连接。
4. 若物理机上的22端口被其他应用占用，ssh服务端口为其他端口时，可选择下拉菜单 **_"SSH IP地址:自定义端口"_** 菜单项，在弹出的对话框框中设置端口号，单击 **_"确定"_** 按钮与物理机建立web SSH连接。
5. 单击物理机右侧操作列 **_"远程终端"_** 按钮，选择下拉菜单 **_"Java控制台"_** 菜单项，下载并打开jnlp文件，连接物理机。

## 启用/禁用

启用或禁用物理机，启用状态的物理机用于创建裸金属服务器。

### 启用

```bash
# 启用物理机
$ climc host-enable --baremetal true <id>
```

### 禁用

该功能用于禁用”启用“状态的物理机，禁用状态的物理机不能创建裸金属服务器。

```bash
# 禁用物理机
climc host-disable --baremetal true <id>
```

## 开/关机

### 开机

该功能用于将关机状态的物理机开机。

```bash
climc host-start <host_id>
```

### 关机

该功能用于将运行状态的物理机关机，当物理机已分配给裸金属使用时，不支持关机操作。

```bash
climc host-stop <host_id>
```

## 进入/退出维护模式

将物理机进入/退出维护模式，维护模式下可以更改分区、重做RAID、更改密码等操作。

### 进入维护模式

该功能用于将已分配裸金属设备的物理机进入离线系统（PXE引导系统），管理员在离线系统可以进行更改分区、重做RAID、更改密码等操作。未分配的物理机默认就处于离线系统。

```bash
climc host-maintenance <host_id>
```

### 退出维护模式

该功能用于退出维护模式。

```bash
climc host-unmaintenance <host_id>
```

## 删除物理机


该功能用于删除物理机，未分配给裸金属设备且禁用状态的物理机才可以删除。

```bash
climc host-delete <host_id>
```
