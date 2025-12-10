# Cloudpods 文档重构方案

## 问题分析

当前 Cloudpods 有3个产品形态：
- **私有云管理**（OnPremise）
- **多云管理**（CMP）
- **物理机管理**（Baremetal）

现有问题：
1. 所有文档混在一起，按功能模块组织（getting-started、guides、operations等），而不是按产品形态
2. 用户难以快速找到特定产品形态的文档
3. 大量通用文档（如认证、API、开发文档）可以复用，但当前结构导致重复或混乱

## 重构目标

1. ✅ 按产品形态清晰拆分文档
2. ✅ 最大化文档复用，减少重复编写
3. ✅ 保持现有 Docusaurus 框架，最小化改动
4. ✅ 保持向后兼容，不影响现有链接

## 推荐方案：多文档实例 + 共享文档

### 方案概述

使用 Docusaurus 的**多文档实例（Multiple Docs Instances）**功能，为每个产品形态创建独立的文档实例，同时创建一个共享文档目录存放通用内容。

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Cloudpods 文档网站                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │         导航栏：文档 (下拉菜单)        │
        └─────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  私有云管理   │      │   多云管理    │      │  物理机管理  │
│  /docs/      │      │  /docs/cmp/  │      │ /docs/      │
│  onpremise/  │      │              │      │ baremetal/  │
└──────────────┘      └──────────────┘      └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   通用文档       │
                    │  /docs/shared/   │
                    └─────────────────┘
