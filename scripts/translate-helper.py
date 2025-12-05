#!/usr/bin/env python3
"""
翻译辅助脚本

功能：
1. 复制中文文档到英文目录（保持结构）
2. 在文件开头添加翻译标记
3. 批量处理多个文件

用法:
    # 翻译单个文件
    python3 scripts/translate-helper.py docs/getting-started/onpremise/buildah-k3s.md

    # 从缺失列表批量复制文件结构
    python3 scripts/translate-helper.py --batch missing-translations.txt

    # 只复制文件结构，不添加内容
    python3 scripts/translate-helper.py --structure-only docs/path/to/file.md
"""

import os
import sys
import argparse
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
DOCS_DIR = ROOT_DIR / "docs"
I18N_EN_DIR = ROOT_DIR / "i18n" / "en" / "docusaurus-plugin-content-docs" / "current"

TRANSLATION_NOTICE = """---
# ⚠️ 此文件需要翻译
# 此文件是从中文文档自动复制而来，需要人工翻译成英文
# 请保持文档结构和格式，只翻译文本内容
# 代码块、链接、图片路径等不需要翻译
---

"""


def copy_file_structure(zh_file_path: Path, add_notice: bool = True) -> bool:
    """
    复制中文文档到英文目录，保持目录结构
    
    Args:
        zh_file_path: 中文文档路径（相对于 docs/ 或绝对路径）
        add_notice: 是否在文件开头添加翻译提示
    
    Returns:
        是否成功
    """
    # 转换为绝对路径
    if not zh_file_path.is_absolute():
        zh_file_path = DOCS_DIR / zh_file_path
    
    if not zh_file_path.exists():
        print(f"❌ 文件不存在: {zh_file_path}")
        return False
    
    # 计算相对路径
    try:
        rel_path = zh_file_path.relative_to(DOCS_DIR)
    except ValueError:
        print(f"❌ 文件不在 docs/ 目录下: {zh_file_path}")
        return False
    
    # 目标路径
    en_file_path = I18N_EN_DIR / rel_path
    
    # 创建目标目录
    en_file_path.parent.mkdir(parents=True, exist_ok=True)
    
    # 复制图片目录（如果存在）
    zh_images_dir = zh_file_path.parent / "images"
    if zh_images_dir.exists() and zh_images_dir.is_dir():
        en_images_dir = en_file_path.parent / "images"
        if not en_images_dir.exists():
            import shutil
            shutil.copytree(zh_images_dir, en_images_dir)
            print(f"📷 已复制图片目录: {zh_images_dir.name}")
    
    # 复制 img 目录（如果存在，用于 index.md 等文件）
    zh_img_dir = zh_file_path.parent / "img"
    if zh_img_dir.exists() and zh_img_dir.is_dir():
        en_img_dir = en_file_path.parent / "img"
        if not en_img_dir.exists():
            import shutil
            shutil.copytree(zh_img_dir, en_img_dir)
            print(f"📷 已复制图片目录: {zh_img_dir.name}")
    
    # 如果目标文件已存在，询问是否覆盖
    if en_file_path.exists():
        print(f"⚠️  文件已存在: {en_file_path}")
        response = input("是否覆盖? (y/N): ").strip().lower()
        if response != 'y':
            print(f"⏭️  跳过: {rel_path}")
            return False
    
    # 读取中文文档
    try:
        with open(zh_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"❌ 读取文件失败: {e}")
        return False
    
    # 如果需要添加翻译提示
    if add_notice:
        # 检查是否已有 frontmatter
        if content.startswith('---'):
            # 在 frontmatter 后添加注释
            lines = content.split('\n')
            end_idx = 1
            for i in range(1, len(lines)):
                if lines[i].strip() == '---':
                    end_idx = i + 1
                    break
            # 插入翻译提示
            lines.insert(end_idx, '')
            lines.insert(end_idx + 1, '# ⚠️ This file needs translation')
            lines.insert(end_idx + 2, '# This file was automatically copied from Chinese docs')
            lines.insert(end_idx + 3, '# Please translate the text content while keeping structure and format')
            lines.insert(end_idx + 4, '# Code blocks, links, image paths, etc. should not be translated')
            content = '\n'.join(lines)
        else:
            # 在文件开头添加翻译提示
            content = TRANSLATION_NOTICE + content
    
    # 写入英文目录
    try:
        with open(en_file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ 已复制: {rel_path} -> {en_file_path}")
        return True
    except Exception as e:
        print(f"❌ 写入文件失败: {e}")
        return False


def batch_copy_from_list(list_file: Path):
    """从文件列表中批量复制"""
    if not list_file.exists():
        print(f"❌ 列表文件不存在: {list_file}")
        return
    
    with open(list_file, 'r', encoding='utf-8') as f:
        files = [line.strip() for line in f if line.strip()]
    
    print(f"准备处理 {len(files)} 个文件...")
    print()
    
    success = 0
    failed = 0
    
    for rel_path in files:
        zh_path = DOCS_DIR / rel_path
        if copy_file_structure(zh_path, add_notice=True):
            success += 1
        else:
            failed += 1
    
    print()
    print("=" * 80)
    print(f"处理完成: 成功 {success} 个, 失败 {failed} 个")
    print("=" * 80)


def main():
    parser = argparse.ArgumentParser(
        description='翻译辅助工具 - 复制中文文档到英文目录'
    )
    parser.add_argument(
        'files',
        nargs='*',
        help='要处理的中文文档路径（相对于 docs/ 目录）'
    )
    parser.add_argument(
        '--batch',
        type=str,
        help='从文件列表中批量处理（文件路径列表，每行一个）'
    )
    parser.add_argument(
        '--structure-only',
        action='store_true',
        help='只复制文件结构，不添加翻译提示'
    )
    
    args = parser.parse_args()
    
    if args.batch:
        batch_file = Path(args.batch)
        if not batch_file.is_absolute():
            batch_file = ROOT_DIR / batch_file
        batch_copy_from_list(batch_file)
    elif args.files:
        for file_path in args.files:
            zh_path = Path(file_path)
            copy_file_structure(zh_path, add_notice=not args.structure_only)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()

