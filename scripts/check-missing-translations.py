#!/usr/bin/env python3
"""
检查缺失的英文翻译文档

用法:
    python3 scripts/check-missing-translations.py
"""

import os
from pathlib import Path
from collections import defaultdict

# 项目根目录
ROOT_DIR = Path(__file__).parent.parent
DOCS_DIR = ROOT_DIR / "docs"
I18N_EN_DIR = ROOT_DIR / "i18n" / "en" / "docusaurus-plugin-content-docs" / "current"

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


def find_markdown_files(directory: Path, relative_to: Path = None) -> dict:
    """查找所有 markdown 文件，返回相对路径映射"""
    files = {}
    if not directory.exists():
        return files
    
    if relative_to is None:
        relative_to = directory
    
    for root, dirs, filenames in os.walk(directory):
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


def main():
    print("=" * 80)
    print("检查缺失的英文翻译文档")
    print("=" * 80)
    print()
    
    # 查找中文文档
    print("正在扫描中文文档...")
    zh_files = find_markdown_files(DOCS_DIR)
    print(f"找到 {len(zh_files)} 个中文文档文件")
    
    # 查找英文翻译文档
    print("正在扫描英文翻译文档...")
    en_files = find_markdown_files(I18N_EN_DIR)
    print(f"找到 {len(en_files)} 个英文翻译文件")
    print()
    
    # 找出缺失的文档
    missing_files = {}
    for rel_path, zh_path in zh_files.items():
        en_path = I18N_EN_DIR / rel_path
        if not en_path.exists():
            missing_files[rel_path] = zh_path
    
    # 找出可能过时的英文文档（英文有但中文没有）
    outdated_files = {}
    for rel_path, en_path in en_files.items():
        zh_path = DOCS_DIR / rel_path
        if not zh_path.exists():
            outdated_files[rel_path] = en_path
    
    # 统计信息
    print("=" * 80)
    print("统计结果")
    print("=" * 80)
    print(f"中文文档总数: {len(zh_files)}")
    print(f"英文翻译总数: {len(en_files)}")
    print(f"缺失的英文翻译: {len(missing_files)}")
    print(f"可能过时的英文文档: {len(outdated_files)}")
    print()
    
    # 按目录分组显示缺失的文档
    if missing_files:
        print("=" * 80)
        print("缺失的英文翻译文档（按目录分组）")
        print("=" * 80)
        
        by_dir = defaultdict(list)
        for rel_path, zh_path in missing_files.items():
            dir_path = str(Path(rel_path).parent)
            file_size = get_file_size(zh_path)
            by_dir[dir_path].append((rel_path, file_size))
        
        # 按文件大小排序（大的优先）
        for dir_path in sorted(by_dir.keys()):
            files = sorted(by_dir[dir_path], key=lambda x: x[1], reverse=True)
            print(f"\n📁 {dir_path}/")
            total_size = 0
            for rel_path, size in files:
                size_kb = size / 1024
                total_size += size
                print(f"  ❌ {rel_path} ({size_kb:.1f} KB)")
            print(f"  小计: {len(files)} 个文件, {total_size/1024:.1f} KB")
        
        print()
        print("=" * 80)
        print("建议的翻译优先级（按文件大小）")
        print("=" * 80)
        
        # 按文件大小排序，显示前20个
        sorted_missing = sorted(missing_files.items(), 
                               key=lambda x: get_file_size(x[1]), 
                               reverse=True)
        
        for i, (rel_path, zh_path) in enumerate(sorted_missing[:20], 1):
            size_kb = get_file_size(zh_path) / 1024
            print(f"{i:2d}. {rel_path} ({size_kb:.1f} KB)")
        
        if len(sorted_missing) > 20:
            print(f"\n... 还有 {len(sorted_missing) - 20} 个文件")
    
    # 显示可能过时的文档
    if outdated_files:
        print()
        print("=" * 80)
        print("可能过时的英文文档（中文已删除但英文仍存在）")
        print("=" * 80)
        for rel_path in sorted(outdated_files.keys()):
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
    """)
    
    # 生成缺失文件列表（可用于脚本处理）
    if missing_files:
        missing_list_file = ROOT_DIR / "missing-translations.txt"
        with open(missing_list_file, "w", encoding="utf-8") as f:
            for rel_path in sorted(missing_files.keys()):
                f.write(f"{rel_path}\n")
        print(f"\n✅ 缺失文件列表已保存到: {missing_list_file}")


if __name__ == "__main__":
    main()

