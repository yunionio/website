# 英文文档翻译指南

本文档说明如何将中文文档翻译成英文。

> **⚠️ 重要更新**：文档结构已完成重构，采用多文档实例方案。请参考新的文档结构进行翻译。

## 📊 当前状态

- **文档结构**: 已完成重构，采用多文档实例方案
- **文档实例**: 4 个独立文档实例（shared、onpremise、cmp、baremetal）
- **翻译状态**: 需要根据新结构重新评估和翻译

## 🏗️ 新的文档结构

重构后的文档采用**多文档实例**方案，按产品形态组织：

```
docs/
├── shared/          # 共享文档（通用内容）
│   ├── introduction/
│   ├── development/
│   ├── release-notes/
│   ├── contact/
│   ├── guides/
│   └── operations/
├── onpremise/      # 私有云管理文档
│   ├── getting-started/
│   ├── guides/
│   ├── introduction/
│   └── operations/
├── cmp/            # 多云管理文档
│   ├── getting-started/
│   ├── guides/
│   ├── introduction/
│   └── operations/
└── baremetal/      # 物理机管理文档
    └── getting-started/
```

### 文档实例映射

| 文档实例 ID | 路径 | 路由路径 | 说明 |
|------------|------|---------|------|
| `default` | `docs/shared` | `/docs/shared` | 共享文档（通用内容） |
| `onpremise` | `docs/onpremise` | `/docs/onpremise` | 私有云管理文档 |
| `cmp` | `docs/cmp` | `/docs/cmp` | 多云管理文档 |
| `baremetal` | `docs/baremetal` | `/docs/baremetal` | 物理机管理文档 |

## 🔍 检查缺失的翻译

运行以下命令检查哪些文档需要翻译：

```bash
make check-missing-translations
```

或者：

```bash
python3 scripts/check-missing-translations.py
```

这会生成：
1. 控制台输出：按目录分组的缺失文档列表
2. `missing-translations.txt`：缺失文件的完整列表

## 🚀 翻译工作流程

### 方法一：使用翻译辅助脚本（推荐）

#### 1. 复制单个文件到英文目录

**注意**：重构后需要指定正确的文档实例路径。

```bash
# 复制私有云文档
make copy-translation-file FILE=docs/onpremise/getting-started/quickstart-virt.md

# 复制多云管理文档
make copy-translation-file FILE=docs/cmp/getting-started/quickstart-ocboot.md

# 复制共享文档
make copy-translation-file FILE=docs/shared/introduction/index.md

# 复制物理机管理文档
make copy-translation-file FILE=docs/baremetal/getting-started/index.mdx

# 或直接使用脚本
python3 scripts/translate-helper.py docs/onpremise/getting-started/quickstart-virt.md
```

**重要**：翻译辅助脚本需要更新以支持多文档实例结构。如果脚本不支持，需要手动创建对应的目录结构。

#### 2. 批量复制文件结构

```bash
# 从缺失列表批量复制（会添加翻译提示）
make batch-copy-translations

# 或直接使用脚本
python3 scripts/translate-helper.py --batch missing-translations.txt
```

#### 3. 复制图片目录（重要！）

如果文档引用了图片（`./images/` 或 `./img/`），需要将图片目录也复制到英文翻译目录：

```bash
# 手动复制图片目录
cp -r docs/introduction/images i18n/en/docusaurus-plugin-content-docs/current/introduction/

# 或者使用翻译辅助脚本（会自动处理图片目录）
python3 scripts/translate-helper.py docs/introduction/baremetal.md
```

**注意**：翻译辅助脚本会自动检测并复制 `images/` 和 `img/` 目录。

#### 4. 翻译文档内容

复制后的文件会在开头添加翻译提示。你需要：

1. 根据文档实例，打开对应的翻译目录：
   - 私有云：`i18n/en/docusaurus-plugin-content-docs-onpremise/current/`
   - 多云管理：`i18n/en/docusaurus-plugin-content-docs-cmp/current/`
   - 共享文档：`i18n/en/docusaurus-plugin-content-docs/current/`
   - 物理机管理：`i18n/en/docusaurus-plugin-content-docs-baremetal/current/`

2. 翻译文本内容，保持：
   - ✅ 文档结构（标题层级）
   - ✅ 代码块（不翻译）
   - ✅ 链接路径（需要更新为新的路径结构，见下方说明）
   - ✅ 图片路径（不翻译）
   - ✅ Frontmatter 格式
   - ✅ 表格结构

