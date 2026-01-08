#!/usr/bin/env python3
"""
检查缺失的英文翻译文档

适配多文档实例结构：
- shared (default) -> i18n/en/docusaurus-plugin-content-docs/current
- onpremise -> i18n/en/docusaurus-plugin-content-docs-onpremise/current
- cmp -> i18n/en/docusaurus-plugin-content-docs-cmp/current
- baremetal -> i18n/en/docusaurus-plugin-content-docs-baremetal/current

用法:
    python3 scripts/check-missing-translations.py
"""

import os
from pathlib import Path
from collections import defaultdict

# 项目根目录
ROOT_DIR = Path(__file__).parent.parent
DOCS_DIR = ROOT_DIR / "docs"
I18N_EN_BASE = ROOT_DIR / "i18n" / "en"

# 文档实例映射：{中文文档目录: (插件ID, i18n目录名)}
DOC_INSTANCES = {
    "shared": ("default", "docusaurus-plugin-content-docs"),
    "onpremise": ("onpremise", "docusaurus-plugin-content-docs-onpremise"),
    "cmp": ("cmp", "docusaurus-plugin-content-docs-cmp"),
    "baremetal": ("baremetal", "docusaurus-plugin-content-docs-baremetal"),
}

# 需要忽略的文件和目录
IGNORE_PATTERNS = [
    "node_modules",
    ".git",
    "build",
    "_output",
    "images",  # 图片目录通常不需要翻译
    "imgs",
    "img",
]


def should_ignore(path: Path) -> bool:
    """检查路径是否应该被忽略"""
    parts = path.parts
    for pattern in IGNORE_PATTERNS:
        if pattern in parts:
            return True
    return False


def is_symlink(path: Path) -> bool:
    """检查路径是否为软链接"""
    try:
        return path.is_symlink()
    except:
        return False


def resolve_symlink(path: Path) -> Path:
    """解析软链接，返回实际路径"""
    try:
        if path.is_symlink():
            return path.resolve()
        return path
    except:
        return path


def find_markdown_files(directory: Path, relative_to: Path = None) -> dict:
    """查找所有 markdown 文件，返回相对路径映射"""
    files = {}
    if not directory.exists():
        return files
    
    if relative_to is None:
        relative_to = directory
    
    for root, dirs, filenames in os.walk(directory, followlinks=False):
        root_path = Path(root)
        
        # 过滤掉需要忽略的目录
        dirs[:] = [d for d in dirs if not should_ignore(root_path / d)]
        
        for filename in filenames:
            if filename.endswith(('.md', '.mdx')):
                file_path = root_path / filename
                if should_ignore(file_path):
                    continue
                rel_path = file_path.relative_to(relative_to)
                files[str(rel_path)] = file_path
    
    return files


def get_file_size(path: Path) -> int:
    """获取文件大小（字节）"""
    try:
        return path.stat().st_size
    except:
        return 0


def get_instance_from_path(rel_path: str) -> tuple:
    """根据相对路径确定文档实例"""
    parts = rel_path.split(os.sep)
    if parts and parts[0] in DOC_INSTANCES:
        return DOC_INSTANCES[parts[0]]
    # 默认返回 shared
    return DOC_INSTANCES["shared"]


def get_translation_path(rel_path: str, instance_name: str) -> Path:
    """获取对应的翻译文件路径"""
    _, i18n_dir_name = DOC_INSTANCES[instance_name]
    i18n_dir = I18N_EN_BASE / i18n_dir_name / "current"
    
    # 移除实例名前缀（如 shared/、onpremise/）
    parts = rel_path.split(os.sep)
    if parts and parts[0] in DOC_INSTANCES:
        rel_path_in_instance = os.sep.join(parts[1:])
    else:
        rel_path_in_instance = rel_path
    
    return i18n_dir / rel_path_in_instance