```

### 目录结构设计

```
docs/
│
├── 📁 shared/                    【共享文档 - 所有产品通用】
│   │
│   ├── 📁 introduction/          【产品介绍】
│   │   ├── index.md
│   │   ├── login.md
│   │   ├── kvm.md
│   │   ├── multicloud.md
│   │   ├── vmware.md
│   │   ├── baremetal.md
│   │   ├── keystone.md
│   │   └── cloudsso.md
│   │
│   ├── 📁 development/           【开发文档】
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
│   ├── 📁 guides/                 【通用指南】
│   │   ├── auth_security/        【认证与安全】
│   │   │   ├── index.mdx
│   │   │   ├── domain.md
│   │   │   ├── project.md
│   │   │   ├── directory.md
│   │   │   ├── quota.md
│   │   │   ├── princple.md
│   │   │   ├── serviceconfig.md
│   │   │   └── identity/
│   │   │
│   │   └── climc/                【CLI 工具】
│   │       ├── index.mdx
│   │       ├── auth.md
│   │       └── usage.md
│   │
│   ├── 📁 operations/             【通用运维】
│   │   ├── index.mdx
│   │   ├── component.mdx
│   │   ├── databases/
│   │   ├── log/
│   │   ├── monitoring/
│   │   └── platform-issues/
│   │
│   ├── 📁 release-notes/         【发布说明】
│   │   ├── index.mdx
│   │   ├── v3_11_x.md
│   │   ├── v3_10_x.md
│   │   ├── v3_9_x.md
│   │   └── v3_8_x.md
│   │
│   └── 📁 contact/                【联系方式】
│       └── index.mdx
│
├── 📁 onpremise/                  【私有云管理】
│   │
│   ├── 📁 getting-started/        【快速开始】
│   │   ├── index.mdx
│   │   ├── quickstart-virt.md
│   │   ├── host.md
│   │   ├── ha-ce.md
│   │   ├── baremetal.mdx
│   │   ├── buildah-k3s.md
│   │   └── lbagent.mdx
│   │
│   ├── 📁 guides/                  【使用指南】
│   │   ├── index.mdx
│   │   ├── vminstance/            【虚拟机管理】
│   │   │   ├── index.mdx
│   │   │   ├── create.md
│   │   │   ├── migrate.md
│   │   │   ├── qga.md
│   │   │   ├── passthrough/
│   │   │   └── import/
│   │   │
│   │   ├── storage/                【存储管理】
│   │   │   ├── index.mdx
│   │   │   ├── blockstorage/
│   │   │   └── backupstorage/
│   │   │
│   │   ├── network/                【网络管理】
│   │   │   ├── index.mdx
│   │   │   ├── configuration.md
│   │   │   ├── vpc/
│   │   │   └── ssh/
│   │   │
│   │   ├── host/                   【宿主机管理】
│   │   │   ├── index.mdx
│   │   │   ├── troubleshooting.md
│   │   │   └── host-deployer.md
│   │   │
│   │   ├── glance/                 【镜像管理】
│   │   │   ├── index.mdx
│   │   │   ├── sysimage/
│   │   │   └── guestimage/
│   │   │
│   │   ├── baremetal/              【裸金属管理】
│   │   │   ├── index.mdx
│   │   │   ├── create-register.mdx
│   │   │   └── create-server.md
│   │   │
│   │   ├── lb/                     【负载均衡】
│   │   │   ├── index.mdx
│   │   │   └── principle.md
│   │   │
│   │   └── scheduler/              【调度器】
│   │       ├── index.mdx
│   │       └── schedtags.md
│   │
│   └── 📁 operations/             【运维文档】
│       ├── index.mdx
│       ├── agent.mdx
│       ├── change-node-ip.md
│       ├── remove-host.md
│       ├── recovery.md
│       ├── ha/
│       └── k8s/
│
├── 📁 cmp/                        【多云管理】
│   │
│   ├── 📁 getting-started/        【快速开始】
│   │   ├── index.mdx
│   │   ├── quickstart-ocboot.md
│   │   ├── quickstart-docker-compose.md
│   │   ├── quickstart-k8s-helm.md
│   │   ├── buildah-k3s.md
│   │   └── ha-ce.md
│   │
│   ├── 📁 guides/                  【使用指南】
│   │   ├── index.mdx
│   │   ├── cloudaccounts/         【云账号管理】
│   │   │   ├── index.mdx
│   │   │   ├── cloudaccount.md
│   │   │   ├── iam.md
│   │   │   ├── aws.md
│   │   │   ├── azure_subscription.md
│   │   │   ├── openstack.md
│   │   │   └── vmware_net.md
│   │   │
│   │   ├── vminstance/             【多云虚拟机】
│   │   │   ├── index.mdx
│   │   │   ├── faq.md
│   │   │   └── sku.md
│   │   │
│   │   ├── networks/               【多云网络】
│   │   │   ├── index.mdx
│   │   │   └── dns.md
│   │   │
│   │   ├── secgroup/                【安全组】
│   │   │   ├── index.mdx
│   │   │   └── principle.md
│   │   │
│   │   ├── saml/                    【SSO】
│   │   │   ├── index.mdx
│   │   │   └── usage.md
│   │   │
│   │   └── vmware/                  【VMware 管理】
│   │       ├── index.mdx
│   │       └── vmware_net.md
│   │
│   └── 📁 operations/             【运维文档】
│       ├── index.mdx
│       └── ...
│
└── 📁 baremetal/                  【物理机管理】
    │
    ├── 📁 getting-started/         【快速开始】
    │   ├── index.mdx
    │   └── docker-compose.mdx
    │
    ├── 📁 guides/                   【使用指南】
    │   ├── index.mdx
    │   ├── host-management/         【主机管理】
    │   ├── os-installation/          【操作系统安装】
    │   ├── raid-config/              【RAID配置】
    │   └── network-config/           【网络配置】
    │
    └── 📁 operations/               【运维文档】
        └── index.mdx
```

### 配置方案

#### 1. 修改 `docusaurus.config.js`

使用 Docusaurus 的插件方式配置多个文档实例：

```javascript
presets: [
  [
    'classic',
    {
      docs: false, // 禁用默认的 docs 配置
      blog: { /* ... */ },
      theme: { /* ... */ },
    },
  ],
],