3. **更新内部链接**：
   - 旧链接：`/docs/getting-started/onpremise/...` → 新链接：`/docs/onpremise/getting-started/...`
   - 旧链接：`/docs/guides/onpremise/...` → 新链接：`/docs/onpremise/guides/...`
   - 旧链接：`/docs/introduction/...` → 新链接：`/docs/shared/introduction/...` 或 `/docs/onpremise/introduction/...`
   - 旧链接：`/docs/development/...` → 新链接：`/docs/shared/development/...`
   - 旧链接：`/docs/release-notes/...` → 新链接：`/docs/shared/release-notes/...`

4. 删除文件开头的翻译提示注释

#### 5. 测试翻译结果

```bash
# 启动英文版本预览
make start-en

# 或使用 Docker
make docker-start-en
```

### 方法二：手动创建翻译文件

1. 根据文档实例，在对应的翻译目录下创建目录结构：
   - 私有云：`i18n/en/docusaurus-plugin-content-docs-onpremise/current/`
   - 多云管理：`i18n/en/docusaurus-plugin-content-docs-cmp/current/`
   - 共享文档：`i18n/en/docusaurus-plugin-content-docs/current/`
   - 物理机管理：`i18n/en/docusaurus-plugin-content-docs-baremetal/current/`

2. 复制中文文档内容

3. 翻译文本内容

4. 保持文件路径和名称一致（相对于文档实例根目录）

5. **更新内部链接**为新的路径结构

### 方法三：使用 Docusaurus 的 write-translations

```bash
# 生成翻译模板（会生成 JSON 格式的翻译文件）
make write-en-translation

# 或
yarn write-translations --locale en
```

注意：这个方法会生成 JSON 翻译文件，适合翻译 UI 文本，不太适合长文档。

## 📋 重构后的翻译计划

### 阶段一：核心文档翻译（优先级最高）

#### 1. 私有云（OnPremise）文档 - 第 1 优先级
**目标**：完成私有云核心文档翻译，这是最常用的产品形态

**翻译路径映射**：
- 中文：`docs/onpremise/`
- 英文：`i18n/en/docusaurus-plugin-content-docs-onpremise/current/`

**具体任务**：
- [ ] **Getting Started** - 快速开始文档
  - `onpremise/getting-started/quickstart-virt.md`
  - `onpremise/getting-started/host.md`
  - `onpremise/getting-started/buildah-k3s.md`
  - `onpremise/getting-started/ha-ce.md`
  - `onpremise/getting-started/lbagent.mdx`
  - `onpremise/getting-started/baremetal.mdx`

- [ ] **Introduction** - 介绍文档
  - `onpremise/introduction/index.md`
  - `onpremise/introduction/kvm.md`
  - `onpremise/introduction/login.md`
  - `onpremise/introduction/keystone.md`
  - `onpremise/introduction/vmware.md`
  - `onpremise/introduction/baremetal.md`

- [ ] **Operations** - 运维文档
  - `onpremise/operations/change-node-ip.md`
  - `onpremise/operations/remove-host.md`
  - `onpremise/operations/uninstallation.md`
  - `onpremise/operations/upgrading/`

- [ ] **Guides - 核心功能指南**
  - `onpremise/guides/vminstance/` 系列（虚拟机管理）
  - `onpremise/guides/host/` 系列（宿主机管理）
  - `onpremise/guides/storage/` 系列（存储管理）
  - `onpremise/guides/network/` 系列（网络管理）

#### 2. 多云管理（CMP）文档 - 第 2 优先级
**目标**：完成多云管理核心文档翻译

**翻译路径映射**：
- 中文：`docs/cmp/`
- 英文：`i18n/en/docusaurus-plugin-content-docs-cmp/current/`

**具体任务**：
- [ ] **Getting Started** - 快速开始
  - `cmp/getting-started/quickstart-ocboot.md`
  - `cmp/getting-started/quickstart-docker-compose.md`
  - `cmp/getting-started/quickstart-k8s-helm.md`
  - `cmp/getting-started/ha-ce.md`
  - `cmp/getting-started/buildah-k3s.md`

- [ ] **Introduction** - 介绍文档
  - `cmp/introduction/` 系列

- [ ] **Guides - 核心功能指南**
  - `cmp/guides/cloudaccounts/` 系列（云账号管理）
  - `cmp/guides/vminstance/` 系列（虚拟机管理）
  - `cmp/guides/networks/` 系列（网络管理）
  - `cmp/guides/secgroup/` 系列（安全组）
  - `cmp/guides/saml/` 系列（SAML 配置）
  - `cmp/guides/vmware/` 系列（VMware 管理）

