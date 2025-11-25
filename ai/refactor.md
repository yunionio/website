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

### 目录结构设计

```
docs/
├── shared/                          # 共享文档（所有产品通用）
│   ├── introduction/                # 产品介绍（通用）
│   ├── development/                 # 开发文档（通用）
│   ├── operations/                  # 运维文档（通用，部分按产品区分）
│   ├── release-notes/               # 发布说明（通用）
│   └── contact/                     # 联系方式（通用）
│
├── onpremise/                       # 私有云管理文档
│   ├── getting-started/             # 私有云快速开始
│   ├── guides/                      # 私有云使用指南
│   │   ├── vminstance/              # 虚拟机管理
│   │   ├── storage/                  # 存储管理
│   │   ├── network/                 # 网络管理
│   │   ├── host/                    # 宿主机管理
│   │   └── baremetal/               # 裸金属管理
│   └── operations/                  # 私有云运维（产品特定）
│
├── cmp/                             # 多云管理文档
│   ├── getting-started/             # 多云管理快速开始
│   ├── guides/                      # 多云管理使用指南
│   │   ├── cloudaccounts/           # 云账号管理
│   │   ├── vminstance/              # 多云虚拟机
│   │   ├── networks/                 # 多云网络
│   │   ├── secgroup/                # 安全组
│   │   └── saml/                    # SSO
│   └── operations/                  # 多云管理运维（产品特定）
│
└── baremetal/                       # 物理机管理文档
    ├── getting-started/              # 物理机管理快速开始
    ├── guides/                       # 物理机管理使用指南
    │   ├── host-management/         # 主机管理
    │   ├── os-installation/          # 操作系统安装
    │   ├── raid-config/              # RAID配置
    │   └── network-config/           # 网络配置
    └── operations/                   # 物理机管理运维（产品特定）
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

每个侧边栏可以引用共享文档：

```javascript
// sidebars/onpremise.js
module.exports = {
  onpremiseSidebar: [
    'getting-started/index',
    {
      type: 'category',
      label: '使用指南',
      items: [
        'guides/vminstance/index',
        'guides/storage/index',
        'guides/network/index',
        // ... 其他私有云特定文档
      ],
    },
    {
      type: 'category',
      label: '通用文档',
      items: [
        // 引用共享文档
        { type: 'link', label: 'API 文档', href: '/docs/shared/development/apisdk' },
        { type: 'link', label: '认证与安全', href: '/docs/shared/guides/auth_security' },
        { type: 'link', label: 'CLI 工具', href: '/docs/shared/guides/climc' },
      ],
    },
  ],
};
```

#### 3. 更新导航栏

在导航栏中添加产品选择器：

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

### 文档复用策略

#### 1. 直接引用共享文档

在产品特定文档中，使用相对路径或绝对路径引用共享文档：

```markdown
<!-- docs/onpremise/guides/vminstance/api.md -->
# 虚拟机 API

关于 API 的详细说明，请参考[通用 API 文档](/docs/shared/development/apisdk)。
```

#### 2. 使用 MDX 组件包含

创建可复用的文档片段：

```markdown
<!-- docs/shared/_parts/api-intro.mdx -->
import { Admonition } from '@theme/Admonition';

<Admonition type="info">
这是通用的 API 介绍内容。
</Admonition>
```

在产品文档中引用：

```markdown
<!-- docs/onpremise/guides/vminstance/index.mdx -->
import ApiIntro from '@site/docs/shared/_parts/api-intro.mdx';

# 虚拟机管理

<ApiIntro />

<!-- 私有云特定的虚拟机管理内容 -->
```

#### 3. 条件渲染（可选）

如果某些文档需要在不同产品中显示不同内容，可以使用 frontmatter：

```markdown
---
products: ['onpremise', 'cmp']  # 标记适用于哪些产品
---

# 文档内容
```

然后在构建时根据产品过滤。

### 迁移步骤

#### 阶段1：准备阶段（1-2周）

1. ✅ 创建新的目录结构
2. ✅ 创建共享文档目录 `docs/shared/`
3. ✅ 分析现有文档，分类为：
   - 完全通用 → `docs/shared/`
   - 产品特定 → 对应产品目录
   - 部分通用 → 拆分或使用引用

#### 阶段2：迁移文档（2-3周）

1. 迁移通用文档到 `docs/shared/`
   - `introduction/` → `shared/introduction/`
   - `development/` → `shared/development/`
   - `release-notes/` → `shared/release-notes/`
   - `contact/` → `shared/contact/`

2. 迁移产品特定文档
   - `getting-started/onpremise/` → `onpremise/getting-started/`
   - `getting-started/cmp/` → `cmp/getting-started/`
   - `getting-started/baremetal/` → `baremetal/getting-started/`
   - `guides/onpremise/` → `onpremise/guides/`
   - `guides/cmp/` → `cmp/guides/`

3. 处理混合文档
   - `guides/auth_security/` → `shared/guides/auth_security/`（通用）
   - `guides/climc/` → `shared/guides/climc/`（通用）
   - `operations/` → 按内容拆分到各产品和 shared

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

### 替代方案（简化版）

如果多文档实例配置复杂，可以考虑**单文档实例 + 产品标签**的方案：

1. 保持单一文档实例
2. 使用 frontmatter 标记文档所属产品：
   ```markdown
   ---
   products: ['onpremise', 'cmp']  # 适用于哪些产品
   ---
   ```
3. 在侧边栏中按产品分组显示
4. 使用自定义组件过滤显示

**缺点**：无法完全隔离不同产品的文档，URL 路径不够清晰。

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

## 参考资源

- [Docusaurus 多文档实例文档](https://docusaurus.io/docs/docs-multi-instance)
- [Docusaurus 侧边栏配置](https://docusaurus.io/docs/sidebar)
- [Docusaurus 重定向插件](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-client-redirects)
