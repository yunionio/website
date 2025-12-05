# 图片翻译指南

当文档中的图片包含中文文字时，需要将其翻译成英文。本文档提供几种处理方案。

## 📊 当前情况

`introduction` 目录下有 **44 个图片文件**需要翻译，这些图片都是界面截图，包含中文文字。

## 🎯 推荐方案

### 方案一：重新截图（最佳方案）⭐

如果 Cloudpods 支持英文界面，这是最理想的方案：

**步骤：**
1. 登录 Cloudpods 平台
2. 切换到英文界面（通常在用户设置或语言选择中）
3. 按照中文截图的操作步骤，在英文界面下重新截图
4. 替换对应的图片文件

**优点：**
- 图片质量最好
- 文字清晰准确
- 界面样式一致

**缺点：**
- 需要访问 Cloudpods 平台
- 需要重新操作一遍流程

### 方案二：使用图片编辑工具

使用专业图片编辑工具（如 Photoshop、GIMP、Figma）手动替换文字：

**步骤：**
1. 打开中文图片
2. 识别图片中的中文文字
3. 翻译成对应的英文
4. 使用文字工具替换（保持字体、大小、位置一致）
5. 保存为同名文件替换原文件

**推荐工具：**
- **Photoshop** - 专业图片编辑
- **GIMP** - 免费开源图片编辑
- **Figma** - 在线设计工具，适合 UI 截图编辑
- **Canva** - 在线设计工具，简单易用

**优点：**
- 不需要重新操作流程
- 可以精确控制文字样式

**缺点：**
- 需要图片编辑技能
- 耗时较长

### 方案三：使用 AI 工具辅助

使用 AI 图片编辑工具辅助翻译：

**推荐工具：**
- **Adobe Firefly** - Adobe 的 AI 图片编辑工具
- **Canva AI** - Canva 的 AI 功能
- **Remove.bg + 文字替换** - 先移除文字，再添加英文

**步骤：**
1. 使用 AI 工具识别并移除中文文字
2. 添加对应的英文文字
3. 调整样式使其与界面一致

**优点：**
- 自动化程度高
- 速度快

**缺点：**
- 可能需要多次调整
- 样式可能不完全一致

### 方案四：临时方案（不推荐）

暂时使用中文图片，但添加说明：

```markdown
:::note
The screenshots below are in Chinese. English screenshots will be updated soon.
:::
```

**优点：**
- 快速上线

**缺点：**
- 用户体验不佳
- 需要后续补充

## 🛠️ 使用工具脚本

### 列出需要翻译的图片

```bash
python3 scripts/image-translation-helper.py list \
  --dir i18n/en/docusaurus-plugin-content-docs/current/introduction/images
```

### 创建翻译任务清单

```bash
python3 scripts/image-translation-helper.py create-checklist \
  --dir i18n/en/docusaurus-plugin-content-docs/current/introduction/images
```

这会生成 `image-translation-checklist.md` 文件，包含所有需要翻译的图片列表。

### 分析图片使用情况

```bash
python3 scripts/image-translation-helper.py analyze \
  --dir i18n/en/docusaurus-plugin-content-docs/current/introduction/images
```

这会显示每个图片在哪些文档中被使用。

## 📝 翻译优先级

根据图片的使用频率和重要性，建议按以下优先级翻译：

1. **登录和首页相关**（用户第一印象）
   - `login.png`
   - `dashboard.png`
   - `feature.png`

2. **核心功能截图**（用户常用功能）
   - `kvmvmlist.png` - 虚拟机列表
   - `accountlist.png` - 云账号列表
   - `physicalmachinelist.png` - 物理机列表

3. **操作流程截图**（用户指南）
   - `createkvmvm1.png`, `createkvmvm2.png` - 创建虚拟机
   - `createbaremetal.png` - 创建裸金属
   - `cloudcreate.png` - 创建云账号

4. **其他功能截图**

## ✅ 翻译检查清单

翻译完成后，请检查：

- [ ] 所有中文文字已翻译成英文
- [ ] 文字大小和样式与界面一致
- [ ] 文字位置正确（对齐、间距）
- [ ] 图片质量清晰（分辨率足够）
- [ ] 文件名保持一致（不要修改文件名）
- [ ] 图片格式正确（PNG/JPG）
- [ ] 在英文网站上测试显示效果

## 💡 实用技巧

1. **批量处理**：如果多个图片有相似的文字，可以创建模板批量处理

2. **保持一致性**：
   - 使用相同的字体和字号
   - 保持相同的文字颜色
   - 注意文字的对齐方式

3. **参考英文界面**：
   - 如果 Cloudpods 有英文界面，参考实际的英文界面文字
   - 注意按钮、菜单、标签的英文表达

4. **版本控制**：
   - 翻译前备份原图片
   - 使用 Git 管理图片变更
   - 提交时添加清晰的 commit message

## 🔄 工作流程建议

1. **准备阶段**：
   ```bash
   # 创建翻译任务清单
   python3 scripts/image-translation-helper.py create-checklist \
     --dir i18n/en/docusaurus-plugin-content-docs/current/introduction/images
   ```

2. **翻译阶段**：
   - 选择一个图片
   - 使用选择的工具进行翻译
   - 替换原图片文件

3. **验证阶段**：
   ```bash
   # 启动英文版本测试
   make start-en
   ```
   - 检查图片显示效果
   - 确认文字清晰可读

4. **提交阶段**：
   ```bash
   git add i18n/en/docusaurus-plugin-content-docs/current/introduction/images/
   git commit -m "docs: translate introduction images to English"
   ```

## 📚 相关资源

- [图片翻译任务清单](./image-translation-checklist.md)
- [翻译指南](./TRANSLATION_GUIDE.md)
- [文档重构方案](./refactor.md)
- [Adobe Firefly](https://firefly.adobe.com/)
- [Figma](https://www.figma.com/)
- [GIMP](https://www.gimp.org/)

## ❓ 常见问题

### Q: 如果 Cloudpods 不支持英文界面怎么办？

A: 使用方案二（图片编辑工具）或方案三（AI 工具）。优先使用图片编辑工具手动替换文字。

### Q: 图片中的按钮文字如何翻译？

A: 参考 Cloudpods 的英文文档或 API 文档，使用标准的英文术语。如果不确定，可以查看其他英文文档中的类似截图。

### Q: 可以只翻译部分图片吗？

A: 可以，但建议优先翻译用户最常看到的核心功能图片。可以使用翻译任务清单跟踪进度。

### Q: 图片翻译后需要更新文档吗？

A: 通常不需要，因为图片路径和文件名保持不变。只需要替换图片文件即可。