def check_symlink_translation(zh_path: Path, rel_path: str) -> tuple:
    """检查软链接文档的翻译情况
    
    返回: (是否已翻译, 翻译路径, 是否为软链接)
    """
    if not is_symlink(zh_path):
        return (False, None, False)
    
    # 解析软链接目标
    target_path = resolve_symlink(zh_path)
    
    # 检查目标是否在 shared 目录
    try:
        target_rel = target_path.relative_to(DOCS_DIR)
        target_parts = str(target_rel).split(os.sep)
        
        if target_parts and target_parts[0] == "shared":
            # 软链接指向 shared，检查 shared 的翻译
            shared_translation = get_translation_path(str(target_rel), "shared")
            if shared_translation.exists():
                return (True, shared_translation, True)
            return (False, shared_translation, True)
    except ValueError:
        # 目标不在 docs 目录下
        pass
    
    return (False, None, True)


def main():
    print("=" * 80)
    print("检查缺失的英文翻译文档（多文档实例结构）")
    print("=" * 80)
    print()
    
    # 按实例统计
    instance_stats = {}
    all_missing_files = {}
    all_outdated_files = {}
    
    for instance_name, (plugin_id, i18n_dir_name) in DOC_INSTANCES.items():
        print(f"正在检查文档实例: {instance_name} ({plugin_id})")
        
        # 中文文档目录
        zh_instance_dir = DOCS_DIR / instance_name
        if not zh_instance_dir.exists():
            print(f"  ⚠️  中文文档目录不存在: {zh_instance_dir}")
            continue
        
        # 翻译目录
        i18n_instance_dir = I18N_EN_BASE / i18n_dir_name / "current"
        
        # 查找中文文档（相对于实例目录）
        zh_files = find_markdown_files(zh_instance_dir, relative_to=zh_instance_dir)
        
        # 查找英文翻译（相对于翻译目录）
        en_files = {}
        if i18n_instance_dir.exists():
            en_files = find_markdown_files(i18n_instance_dir, relative_to=i18n_instance_dir)
        
        # 找出缺失的文档
        missing_files = {}
        symlink_files = {}
        
        for rel_path, zh_path in zh_files.items():
            # 构建完整相对路径（包含实例名）
            full_rel_path = f"{instance_name}/{rel_path}"
            
            # 检查是否为软链接
            is_sym = is_symlink(zh_path)
            if is_sym:
                # 检查软链接的翻译情况
                translated, trans_path, _ = check_symlink_translation(zh_path, full_rel_path)
                if translated:
                    # 软链接已通过共享文档翻译
                    symlink_files[full_rel_path] = (zh_path, trans_path)
                    continue
                elif trans_path:
                    # 软链接指向 shared，但 shared 未翻译
                    missing_files[full_rel_path] = (zh_path, trans_path, "shared")
                    continue
            
            # 检查实例自己的翻译
            en_path = i18n_instance_dir / rel_path
            if not en_path.exists():
                missing_files[full_rel_path] = (zh_path, en_path, instance_name)
        
        # 找出可能过时的英文文档
        outdated_files = {}
        for rel_path, en_path in en_files.items():
            zh_path = zh_instance_dir / rel_path
            if not zh_path.exists():
                full_rel_path = f"{instance_name}/{rel_path}"
                outdated_files[full_rel_path] = en_path
        
        instance_stats[instance_name] = {
            "zh_count": len(zh_files),
            "en_count": len(en_files),
            "missing_count": len(missing_files),
            "outdated_count": len(outdated_files),
            "symlink_count": len(symlink_files),
        }
        
        all_missing_files.update(missing_files)
        all_outdated_files.update(outdated_files)
        
        print(f"  中文文档: {len(zh_files)}")
        print(f"  英文翻译: {len(en_files)}")
        print(f"  缺失翻译: {len(missing_files)}")
        print(f"  软链接（已通过共享翻译）: {len(symlink_files)}")
        print(f"  可能过时: {len(outdated_files)}")
        print()
    
    # 总体统计
    print("=" * 80)
    print("总体统计")
    print("=" * 80)
    total_zh = sum(s["zh_count"] for s in instance_stats.values())
    total_en = sum(s["en_count"] for s in instance_stats.values())
    total_missing = len(all_missing_files)
    total_outdated = len(all_outdated_files)
    total_symlink = sum(s["symlink_count"] for s in instance_stats.values())
    
    print(f"中文文档总数: {total_zh}")
    print(f"英文翻译总数: {total_en}")
    print(f"缺失的英文翻译: {total_missing}")
    print(f"软链接（已通过共享翻译）: {total_symlink}")
    print(f"可能过时的英文文档: {total_outdated}")
    print()
    
    # 按实例显示详细统计
    print("=" * 80)
    print("按实例统计")
    print("=" * 80)
    for instance_name, stats in instance_stats.items():
        print(f"\n📦 {instance_name}:")
        print(f"  中文: {stats['zh_count']} | 英文: {stats['en_count']} | 缺失: {stats['missing_count']} | 软链接: {stats['symlink_count']} | 过时: {stats['outdated_count']}")
    
    # 按目录分组显示缺失的文档
    if all_missing_files:
        print()
        print("=" * 80)
        print("缺失的英文翻译文档（按目录分组）")
        print("=" * 80)
        
        by_dir = defaultdict(list)
        for rel_path, info in all_missing_files.items():
            if isinstance(info, tuple):
                zh_path, en_path, instance = info
            else:
                zh_path = info
                en_path = None
                instance = None
            
            dir_path = str(Path(rel_path).parent)
            file_size = get_file_size(zh_path)
            by_dir[dir_path].append((rel_path, file_size, instance))
        
        # 按文件大小排序（大的优先）
        for dir_path in sorted(by_dir.keys()):
            files = sorted(by_dir[dir_path], key=lambda x: x[1], reverse=True)
            print(f"\n📁 {dir_path}/")
            total_size = 0
            for rel_path, size, instance in files:
                size_kb = size / 1024
                total_size += size
                instance_note = f" [{instance}]" if instance else ""
                print(f"  ❌ {rel_path} ({size_kb:.1f} KB){instance_note}")
            print(f"  小计: {len(files)} 个文件, {total_size/1024:.1f} KB")
        
        print()
        print("=" * 80)
        print("建议的翻译优先级（按文件大小）")
        print("=" * 80)
        
        # 按文件大小排序，显示前20个
        sorted_missing = sorted(
            all_missing_files.items(),
            key=lambda x: get_file_size(x[1][0] if isinstance(x[1], tuple) else x[1]),
            reverse=True
        )
        
        for i, (rel_path, info) in enumerate(sorted_missing[:20], 1):
            if isinstance(info, tuple):
                zh_path, en_path, instance = info
            else:
                zh_path = info
                instance = None
            
            size_kb = get_file_size(zh_path) / 1024
            instance_note = f" [{instance}]" if instance else ""
            print(f"{i:2d}. {rel_path} ({size_kb:.1f} KB){instance_note}")
        
        if len(sorted_missing) > 20:
            print(f"\n... 还有 {len(sorted_missing) - 20} 个文件")
    
    # 显示可能过时的文档
    if all_outdated_files:
        print()
        print("=" * 80)
        print("可能过时的英文文档（中文已删除但英文仍存在）")
        print("=" * 80)
        for rel_path in sorted(all_outdated_files.keys()):
            print(f"  ⚠️  {rel_path}")
    
    print()
    print("=" * 80)
    print("翻译建议")
    print("=" * 80)
    print("""
1. 使用 Docusaurus 的 write-translations 命令生成翻译模板:
   make write-en-translation
   或
   yarn write-translations --locale en

2. 手动翻译缺失的文档:
   - 优先翻译大文件（内容更完整）
   - 保持文档结构和格式一致
   - 注意代码块、链接、图片路径等不需要翻译
   - 注意软链接文档：如果指向 shared，只需翻译 shared 目录中的文档

3. 可以使用 AI 翻译工具辅助:
   - 使用 ChatGPT、Claude 等 AI 工具进行初步翻译
   - 然后人工校对技术术语和格式

4. 同步文件结构:
   make sync-translation-files
   (注意：这会覆盖英文文档，请谨慎使用)

5. 翻译完成后，使用以下命令测试英文版本:
   make start-en
   或
   make docker-start-en

6. 对于软链接文档，使用以下命令同步软链接:
   make sync-i18n-symlinks
    """)
    
    # 生成缺失文件列表（可用于脚本处理）
    if all_missing_files:
        missing_list_file = ROOT_DIR / "missing-translations.txt"
        with open(missing_list_file, "w", encoding="utf-8") as f:
            for rel_path in sorted(all_missing_files.keys()):
                f.write(f"{rel_path}\n")
        print(f"\n✅ 缺失文件列表已保存到: {missing_list_file}")


if __name__ == "__main__":
    main()