#### 3. 共享文档（Shared） - 第 3 优先级
**目标**：完成通用文档翻译，这些文档被多个产品引用

**翻译路径映射**：
- 中文：`docs/shared/`
- 英文：`i18n/en/docusaurus-plugin-content-docs/current/`

**具体任务**：
- [ ] **Introduction** - 通用介绍
  - `shared/introduction/` 系列

- [ ] **Release Notes** - 版本发布说明
  - `shared/release-notes/v3_11_x.md`
  - `shared/release-notes/v3_10_x.md`
  - `shared/release-notes/v3_9_x.md`
  - `shared/release-notes/v3_8_x.md`

- [ ] **Development** - 开发文档
  - `shared/development/apisdk/` 系列（API SDK）
  - `shared/development/backend-framework.md`
  - `shared/development/dev-env.md`
  - `shared/development/changelog/` 系列

- [ ] **Guides - 通用指南**
  - `shared/guides/auth_security/` 系列（认证安全）
  - `shared/guides/climc/` 系列（CLI 工具）
  - `shared/guides/k8s/` 系列（Kubernetes）
  - `shared/guides/misc/` 系列（杂项）
  - `shared/guides/monitor_ops/` 系列（监控运维）

- [ ] **Operations - 通用运维**
  - `shared/operations/fe/` 系列（前端运维）
  - `shared/operations/ha/` 系列（高可用）
  - `shared/operations/k8s/` 系列（K8s 运维）
  - `shared/operations/databases/` 系列（数据库）
  - `shared/operations/log/` 系列（日志）
  - `shared/operations/monitoring/` 系列（监控）
  - `shared/operations/platform-issues/` 系列（平台问题）
  - `shared/operations/upgrading/` 系列（升级）

- [ ] **Contact** - 联系方式
  - `shared/contact/index.mdx`

#### 4. 物理机管理（Baremetal）文档 - 第 4 优先级
**目标**：完成物理机管理文档翻译

**翻译路径映射**：
- 中文：`docs/baremetal/`
- 英文：`i18n/en/docusaurus-plugin-content-docs-baremetal/current/`

**具体任务**：
- [ ] **Getting Started** - 快速开始
  - `baremetal/getting-started/` 系列

### 阶段二：详细文档翻译（优先级中等）

完成核心文档后，继续翻译详细的功能文档、性能测试文档等。

### 阶段三：文档完善和校对（持续进行）

- 校对已翻译文档
- 统一术语翻译
- 检查链接和格式
- 更新过时文档

## 📝 翻译优先级总结

1. **最高优先级**：私有云（OnPremise）核心文档
2. **高优先级**：多云管理（CMP）核心文档
3. **中优先级**：共享文档（Shared）通用内容
4. **低优先级**：物理机管理（Baremetal）文档和详细技术文档

## 🛠️ 翻译工具推荐

### AI 翻译工具

1. **ChatGPT / Claude** - 适合初步翻译
   - 优点：速度快，质量较好
   - 注意：需要人工校对技术术语

2. **DeepL** - 专业翻译工具
   - 优点：翻译质量高
   - 注意：需要分段翻译长文档

### 翻译检查清单

翻译完成后，请检查：

- [ ] 所有中文文本已翻译成英文
- [ ] 技术术语使用正确（如 Cloudpods、K3s、K8s 等）
- [ ] 代码块保持原样（未翻译）
- [ ] 链接路径正确（相对路径保持不变）
- [ ] 图片路径正确
- [ ] Frontmatter 格式正确
- [ ] 表格格式保持完整
- [ ] 标题层级正确
- [ ] 已删除翻译提示注释

## 📁 文件结构说明

### 新的翻译文件结构

重构后，每个文档实例都有独立的翻译目录：

```
docs/                                    # 中文文档（源文件）
├── shared/
│   └── introduction/
│       └── index.md
├── onpremise/
│   └── getting-started/
│       └── quickstart-virt.md
├── cmp/
│   └── getting-started/
│       └── quickstart-ocboot.md
└── baremetal/
    └── getting-started/
        └── index.mdx

i18n/en/                                 # 英文翻译
├── docusaurus-plugin-content-docs/      # shared 文档实例翻译（default）
│   └── current/
│       └── introduction/
│           └── index.md
├── docusaurus-plugin-content-docs-onpremise/  # onpremise 文档实例翻译
│   └── current/
│       └── getting-started/
│           └── quickstart-virt.md
├── docusaurus-plugin-content-docs-cmp/  # cmp 文档实例翻译
│   └── current/
│       └── getting-started/
│           └── quickstart-ocboot.md
└── docusaurus-plugin-content-docs-baremetal/  # baremetal 文档实例翻译
    └── current/
        └── getting-started/
            └── index.mdx
```

