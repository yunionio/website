# 文档重构布局结构预览

本文档展示按照推荐方案重构后的文档结构。

## 📁 新目录结构

```
docs/
├── shared/                          # 共享文档（所有产品通用）
│   ├── introduction/                # 产品介绍（通用）
│   │   ├── index.md
│   │   ├── login.md
│   │   ├── kvm.md
│   │   ├── multicloud.md
│   │   ├── vmware.md
│   │   ├── baremetal.md
│   │   ├── keystone.md
│   │   └── cloudsso.md
│   │
│   ├── development/                 # 开发文档（通用）
│   │   ├── index.mdx
│   │   ├── backend-framework.md
│   │   ├── codestruct.md
│   │   ├── dev-env.md
│   │   ├── devtools.md
│   │   ├── go-convention.md
│   │   ├── git-convention.md
│   │   ├── apisdk/
│   │   │   ├── index.mdx
│   │   │   ├── api.md
│   │   │   ├── apigateway.md
│   │   │   └── sdk.md
│   │   ├── resource_sync/
│   │   ├── monitor/
│   │   └── changelog/
│   │
│   ├── guides/                      # 通用使用指南
│   │   ├── auth_security/           # 认证与安全（通用）
│   │   │   ├── index.mdx
│   │   │   ├── domain.md
│   │   │   ├── project.md
│   │   │   ├── directory.md
│   │   │   ├── quota.md
│   │   │   ├── princple.md
│   │   │   ├── serviceconfig.md
│   │   │   └── identity/
│   │   │
│   │   └── climc/                    # CLI 工具（通用）
│   │       ├── index.mdx
│   │       ├── auth.md
│   │       └── usage.md
│   │
│   ├── operations/                  # 运维文档（通用部分）
│   │   ├── index.mdx
│   │   ├── component.mdx
│   │   ├── databases/
│   │   ├── log/
│   │   ├── monitoring/
│   │   └── platform-issues/
│   │
│   ├── release-notes/               # 发布说明（通用）
│   │   ├── index.mdx
│   │   ├── v3_11_x.md
│   │   ├── v3_10_x.md
│   │   ├── v3_9_x.md
│   │   └── v3_8_x.md
│   │
│   └── contact/                     # 联系方式（通用）
│       └── index.mdx
│
├── onpremise/                       # 私有云管理文档
│   ├── getting-started/             # 私有云快速开始
│   │   ├── index.mdx
│   │   ├── quickstart-virt.md
│   │   ├── host.md
│   │   ├── ha-ce.md
│   │   ├── baremetal.mdx
│   │   ├── buildah-k3s.md
│   │   └── lbagent.mdx
│   │
│   ├── guides/                       # 私有云使用指南
│   │   ├── index.mdx
│   │   ├── vminstance/               # 虚拟机管理
│   │   │   ├── index.mdx
│   │   │   ├── create.md
│   │   │   ├── migrate.md
│   │   │   ├── qga.md
│   │   │   ├── passthrough/
│   │   │   └── import/
│   │   │
│   │   ├── storage/                  # 存储管理
│   │   │   ├── index.mdx
│   │   │   ├── blockstorage/
│   │   │   └── backupstorage/
│   │   │
│   │   ├── network/                  # 网络管理
│   │   │   ├── index.mdx
│   │   │   ├── configuration.md
│   │   │   ├── vpc/
│   │   │   └── ssh/
│   │   │
│   │   ├── host/                     # 宿主机管理
│   │   │   ├── index.mdx
│   │   │   ├── troubleshooting.md
│   │   │   └── host-deployer.md
│   │   │
│   │   ├── glance/                   # 镜像管理
│   │   │   ├── index.mdx
│   │   │   ├── sysimage/
│   │   │   └── guestimage/
│   │   │
│   │   ├── baremetal/                # 裸金属管理
│   │   │   ├── index.mdx
│   │   │   ├── create-register.mdx
│   │   │   └── create-server.md
│   │   │
│   │   ├── lb/                       # 负载均衡
│   │   │   ├── index.mdx
│   │   │   └── principle.md
│   │   │
│   │   └── scheduler/                # 调度器
│   │       ├── index.mdx
│   │       └── schedtags.md
│   │
│   └── operations/                   # 私有云运维（产品特定）
│       ├── index.mdx
│       ├── agent.mdx
│       ├── change-node-ip.md
│       ├── remove-host.md
│       ├── recovery.md
│       ├── ha/
│       └── k8s/
│
├── cmp/                             # 多云管理文档
│   ├── getting-started/             # 多云管理快速开始
│   │   ├── index.mdx
│   │   ├── quickstart-ocboot.md
│   │   ├── quickstart-docker-compose.md
│   │   ├── quickstart-k8s-helm.md
│   │   ├── buildah-k3s.md
│   │   └── ha-ce.md
│   │
│   ├── guides/                       # 多云管理使用指南
│   │   ├── index.mdx
│   │   ├── cloudaccounts/           # 云账号管理
│   │   │   ├── index.mdx
│   │   │   ├── cloudaccount.md
│   │   │   ├── iam.md
│   │   │   ├── aws.md
│   │   │   ├── azure_subscription.md
│   │   │   ├── openstack.md
│   │   │   └── vmware_net.md
│   │   │
│   │   ├── vminstance/               # 多云虚拟机
│   │   │   ├── index.mdx
│   │   │   ├── faq.md
│   │   │   └── sku.md
│   │   │
│   │   ├── networks/                 # 多云网络
│   │   │   ├── index.mdx
│   │   │   └── dns.md
│   │   │
│   │   ├── secgroup/                 # 安全组
│   │   │   ├── index.mdx
│   │   │   └── principle.md
│   │   │
│   │   ├── saml/                     # SSO
│   │   │   ├── index.mdx
│   │   │   └── usage.md
│   │   │
│   │   └── vmware/                   # VMware 管理
│   │       ├── index.mdx
│   │       └── vmware_net.md
│   │
│   └── operations/                   # 多云管理运维（产品特定）
│       ├── index.mdx
│       └── ...
│
└── baremetal/                       # 物理机管理文档
    ├── getting-started/              # 物理机管理快速开始
    │   ├── index.mdx
    │   └── docker-compose.mdx
    │
    ├── guides/                       # 物理机管理使用指南
    │   ├── index.mdx
    │   ├── host-management/         # 主机管理
    │   ├── os-installation/          # 操作系统安装
    │   ├── raid-config/              # RAID配置
    │   └── network-config/           # 网络配置
    │
    └── operations/                   # 物理机管理运维（产品特定）
        └── index.mdx
```