plugins: [
  // 共享文档实例
  [
    '@docusaurus/plugin-content-docs',
    {
      id: 'shared',
      path: 'docs/shared',
      routeBasePath: 'docs/shared',
      sidebarPath: './sidebars/shared.js',
      editUrl: 'https://github.com/yunionio/website/tree/master',
    },
  ],
  // 私有云管理文档实例
  [
    '@docusaurus/plugin-content-docs',
    {
      id: 'onpremise',
      path: 'docs/onpremise',
      routeBasePath: 'docs/onpremise',
      sidebarPath: './sidebars/onpremise.js',
      editUrl: 'https://github.com/yunionio/website/tree/master',
    },
  ],
  // 多云管理文档实例
  [
    '@docusaurus/plugin-content-docs',
    {
      id: 'cmp',
      path: 'docs/cmp',
      routeBasePath: 'docs/cmp',
      sidebarPath: './sidebars/cmp.js',
      editUrl: 'https://github.com/yunionio/website/tree/master',
    },
  ],
  // 物理机管理文档实例
  [
    '@docusaurus/plugin-content-docs',
    {
      id: 'baremetal',
      path: 'docs/baremetal',
      routeBasePath: 'docs/baremetal',
      sidebarPath: './sidebars/baremetal.js',
      editUrl: 'https://github.com/yunionio/website/tree/master',
    },
  ],
  // ... 其他插件
],
```

#### 2. 创建多个侧边栏配置文件

创建 `sidebars/` 目录，为每个产品创建独立的侧边栏：

```
sidebars/
├── shared.js          # 共享文档侧边栏
├── onpremise.js       # 私有云侧边栏
├── cmp.js             # 多云管理侧边栏
└── baremetal.js       # 物理机管理侧边栏
```

**侧边栏配置方式：自动生成 + 手动链接**

所有侧边栏都使用**自动生成 + 手动链接**的方式：

```javascript
// sidebars/onpremise.js
module.exports = {
  onpremiseSidebar: [
    // 自动生成当前文档实例的文档
    { type: 'autogenerated', dirName: '.' },
    // 手动添加通用文档链接
    {
      type: 'category',
      label: '通用文档',
      items: [
        { type: 'link', label: 'API 文档', href: '/docs/shared/development/apisdk' },
        { type: 'link', label: '认证与安全', href: '/docs/shared/guides/auth_security' },
        { type: 'link', label: 'CLI 工具', href: '/docs/shared/guides/climc' },
        { type: 'link', label: '发布说明', href: '/docs/shared/release-notes' },
      ],
    },
  ],
};
```

**优势：**
- ✅ 无需手动维护：新增文档会自动出现在侧边栏
- ✅ 结构清晰：侧边栏结构自动匹配文件结构
- ✅ 文档复用：通过链接引用通用文档，避免重复
- ✅ 易于扩展：添加新文档只需创建文件，无需修改配置

**控制侧边栏顺序：**

使用 `sidebar_position` frontmatter 控制文档顺序：

```markdown
---
sidebar_position: 1  # 数字越小越靠前
---
```

**隐藏文档：**

使用 `sidebar_position: null` 或 `draft: true`：

```markdown
---
sidebar_position: null
draft: true
---
```

**自定义分类名称：**

在目录下创建 `_category_.json` 文件：

```json
{
  "label": "自定义分类名称",
  "position": 1,
  "collapsed": false
}
```

#### 3. 更新导航栏

在导航栏中添加产品选择器：

```
┌─────────────────────────────────────────────────────────┐
│ Cloudpods  [文档 ▼] [博客] [服务订阅] [API] [3.11] [🌐] [GitHub] │
└─────────────────────────────────────────────────────────┘
         │
         └─ 文档下拉菜单
            ├── 私有云管理 → /docs/onpremise/getting-started
            ├── 多云管理 → /docs/cmp/getting-started
            ├── 物理机管理 → /docs/baremetal/getting-started
            └── 通用文档 → /docs/shared/introduction