**重要**：
- 每个文档实例的翻译文件路径必须与对应的中文文档路径完全一致
- 共享文档（`default`）的翻译文件放在 `i18n/en/docusaurus-plugin-content-docs/current/` 目录下
- 其他文档实例（`onpremise`、`cmp`、`baremetal`）的翻译文件放在 `i18n/en/docusaurus-plugin-content-docs-{pluginId}/current/` 目录下
- `{pluginId}` 对应配置中的文档实例 ID（`onpremise`、`cmp`、`baremetal`）

### 软链接处理规则

当文档目录中存在软链接指向 `shared` 目录时，需要按照以下规则处理翻译：

#### 软链接识别

检查源文档中的软链接：
```bash
# 检查某个目录是否为软链接
cd docs/onpremise/guides && ls -la monitor_ops
# 输出：lrwxr-xr-x ... monitor_ops -> ../../shared/guides/monitor_ops
```

#### 翻译文件位置

1. **共享文档翻译**：将翻译文件放在共享文档实例的翻译目录中
   - 源路径：`docs/shared/guides/monitor_ops/`
   - 翻译路径：`i18n/en/docusaurus-plugin-content-docs/current/guides/monitor_ops/`

2. **软链接创建**：在引用该共享文档的文档实例翻译目录中创建软链接
   - 软链接位置：`i18n/en/docusaurus-plugin-content-docs-onpremise/current/guides/monitor_ops`
   - 软链接目标：`../../shared/guides/monitor_ops`

#### 软链接路径规则

根据软链接在文档实例中的位置，使用相对路径指向共享翻译目录。**关键点**：翻译目录中的 `shared` 是一个软链接，指向 `../docusaurus-plugin-content-docs/current`，因此软链接路径应该使用 `../shared/...` 或 `../../shared/...` 的形式。

| 源文档软链接路径 | 翻译软链接位置 | 软链接目标路径 | 说明 |
|----------------|--------------|--------------|------|
| `docs/onpremise/contact` -> `../shared/contact` | `i18n/en/...-onpremise/current/contact` | `../shared/contact` | 顶层目录，使用 `../shared/` |
| `docs/onpremise/release-notes` -> `../shared/release-notes` | `i18n/en/...-onpremise/current/release-notes` | `../shared/release-notes` | 顶层目录，使用 `../shared/` |
| `docs/onpremise/guides/monitor_ops` -> `../../shared/guides/monitor_ops` | `i18n/en/...-onpremise/current/guides/monitor_ops` | `../../shared/guides/monitor_ops` | 子目录，使用 `../../shared/guides/` |
| `docs/onpremise/guides/climc` -> `../../shared/guides/climc` | `i18n/en/...-onpremise/current/guides/climc` | `../../shared/guides/climc` | 子目录，使用 `../../shared/guides/` |
| `docs/onpremise/guides/misc` -> `../../shared/guides/misc` | `i18n/en/...-onpremise/current/guides/misc` | `../../shared/guides/misc` | 子目录，使用 `../../shared/guides/` |

**重要说明**：
1. 翻译目录中的 `shared` 软链接：`i18n/en/docusaurus-plugin-content-docs-onpremise/shared` -> `../docusaurus-plugin-content-docs/current`
2. 因此，从 `current/` 目录看，`../shared/` 实际指向 `../docusaurus-plugin-content-docs/current/`
3. 从 `current/guides/` 目录看，`../../shared/guides/` 实际指向 `../../docusaurus-plugin-content-docs/current/guides/`
4. 软链接路径规则：**保持与源文档相同的相对路径层级关系，但统一使用 `shared` 作为中间路径**

#### 创建软链接示例

```bash
# 1. 先翻译共享文档到共享翻译目录
# 翻译文件已放在：i18n/en/docusaurus-plugin-content-docs/current/guides/monitor_ops/

# 2. 在 onpremise 实例的翻译目录中创建软链接
# 注意：路径使用 ../../shared/guides/monitor_ops，其中 shared 是软链接
cd i18n/en/docusaurus-plugin-content-docs-onpremise/current/guides
ln -s ../../shared/guides/monitor_ops monitor_ops

# 3. 验证软链接
ls -la monitor_ops
# 应该显示：lrwxr-xr-x ... monitor_ops -> ../../shared/guides/monitor_ops

# 4. 验证软链接有效性
test -e monitor_ops && echo "软链接有效" || echo "软链接无效"
ls monitor_ops  # 应该能列出翻译文件
```