## 🔗 URL 路径映射

### 共享文档
- `/docs/shared/introduction` - 产品介绍
- `/docs/shared/development` - 开发文档
- `/docs/shared/guides/auth_security` - 认证与安全
- `/docs/shared/guides/climc` - CLI 工具
- `/docs/shared/release-notes` - 发布说明

### 私有云管理
- `/docs/onpremise/getting-started` - 快速开始
- `/docs/onpremise/guides/vminstance` - 虚拟机管理
- `/docs/onpremise/guides/storage` - 存储管理
- `/docs/onpremise/guides/network` - 网络管理
- `/docs/onpremise/operations` - 运维文档

### 多云管理
- `/docs/cmp/getting-started` - 快速开始
- `/docs/cmp/guides/cloudaccounts` - 云账号管理
- `/docs/cmp/guides/vminstance` - 多云虚拟机
- `/docs/cmp/operations` - 运维文档

### 物理机管理
- `/docs/baremetal/getting-started` - 快速开始
- `/docs/baremetal/guides/host-management` - 主机管理
- `/docs/baremetal/operations` - 运维文档

## 📋 文档分类映射

### 从旧结构到新结构的映射

| 旧路径 | 新路径 | 说明 |
|--------|--------|------|
| `docs/introduction/` | `docs/shared/introduction/` | 通用介绍 |
| `docs/development/` | `docs/shared/development/` | 通用开发文档 |
| `docs/guides/auth_security/` | `docs/shared/guides/auth_security/` | 通用认证 |
| `docs/guides/climc/` | `docs/shared/guides/climc/` | 通用 CLI |
| `docs/release-notes/` | `docs/shared/release-notes/` | 通用发布说明 |
| `docs/contact/` | `docs/shared/contact/` | 通用联系方式 |
| `docs/getting-started/onpremise/` | `docs/onpremise/getting-started/` | 私有云快速开始 |
| `docs/guides/onpremise/` | `docs/onpremise/guides/` | 私有云指南 |
| `docs/operations/` (部分) | `docs/onpremise/operations/` | 私有云运维 |
| `docs/getting-started/cmp/` | `docs/cmp/getting-started/` | 多云快速开始 |
| `docs/guides/cmp/` | `docs/cmp/guides/` | 多云指南 |
| `docs/getting-started/baremetal/` | `docs/baremetal/getting-started/` | 物理机快速开始 |

## 🎯 导航栏结构

```
文档 (下拉菜单)
├── 私有云管理 → /docs/onpremise/getting-started
├── 多云管理 → /docs/cmp/getting-started
├── 物理机管理 → /docs/baremetal/getting-started
└── 通用文档 → /docs/shared/introduction
```

## 📊 侧边栏结构示例

### 私有云侧边栏 (onpremise.js)
```
私有云管理
├── 快速开始
│   ├── 快速开始
│   ├── 虚拟机快速开始
│   ├── 宿主机管理
│   └── 高可用部署
├── 使用指南
│   ├── 虚拟机管理
│   ├── 存储管理
│   ├── 网络管理
│   ├── 宿主机管理
│   ├── 镜像管理
│   ├── 裸金属管理
│   └── 负载均衡
├── 运维文档
│   ├── 组件管理
│   ├── 高可用
│   └── K8s 运维
└── 通用文档 (链接)
    ├── API 文档 → /docs/shared/development/apisdk
    ├── 认证与安全 → /docs/shared/guides/auth_security
    └── CLI 工具 → /docs/shared/guides/climc
```

### 多云管理侧边栏 (cmp.js)
```
多云管理
├── 快速开始
│   ├── Ocboot 安装
│   ├── Docker Compose
│   └── K8s Helm
├── 使用指南
│   ├── 云账号管理
│   ├── 多云虚拟机
│   ├── 多云网络
│   ├── 安全组
│   └── SSO
├── 运维文档
└── 通用文档 (链接)
    ├── API 文档 → /docs/shared/development/apisdk
    └── 认证与安全 → /docs/shared/guides/auth_security
```

## ✅ 优势

1. **清晰的文档组织**：用户可以根据产品形态快速找到相关文档
2. **最大化复用**：通用文档只需维护一份
3. **独立维护**：每个产品的文档可以独立更新
4. **灵活扩展**：未来新增产品形态时，只需添加新的文档实例
5. **SEO友好**：每个产品有独立的 URL 路径

## 📝 下一步

1. 查看配置文件：`docusaurus.config.refactor.js`
2. 查看侧边栏配置：`sidebars/` 目录
3. 测试新结构：`make start-refactor` (如果创建了测试命令)