```

配置代码：

```javascript
navbar: {
  items: [
    {
      type: 'dropdown',
      label: '文档',
      position: 'left',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'onpremiseSidebar',
          label: '私有云管理',
          to: '/docs/onpremise/getting-started',
        },
        {
          type: 'docSidebar',
          sidebarId: 'cmpSidebar',
          label: '多云管理',
          to: '/docs/cmp/getting-started',
        },
        {
          type: 'docSidebar',
          sidebarId: 'baremetalSidebar',
          label: '物理机管理',
          to: '/docs/baremetal/getting-started',
        },
        {
          type: 'docSidebar',
          sidebarId: 'sharedSidebar',
          label: '通用文档',
          to: '/docs/shared/introduction',
        },
      ],
    },
    // ... 其他导航项
  ],
},
```

### URL 路径映射

#### 共享文档路径
```
/docs/shared/introduction          → 产品介绍
/docs/shared/development          → 开发文档
/docs/shared/guides/auth_security  → 认证与安全
/docs/shared/guides/climc          → CLI 工具
/docs/shared/release-notes         → 发布说明
```

#### 私有云管理路径
```
/docs/onpremise/getting-started    → 快速开始
/docs/onpremise/guides/vminstance  → 虚拟机管理
/docs/onpremise/guides/storage     → 存储管理
/docs/onpremise/guides/network     → 网络管理
/docs/onpremise/operations         → 运维文档
```

#### 多云管理路径
```
/docs/cmp/getting-started          → 快速开始
/docs/cmp/guides/cloudaccounts     → 云账号管理
/docs/cmp/guides/vminstance        → 多云虚拟机
/docs/cmp/operations              → 运维文档
```

#### 物理机管理路径
```
/docs/baremetal/getting-started    → 快速开始
/docs/baremetal/guides/host-management → 主机管理
/docs/baremetal/operations         → 运维文档
```

### 侧边栏结构预览

#### 私有云管理侧边栏
```
📚 私有云管理
│
├── 🚀 快速开始
│   ├── 快速开始
│   ├── 虚拟机快速开始
│   ├── 宿主机管理
│   └── 高可用部署
│
├── 📖 使用指南
│   ├── 虚拟机管理
│   │   ├── 创建虚拟机
│   │   ├── 迁移虚拟机
│   │   └── 透传设备
│   ├── 存储管理
│   ├── 网络管理
│   ├── 宿主机管理
│   ├── 镜像管理
│   ├── 裸金属管理
│   └── 负载均衡
│
├── 🔧 运维文档
│   ├── 组件管理
│   ├── 高可用
│   └── K8s 运维
│
└── 📚 通用文档 (链接)
    ├── API 文档 → /docs/shared/development/apisdk
    ├── 认证与安全 → /docs/shared/guides/auth_security
    └── CLI 工具 → /docs/shared/guides/climc
```

#### 多云管理侧边栏
```
📚 多云管理
│
├── 🚀 快速开始
│   ├── Ocboot 安装
│   ├── Docker Compose
│   └── K8s Helm
│
├── 📖 使用指南
│   ├── 云账号管理
│   │   ├── 云账号概览
│   │   ├── AWS
│   │   ├── Azure
│   │   └── OpenStack
│   ├── 多云虚拟机
│   ├── 多云网络
│   ├── 安全组
│   └── SSO
│
├── 🔧 运维文档
│
└── 📚 通用文档 (链接)
    ├── API 文档 → /docs/shared/development/apisdk
    └── 认证与安全 → /docs/shared/guides/auth_security
```

### 文档复用策略

#### 1. 复用部分文件：使用 `_parts` 导入方案

对于需要在多个地方复用的文档片段，使用 `_parts` 目录存放可复用的部分文件，然后通过 MDX import 导入。

**创建可复用的文档片段：**

```markdown
<!-- docs/shared/_parts/introduction/login.mdx -->
# 登录界面

![](./images/login.png)

## 控制面板

![](./images/dashboard.png)
```

**在产品文档中引用：**

```markdown
<!-- docs/shared/introduction/login.md -->
---
sidebar_position: 2
title: 登录界面
---

import LoginContent from '@site/docs/shared/_parts/introduction/login.mdx';