#### 常见软链接目录

以下目录通常通过软链接共享：
- `contact` - 联系方式
- `release-notes` - 版本发布说明
- `guides/climc` - 命令行工具
- `guides/misc` - 其他功能
- `guides/monitor_ops` - 监控运维

## 🔄 同步文件结构

如果需要同步所有文件结构（**注意：会覆盖现有英文文档**）：

```bash
make sync-translation-files
```

这个命令会：
- 复制所有中文文档到英文目录
- **覆盖**现有的英文翻译文件
- 请谨慎使用！

## ✅ 翻译完成后

1. **测试英文版本**：
   ```bash
   make start-en
   ```

2. **检查链接和格式**：
   - 浏览英文网站
   - 检查侧边栏导航
   - 验证内部链接

3. **提交代码**：
   ```bash
   git add i18n/en/
   git commit -m "docs: translate [文件名] to English"
   ```

## 🐛 常见问题

### Q: 翻译后的文件在网站上不显示？

A: 检查：
1. 文件路径是否正确
2. 文件名是否匹配（包括大小写）
3. Frontmatter 格式是否正确
4. 运行 `make write-en-translation` 更新翻译索引

### Q: 如何翻译包含代码块的文档？

A: 代码块不需要翻译，保持原样。只翻译：
- 代码块前的说明文字
- 代码块后的注释（如果有）

### Q: 图片路径需要修改吗？

A: 不需要修改图片路径，但需要确保图片文件存在。如果文档引用了 `./images/` 或 `./img/` 目录，需要将这些目录复制到英文翻译目录的对应位置。翻译辅助脚本会自动处理这个问题。

### Q: 如何处理文档中的链接？

A: 
- **内部链接**：需要更新为新的路径结构
  - 旧路径：`/docs/getting-started/onpremise/...` → 新路径：`/docs/onpremise/getting-started/...`
  - 旧路径：`/docs/guides/onpremise/...` → 新路径：`/docs/onpremise/guides/...`
  - 旧路径：`/docs/introduction/...` → 新路径：`/docs/shared/introduction/...` 或 `/docs/onpremise/introduction/...`
  - 参考重定向规则确定正确的目标路径
- **外部链接**：保持原样
- **相对路径链接**：保持原样（相对于当前文档）

### Q: 如何确定文档属于哪个文档实例？

A: 查看文档的源路径：
- `docs/shared/` → `default` 文档实例
- `docs/onpremise/` → `onpremise` 文档实例
- `docs/cmp/` → `cmp` 文档实例
- `docs/baremetal/` → `baremetal` 文档实例

## 📚 相关资源

- [Docusaurus i18n 文档](https://docusaurus.io/docs/i18n/tutorial)
- [项目 README](../README.md)
- [缺失翻译列表](../missing-translations.txt)

## 💡 提示

1. **保持一致性**：参考已有英文翻译的风格和术语
2. **技术术语**：Cloudpods、K3s、K8s 等专有名词保持原样
3. **代码示例**：确保代码示例在英文版本中也能正常工作
4. **逐步翻译**：不要一次性翻译所有文件，按文档实例分批进行更易管理
5. **路径更新**：翻译时记得更新内部链接为新的路径结构
6. **文档实例**：确保翻译文件放在正确的文档实例目录下
7. **测试验证**：翻译完成后，使用 `make start-en` 测试英文版本，检查链接和导航是否正确

## 🔄 迁移现有翻译

如果存在旧的翻译文件（在 `i18n/en/docusaurus-plugin-content-docs/current/` 下），需要：

1. **识别文档类型**：根据文件路径确定属于哪个文档实例
2. **移动到正确位置**：将文件移动到对应的文档实例目录
3. **更新链接**：更新文档中的内部链接
4. **验证**：运行 `make start-en` 验证翻译是否正确显示

## 📊 翻译进度跟踪

建议使用以下方式跟踪翻译进度：

1. 为每个文档实例创建翻译任务清单
2. 使用 GitHub Issues 或项目管理工具跟踪进度
3. 定期运行 `make check-missing-translations` 检查缺失的翻译
4. 在翻译指南中更新已完成的任务（使用 `[x]` 标记）

