---
sidebar_position: 2
---

# 自动化安装虚拟机

介绍如何结合 Kickstart/Autoinstall、cloud-init 与 `climc` 命令，在私有云环境中批量完成虚拟机的自动化装机与初始化配置。

## 功能介绍

CloudPods 虚拟机自动化安装功能支持两种主流的无人值守安装方式，让您可以快速批量部署标准化的虚拟机系统。该功能基于 QEMU/KVM 虚拟化技术，支持通过配置文件内容或配置文件URL两种方式传递安装参数，实现完全自动化的操作系统部署。

### Kickstart 自动安装
适用于 Red Hat 系列操作系统的传统自动安装方式：
- **适用系统**：CentOS、RHEL、Fedora、openEuler 等 Red Hat 系列操作系统
- **配置文件格式**：anaconda-ks.cfg 格式，使用 Anaconda 安装器的标准配置语法

### Autoinstall 自动安装
适用于现代 Ubuntu 系统的云原生自动安装方式：
- **适用系统**：Ubuntu Server ≥ 20.04, Desktop ≥ 23.04 系统
- **配置文件格式**：cloud-init 的 user-data/meta-data 格式，使用 YAML 语法

### 配置传递方式
CloudPods 提供两种灵活的配置传递方式：
- **直接内容方式（content）**：将配置文件内容直接传递给系统，系统自动生成配置ISO并挂载到虚拟机
- **外部URL方式（config_url）**：提供HTTP/HTTPS配置文件地址，虚拟机启动时通过网络获取配置

## 支持的操作系统

| 操作系统 | 自动安装方式 | 支持版本 | 已测试版本 |
|---------|-------------|----------|-----------|
| Ubuntu | Autoinstall | Server ≥ 20.04, Desktop ≥ 23.04 | Server: 20.04.6, 22.04.5, 24.04.3, 25.04; Desktop: 24.04.3, 25.04 |
| CentOS | Kickstart | Stream 9, Stream 10 | Stream 9, Stream 10 |
| RHEL | Kickstart | 8.x, 9.x, 10.x | 8.10, 9.6, 10.0 |
| Fedora | Kickstart | 41, 42 | 41, 42 |
| openEuler | Kickstart | 20.03 LTS, 22.03 LTS, 24.03 LTS | 20.03 LTS SP4, 22.03 LTS SP3/SP4, 24.03 LTS SP1/SP2 |

**重要提示**：当使用 **Fedora**、**CentOS Stream** 等滚动发行版系统时，强烈建议使用 **最新版本镜像** 或 **DVD 完整镜像**。这是由于滚动发行版的软件仓库更新频繁，较老的镜像中的内核版本可能与当前仓库中的软件包版本不匹配，导致安装过程中出现内核模块缺失、依赖冲突或启动失败等问题。
## 快速开始

### 准备自动化安装所需的配置文件

#### Kickstart配置

```
# --- 系统本地化与基础设置 ---
lang en_US
keyboard --xlayouts='us'
timezone Asia/Shanghai --utc

# 设置 root 用户的密码
# 建议使用 rootpw xxx --iscrypted 来通过增强安全性
rootpw --iscrypted --allow-ssh $6$NTuyxRRJ1sS2iCO0$yBbMfzmjpoOCf0/Z8LRiuFOG5sCqsmWnaGE9Vv084iFEVtGxnGDpB3bodIh42q28OD28oIZz.61jFsmrviUlg.
user --groups=wheel --name=cloudpods --password=$6$NTuyxRRJ1sS2iCO0$yBbMfzmjpoOCf0/Z8LRiuFOG5sCqsmWnaGE9Vv084iFEVtGxnGDpB3bodIh42q28OD28oIZz.61jFsmrviUlg. --iscrypted --gecos="cloudpods"
# password admin@123

# 使用图形化安装界面
graphical
# 安装完成后自动重启
reboot

# --- 安装源与引导程序 ---
# 指定安装源为本地光驱(CD/DVD/ISO)
cdrom
# 配置引导加载程序(GRUB)，并添加内核参数
bootloader --append="rhgb quiet crashkernel=1G-4G:192M,4G-64G:256M,64G-:512M"

# --- 磁盘分区 ---
zerombr
clearpart --all --initlabel
autopart

# --- 网络与系统服务 ---
# 配置网络，使用DHCP协议自动获取IP地址
network --bootproto=dhcp
skipx
firstboot --disable
selinux --enforcing

# --- 安装后脚本 ---
# %post 部分的脚本会在所有软件包安装完毕、系统首次重启之前执行
%post
# 安装完成后输出完成信号
echo "KICKSTART_COMPLETED" > /dev/ttyS1
%end

# --- 软件包选择 ---
%packages
@^minimal-environment
kexec-tools
%end
```