<LoginContent />
```

**优势：**
- ✅ 文档片段可以在多个地方复用
- ✅ 保持 URL 路径在当前文档实例中（如 `/docs/onpremise/...`）
- ✅ 可以单独设置 sidebar 标题（通过 frontmatter 的 `title` 字段）
- ✅ 图片路径需要调整（从 `_parts` 目录引用时使用相对路径）

**注意事项：**
- `_parts` 目录下的文件不会被 Docusaurus 自动索引到 sidebar
- 需要在引用文件中设置 `title` frontmatter，因为 Docusaurus 无法从导入的内容中提取标题
- 图片路径需要根据文件位置调整（如从 `_parts/introduction/` 到 `introduction/images/` 使用 `../../introduction/images/`）

#### 2. 复用整个目录：使用软连接方案

对于需要完整复用整个目录的情况（如开发手册），使用软连接（symbolic link）指向 shared 文档实例的目录。

**创建软连接：**

```bash
# 在 onpremise 目录下创建软连接指向 shared/development
cd docs/onpremise
ln -s ../../shared/development development
```

**结果：**
- `docs/onpremise/development/` → 软连接到 `docs/shared/development/`
- 所有文件自动可用，包括子目录和文件
- URL 路径保持在 `/docs/onpremise/development/...`
- Sidebar 会自动生成树状结构

**优势：**
- ✅ 完整复用整个目录结构，包括所有子目录和文件
- ✅ 自动生成 sidebar 树状结构
- ✅ 保持 URL 路径在当前文档实例中
- ✅ 无需手动维护引用文件
- ✅ `IndexDocCardList` 等组件可以正常工作

**注意事项：**
- 软连接需要在 Git 中正确提交（Git 会跟踪软连接）
- 图片路径会正常工作（因为文件实际在 shared 目录中）
- 编辑文件时实际编辑的是 shared 目录中的文件

#### 3. 直接引用共享文档（链接方式）

在产品特定文档中，使用相对路径或绝对路径引用共享文档：

```markdown
<!-- docs/onpremise/guides/vminstance/api.md -->
# 虚拟机 API

关于 API 的详细说明，请参考[通用 API 文档](/docs/shared/development/apisdk)。
```

**适用场景：**
- 只需要在文档中添加链接引用
- 不需要在当前文档实例中显示内容
- 点击链接会跳转到 shared 文档实例

#### 4. 条件渲染（可选）

如果某些文档需要在不同产品中显示不同内容，可以使用 frontmatter：

```markdown
---
products: ['onpremise', 'cmp']  # 标记适用于哪些产品
---