获取配置文件的方式：

1. 参考[红帽官方文档](https://docs.redhat.com/zh-cn/documentation/red_hat_enterprise_linux/10/html/automatically_installing_rhel/creating-kickstart-files)自行编写
2. 使用[红帽官方的配置生成器](https://access.redhat.com/labsinfo/kickstartconfig)](https://github.com/pykickstart/pykickstart)创建配置文件
3. 使用 [pykickstart](https://github.com/pykickstart/pykickstart)创建配置文件
4. 手动执行一次完整安装，在安装后的虚拟机的 `/root`目录获取

#### Autoinstall安装

```yaml
#cloud-config
autoinstall:
  version: 1
  identity:
    hostname: kickstart_test
    username: cloudpods
    password: $6$NTuyxRRJ1sS2iCO0$yBbMfzmjpoOCf0/Z8LRiuFOG5sCqsmWnaGE9Vv084iFEVtGxnGDpB3bodIh42q28OD28oIZz.61jFsmrviUlg.
    # password is admin@123
    realname: cloudpods
  locale: en_US.UTF-8
  keyboard:
    layout: us
  network:
    network:
      version: 2
      ethernets:
        ens5:
          dhcp4: true
  ssh:
    install-server: true
    allow-pw: true
  storage:
    layout:
      name: direct
  packages:
    - openssh-server
  late-commands:
    - echo "KICKSTART_COMPLETED" > /dev/ttyS1
```
不同的是 ubuntu 还需要在同目录下创建一个空的 meta-data 

获取配置文件的方式：

1. 参考[ubuntu官方文档](https://canonical-subiquity.readthedocs-hosted.com/en/latest/intro-to-autoinstall.html)自行编写
2. 手动执行一次完整安装，在安装后的虚拟机的 `/var/log/installer/autoinstall-user-data`目录获取

### 通过 Climc 工具创建自动安装虚拟机

CloudPods 提供了两种方式来传递自动化安装配置：

#### 方式一：直接提供配置内容（content）

```bash
# Kickstart 方式（CentOS/RHEL）
climc server-create \
  --generate-name myvm-kickstart \
  --hypervisor kvm \
  --cdrom <centos_image_id> \
  --ncpu 2 \
  --mem-spec 2048 \
  --disk "size=30G,backend=local" \
  --net "<network_id>" \
  --kickstart-os-type centos \
  --kickstart-config "$(cat kickstart.cfg)" \
  --auto-start

# Autoinstall 方式（Ubuntu）
climc server-create \
  --generate-name myvm-autoinstall \
  --hypervisor kvm \
  --cdrom <ubuntu_image_id> \
  --ncpu 2 \
  --mem-spec 2048 \
  --disk "size=30G,backend=local" \
  --net "<network_id>" \
  --kickstart-os-type ubuntu \
  --kickstart-config "$(cat autoinstall.yaml)" \
  --auto-start
```

#### 方式二：提供配置文件 URL（url）

```bash
# 使用外部配置文件 URL（Ubuntu）
climc server-create \
  --generate-name myvm-autoinstall \
  --hypervisor kvm \
  --cdrom <ubuntu_image_id> \
  --ncpu 2 \
  --mem-spec 2048 \
  --disk "size=30G,backend=local" \
  --net "<network_id>" \
  --kickstart-os-type ubuntu \
  --kickstart-config-url "http://your-server.com/ubuntu/" \
  --auto-start

# 使用外部配置文件 URL（CentOS）
climc server-create \
  --generate-name myvm-kickstart \
  --hypervisor kvm \
  --cdrom <centos_image_id> \
  --ncpu 2 \
  --mem-spec 2048 \
  --disk "size=30G,backend=local" \
  --net "<network_id>" \
  --kickstart-os-type centos \
  --kickstart-config-url "http://your-server.com/ks.cfg" \
  --auto-start
```

### 创建参数说明

| 参数                            | 说明                      | 示例                                                   | 必需  |
| ----------------------------- | ----------------------- | ---------------------------------------------------- | --- |
| `--kickstart-os-type`         | 操作系统类型，必须指定             | `--kickstart-os-type centos`                         | 是   |
| `--kickstart-config`          | 直接传递配置文件内容              | `--kickstart-config "$(cat config.cfg)"`             | 二选一 |
| `--kickstart-config-url`      | 配置文件的 HTTP/HTTPS URL 地址 | `--kickstart-config-url "http://example.com/ks.cfg"` | 二选一 |
| `--kickstart-enabled`         | 是否启用（默认：true）           | `--kickstart-enabled`                                | 否   |
| `--kickstart-max-retries`     | 最大重试次数（默认：3）            | `--kickstart-max-retries 5`                          | 否   |
| `--kickstart-timeout-minutes` | 安装超时时间（默认：60分钟）         | `--kickstart-timeout-minutes 90`                     | 否   |
| `--cdrom`                     | 操作系统安装镜像ID              | `--cdrom <image-id>`                                 | 是   |
| `--hypervisor`                | 虚拟化类型（必须为kvm）           | `--hypervisor kvm`                                   | 是   |

### 管理命令

CloudPods 提供了完整的 Kickstart 配置管理命令：

| 命令 | 功能说明 | 使用示例 |
|------|----------|----------|
| `climc server-set-kickstart` | 为已有虚拟机设置 Kickstart 配置 | `climc server-set-kickstart <server-id> --os-type centos --config "$(cat ks.cfg)"` |
| `climc server-kickstart` | 查看虚拟机的 Kickstart 配置状态 | `climc server-kickstart <server-id>` |
| `climc server-delete-kickstart` | 删除 Kickstart 配置 | `climc server-delete-kickstart <server-id>` |
| `climc server-kickstart-complete` | 手动标记安装完成 | `climc server-kickstart-complete <server-id> [--restart=false]` |

## 安装状态监控

CloudPods 通过串口监控技术实时跟踪自动化安装的进度，确保安装过程的可控性和可追溯性。

### 状态流转

自动化安装过程中，虚拟机状态会经历以下几个阶段：

1. **kickstart_pending** - 配置已设置，等待虚拟机启动
2. **kickstart_installing** - 正在进行自动化安装
3. **kickstart_completed** - 安装成功完成，系统将自动重启
4. **kickstart_failed** - 安装失败，可查看日志进行故障排除

### 状态标记要求

在您的 Kickstart 或 Autoinstall 配置文件中，**建议**包含以下状态标记来确保 CloudPods 能够正确跟踪安装进度：

```bash
# 在安装开始时发送（可选，用于确认安装已开始）
echo "KICKSTART_INSTALLING" > /dev/ttyS1

# 在安装完成时发送（必需，用于通知安装完成）
echo "KICKSTART_COMPLETED" > /dev/ttyS1

# 在安装失败时发送（可选，用于明确标记失败）
echo "KICKSTART_FAILED" > /dev/ttyS1
```

**注意：**
- 使用 `/dev/ttyS1` 而不是 `/dev/ttyS0`
- 如果没有包含这些状态标记, cloudpods 会自动扫描配置并将状态标记注入原配置
- Kickstart 配置应在 `%post` 部分添加，Autoinstall 配置应在 `late-commands` 部分添加
- 在自行检查安装成功后可手动使用 climc server-kickstart-complete 标记为已完成

### 消息格式支持

系统支持多种消息格式，以下格式都能正确识别：

```bash
# 简单格式（推荐）
KICKSTART_COMPLETED

# 带时间戳格式
[2024-01-01 12:34:56] KICKSTART_COMPLETED

# 带日志前缀格式
Jan 1 12:34:56 hostname anaconda: KICKSTART_COMPLETED

# 带自定义前缀格式
INFO: Installation complete - KICKSTART_COMPLETED
```

### 查看安装状态

可以通过多种方式查看当前的安装状态：

```bash
# 查看虚拟机详细信息（包括状态）
climc server-show <server-id>

# 专门查看 Kickstart 配置和状态
climc server-kickstart <server-id>

# 查看安装日志（在宿主机上）
cat /opt/cloud/workspace/servers/<server-id>/kickstart-serial.log
```

### 超时和重试机制

- **默认超时时间**：60分钟（可通过 `--kickstart-timeout-minutes` 配置）
- **默认重试次数**：3次（可通过 `--kickstart-max-retries` 配置）
- **重试触发**：可以通过重新启动虚拟机来触发重试
- **手动完成**：如果安装实际已完成但状态未更新，可使用 `climc server-kickstart-complete` 手动标记完成

## 注意事项

### 环境要求
- **虚拟化支持**：仅支持 KVM 虚拟化环境，不支持其他虚拟化技术
- **网络连接**：如果使用配置文件 URL 方式，确保虚拟机能够访问指定的 URL 地址

### 镜像选择建议
- **CentOS/RHEL**：推荐使用 DVD 完整版镜像，包含所有必需的安装组件
- **Ubuntu**：使用 Server 版本镜像，确保支持 autoinstall 功能（Desktop 版本需 ≥ 23.04）
- **Fedora**：强烈建议使用最新的 DVD 镜像，避免滚动更新导致的版本不匹配
- **openEuler**：使用官方 LTS 版本镜像，确保稳定性和兼容性

### 安全配置建议
- **密码安全**：配置文件中使用加密的密码哈希值，避免明文密码
- **用户管理**：创建具有 sudo 权限的普通用户，避免直接使用 root 登录
- **SSH 配置**：优先配置 SSH 密钥认证，禁用密码认证提升安全性
- **防火墙设置**：在配置文件中包含适当的防火墙规则

### 故障排除
- **安装卡住**：检查串口日志文件，确认是否缺少状态标记输出
- **网络问题**：对于 URL 方式，验证网络连接和 URL 可访问性
- **超时失败**：适当调整 `--kickstart-timeout-minutes` 参数
- **重复安装**：确保安装完成后 `KICKSTART_COMPLETED` 标记被正确发送

### 配置文件编写建议
- **日志记录**：启用详细的安装日志，便于问题诊断
- **测试验证**：在生产环境使用前，先在测试环境验证配置文件的正确性

### A.1 Ubuntu 22.04 安装配置示例 (user-data)

```yaml
#cloud-config
autoinstall:
  version: 1
  identity:
    hostname: kickstart_test
    username: cloudpods
    password: $6$NTuyxRRJ1sS2iCO0$yBbMfzmjpoOCf0/Z8LRiuFOG5sCqsmWnaGE9Vv084iFEVtGxnGDpB3bodIh42q28OD28oIZz.61jFsmrviUlg.
    # password is admin@123
    realname: cloudpods
  locale: en_US.UTF-8
  keyboard:
    layout: us
  network:
    network:
      version: 2
      ethernets:
        ens5:
          dhcp4: true
  ssh:
    install-server: true
    allow-pw: true
  storage:
    layout:
      name: direct
  packages:
    - openssh-server
  late-commands:
    - echo "KICKSTART_COMPLETED" > /dev/ttyS1
```

### A.2 Fedora 42 安装配置示例

```bash
keyboard --vckeymap=us --xlayouts='us'
lang en_US.UTF-8

%packages
@^server-product-environment
%end

firstboot --enable

ignoredisk --only-use=sda
autopart
clearpart --none --initlabel

timezone Asia/Shanghai --utc

rootpw  --allow-ssh --iscrypted $6$NTuyxRRJ1sS2iCO0$yBbMfzmjpoOCf0/Z8LRiuFOG5sCqsmWnaGE9Vv084iFEVtGxnGDpB3bodIh42q28OD28oIZz.61jFsmrviUlg.
# admin@123

%post
echo "KICKSTART_COMPLETED" > /dev/ttyS1
%end
```

### A.3 CentOS 9 Stream 安装配置示例(DVD)

```bash
keyboard us
lang en_US.UTF-8
cdrom
repo --name="AppStream" --baseurl=file:///run/install/sources/mount-0000-cdrom/AppStream

%packages
@^minimal-environment
%end

autopart
clearpart --all --initlabel
timezone Asia/Shanghai
rootpw  --iscrypted $6$NTuyxRRJ1sS2iCO0$yBbMfzmjpoOCf0/Z8LRiuFOG5sCqsmWnaGE9Vv084iFEVtGxnGDpB3bodIh42q28OD28oIZz.61jFsmrviUlg.
# admin@123

%post
echo "KICKSTART_COMPLETED" > /dev/ttyS1
%end
```

### A.4 RHEL 10 安装配置示例(DVD)

```bash
lang en_US
keyboard --xlayouts='us'
timezone Asia/Shanghai --utc
rootpw --allow-ssh admin@123
graphical
reboot
cdrom
bootloader --append="rhgb quiet crashkernel=1G-4G:192M,4G-64G:256M,64G-:512M"
zerombr
clearpart --all --initlabel
autopart
network --bootproto=dhcp
skipx
firstboot --disable
selinux --enforcing

%packages
@^minimal-environment
kexec-tools
%end

%post  
echo "KICKSTART_COMPLETED" > /dev/ttyS1
%end
```

### A.5 openEuler 24.03 LTS SP2 安装配置示例(DVD)

```bash
graphical

keyboard --vckeymap=us --xlayouts='us'
lang en_US.UTF-8

network --bootproto=dhcp --device=ens5 --ipv6=auto --activate

harddrive --dir= --partition=LABEL=openEuler-24.03-LTS-SP2-x86_64

%packages
@^minimal-environment
%end

firstboot --enable

ignoredisk --only-use=sda
autopart
clearpart --none --initlabel

timezone Asia/Shanghai --utc

rootpw  --iscrypted $6$NTuyxRRJ1sS2iCO0$yBbMfzmjpoOCf0/Z8LRiuFOG5sCqsmWnaGE9Vv084iFEVtGxnGDpB3bodIh42q28OD28oIZz.61jFsmrviUlg.
# admin@123

%post
echo "KICKSTART_COMPLETED" > /dev/ttyS1
%end
```