# 文档内容
```

然后在构建时根据产品过滤。

### 文档分类映射

#### 从旧结构到新结构的映射

| 旧路径 | 新路径 | 说明 | 状态 |
|--------|--------|------|------|
| `docs/introduction/` | `docs/shared/introduction/` | 通用介绍 | ✅ 已迁移 |
| `docs/development/` | `docs/shared/development/` | 通用开发文档 | ✅ 已迁移 |
| `docs/guides/auth_security/` | `docs/shared/guides/auth_security/` | 通用认证 | ✅ 已迁移 |
| `docs/guides/climc/` | `docs/shared/guides/climc/` | 通用 CLI | ✅ 已迁移 |
| `docs/release-notes/` | `docs/shared/release-notes/` | 通用发布说明 | ✅ 已迁移 |
| `docs/contact/` | `docs/shared/contact/` | 通用联系方式 | ✅ 已迁移 |
| `docs/getting-started/onpremise/` | `docs/onpremise/getting-started/` | 私有云快速开始 | ✅ 已迁移 |
| `docs/guides/onpremise/` | `docs/onpremise/guides/` | 私有云指南 | ✅ 已迁移 |
| `docs/operations/` (部分) | `docs/onpremise/operations/` | 私有云运维 | ✅ 已迁移 |
| `docs/getting-started/cmp/` | `docs/cmp/getting-started/` | 多云快速开始 | ✅ 已迁移 |
| `docs/guides/cmp/` | `docs/cmp/guides/` | 多云指南 | ✅ 已迁移 |
| `docs/getting-started/baremetal/` | `docs/baremetal/getting-started/` | 物理机快速开始 | ✅ 已迁移 |
| `docs/operations/` (通用部分) | `docs/shared/operations/` | 通用运维 | ✅ 已迁移 |

### 迁移步骤

#### 阶段1：准备阶段（1-2周）

1. ✅ 创建新的目录结构
2. ✅ 创建共享文档目录 `docs/shared/`
3. ✅ 分析现有文档，分类为：
   - ✅ 完全通用 → `docs/shared/`（已完成）
     - `introduction/` → `shared/introduction/`
     - `development/` → `shared/development/`
     - `release-notes/` → `shared/release-notes/`
     - `contact/` → `shared/contact/`
     - `guides/auth_security/` → `shared/guides/auth_security/`
     - `guides/climc/` → `shared/guides/climc/`
     - `operations/` 通用部分 → `shared/operations/`（fe/, ha/, k8s/, databases/, log/, monitoring/, platform-issues/, upgrading/, component.mdx, agent.mdx, recovery.md）
   - ⚠️ 产品特定 → 对应产品目录（部分完成）
     - ✅ `operations/` 产品特定部分 → `onpremise/operations/`（change-node-ip.md, clean-kvm-security-groups.md, remove-host.md, uninstallation.md, hidden-feature-config.md, multi-zone-config.md）
     - ✅ `getting-started/onpremise/` → `onpremise/getting-started/`（已完成）
     - ✅ `getting-started/cmp/` → `cmp/getting-started/`（已完成）
     - ✅ `getting-started/baremetal/` → `baremetal/getting-started/`（已完成）
     - ✅ `guides/onpremise/` → `onpremise/guides/`（已完成）
     - ✅ `guides/cmp/` → `cmp/guides/`（已完成）
   - ⏳ 部分通用 → 拆分或使用引用（待处理）
     - `getting-started/full/`（需判断是否通用）
     - ✅ `guides/k8s/` (onpreimise 和 cmp 通用)
     - ✅ `guides/misc/`通用
     - ✅ `guides/monitor_ops/` 通用
     - ✅ guides/climc
     - ✅ guides/auth_security
     - docs/cmp/guides/vmware/vmware_v2v：这个属于私有云

#### 阶段2：迁移文档（2-3周）

1. ✅ 迁移通用文档到 `docs/shared/`（已完成）
   - ✅ `introduction/` → `shared/introduction/`
   - ✅ `development/` → `shared/development/`
   - ✅ `release-notes/` → `shared/release-notes/`
   - ✅ `contact/` → `shared/contact/`
   - ✅ `guides/auth_security/` → `shared/guides/auth_security/`
   - ✅ `guides/climc/` → `shared/guides/climc/`
   - ✅ `operations/` 通用部分 → `shared/operations/`

2. ✅ 迁移产品特定文档（已完成）
   - ✅ `getting-started/onpremise/` → `onpremise/getting-started/`
   - ✅ `getting-started/cmp/` → `cmp/getting-started/`
   - ✅ `getting-started/baremetal/` → `baremetal/getting-started/`
   - ✅ `guides/onpremise/` → `onpremise/guides/`
   - ✅ `guides/cmp/` → `cmp/guides/`

3. ✅ 处理混合文档（已完成）
   - ✅ `guides/auth_security/` → `shared/guides/auth_security/`（通用）
   - ✅ `guides/climc/` → `shared/guides/climc/`（通用）
   - ✅ `operations/` → 按内容拆分到各产品和 shared

#### 阶段3：配置更新（1周）

1. 更新 `docusaurus.config.js` 配置多文档实例
2. 创建各产品的侧边栏配置文件
3. 更新导航栏配置
4. 更新搜索配置（如果需要）

#### 阶段4：测试与优化（1周）

1. 本地测试所有文档链接
2. 测试搜索功能
3. 更新内部链接和引用
4. 添加重定向规则（保持向后兼容）

### 向后兼容方案

为了保持现有链接可用，可以添加重定向：

#### 方案A：使用 Docusaurus 重定向插件

```javascript
plugins: [
  [
    '@docusaurus/plugin-client-redirects',
    {
      redirects: [
        {
          from: '/docs/getting-started/onpremise/quickstart-virt',
          to: '/docs/onpremise/getting-started/quickstart-virt',
        },
        {
          from: '/docs/guides/onpremise/vminstance',
          to: '/docs/onpremise/guides/vminstance',
        },
        // ... 更多重定向规则
      ],
    },
  ],
],
```

#### 方案B：在文档中添加 frontmatter 重定向

```markdown
---
redirect_from:
  - /docs/getting-started/onpremise/quickstart-virt
---
```

### 优势分析

✅ **清晰的文档组织**：用户可以根据产品形态快速找到相关文档

✅ **最大化复用**：通用文档只需维护一份，减少重复工作

✅ **独立维护**：每个产品的文档可以独立更新，互不影响

✅ **灵活扩展**：未来新增产品形态时，只需添加新的文档实例

✅ **SEO友好**：每个产品有独立的 URL 路径，便于搜索引擎索引

### 注意事项

1. **链接更新**：迁移后需要更新所有内部文档链接
2. **搜索配置**：需要配置搜索插件支持多个文档实例
3. **i18n 支持**：多语言翻译文件也需要相应调整结构
4. **构建时间**：多个文档实例可能略微增加构建时间

### 推荐实施

**推荐使用多文档实例方案**，因为：
- Docusaurus 3.x 原生支持，配置相对简单
- 文档组织最清晰
- URL 结构更合理
- 未来扩展性更好

## 实施建议

1. **先做原型**：在一个分支中先实现一个产品（如私有云）的完整迁移，验证方案可行性
2. **逐步迁移**：不要一次性迁移所有文档，按产品逐个迁移
3. **保持沟通**：与团队同步迁移进度，收集反馈
4. **文档化**：记录迁移过程中的问题和解决方案

## 已创建的文件

### 配置文件
- ✅ `docusaurus.config.refactor.js` - 重构后的配置文件
- ✅ `sidebars/shared.js` - 共享文档侧边栏
- ✅ `sidebars/onpremise.js` - 私有云侧边栏
- ✅ `sidebars/cmp.js` - 多云管理侧边栏
- ✅ `sidebars/baremetal.js` - 物理机管理侧边栏

## 下一步操作

1. **查看结构预览**：
   ```bash
   cat ai/refactor.md
   ```

2. **查看配置文件**：
   ```bash
   cat docusaurus.config.refactor.js
   cat sidebars/*.js
   ```

3. **测试新结构**（需要先创建目录结构）：
   ```bash
   # 备份当前配置
   cp docusaurus.config.js docusaurus.config.original.js
   
   # 使用新配置（需要先创建目录结构）
   cp docusaurus.config.refactor.js docusaurus.config.js
   
   # 启动测试
   make start
   ```

4. **创建目录结构**（按需执行）：
   - 先创建空目录结构
   - 逐步迁移文档
   - 测试每个产品文档实例

## ⚠️ 注意事项

1. **当前只是预览**：配置文件已创建，但目录结构尚未创建
2. **需要迁移文档**：实际使用时需要将现有文档迁移到新结构
3. **向后兼容**：已配置重定向插件，但需要添加完整的重定向规则
4. **i18n 支持**：英文翻译文件也需要相应调整结构

## 参考资源

- [Docusaurus 多文档实例文档](https://docusaurus.io/docs/docs-multi-instance)
- [Docusaurus 侧边栏配置](https://docusaurus.io/docs/sidebar)
- [Docusaurus 自动生成侧边栏](https://docusaurus.io/docs/sidebar/autogenerated)
- [Docusaurus 重定向插件](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-client-redirects)
