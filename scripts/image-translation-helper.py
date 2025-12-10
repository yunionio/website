#!/usr/bin/env python3
"""
图片翻译辅助脚本

帮助管理需要翻译的图片文件。

功能：
1. 列出包含中文文字的图片
2. 创建图片翻译任务清单
3. 标记已翻译的图片

用法:
    # 列出需要翻译的图片
    python3 scripts/image-translation-helper.py list --dir i18n/en/docusaurus-plugin-content-docs/current/introduction/images

    # 创建翻译任务清单
    python3 scripts/image-translation-helper.py create-checklist --dir i18n/en/docusaurus-plugin-content-docs/current/introduction/images
"""

import os
import argparse
from pathlib import Path
from collections import defaultdict

ROOT_DIR = Path(__file__).parent.parent


def list_images(directory: Path):
    """列出目录下的所有图片文件"""
    image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'}
    images = []
    
    if not directory.exists():
        print(f"❌ 目录不存在: {directory}")
        return images
    
    for file_path in directory.iterdir():
        if file_path.is_file() and file_path.suffix.lower() in image_extensions:
            images.append(file_path)
    
    return sorted(images)


def create_checklist(directory: Path, output_file: Path = None):
    """创建图片翻译任务清单"""
    images = list_images(directory)
    
    if not images:
        print(f"📭 目录中没有找到图片文件: {directory}")
        return
    
    if output_file is None:
        output_file = ROOT_DIR / "image-translation-checklist.md"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# 图片翻译任务清单\n\n")
        f.write(f"目录: `{directory}`\n\n")
        f.write("## 翻译方法\n\n")
        f.write("### 方法一：重新截图（推荐）\n\n")
        f.write("如果 Cloudpods 支持英文界面：\n")
        f.write("1. 切换到英文界面\n")
        f.write("2. 按照中文截图的操作步骤重新截图\n")
        f.write("3. 替换对应的图片文件\n\n")
        f.write("### 方法二：使用图片编辑工具\n\n")
        f.write("使用 Photoshop、GIMP、Figma 等工具：\n")
        f.write("1. 打开中文图片\n")
        f.write("2. 识别并替换中文文字为英文\n")
        f.write("3. 保持界面布局和样式一致\n")
        f.write("4. 保存为同名文件替换原文件\n\n")
        f.write("### 方法三：使用 AI 工具辅助\n\n")
        f.write("可以使用 AI 图片编辑工具（如 Adobe Firefly、Canva AI）来辅助翻译图片中的文字。\n\n")
        f.write("---\n\n")
        f.write("## 待翻译图片列表\n\n")
        f.write("| 序号 | 文件名 | 状态 | 备注 |\n")
        f.write("|------|--------|------|------|\n")
        
        for i, img_path in enumerate(images, 1):
            rel_path = img_path.relative_to(ROOT_DIR)
            f.write(f"| {i} | `{img_path.name}` | ⏳ 待翻译 | - |\n")
        
        f.write(f"\n\n总计: {len(images)} 个图片文件\n")
    
    print(f"✅ 已创建翻译任务清单: {output_file}")
    print(f"   共 {len(images)} 个图片文件")


def analyze_image_usage(directory: Path):
    """分析图片在文档中的使用情况"""
    docs_dir = ROOT_DIR / "i18n" / "en" / "docusaurus-plugin-content-docs" / "current"
    images = list_images(directory)
    
    if not images:
        return
    
    # 查找所有 markdown 文件
    md_files = []
    for root, dirs, files in os.walk(docs_dir):
        for file in files:
            if file.endswith(('.md', '.mdx')):
                md_files.append(Path(root) / file)
    
    # 统计图片使用情况
    usage = defaultdict(list)
    for img_path in images:
        img_name = img_path.name
        for md_file in md_files:
            try:
                content = md_file.read_text(encoding='utf-8')
                if img_name in content:
                    usage[img_name].append(md_file.relative_to(docs_dir))
            except:
                pass
    
    print("\n📊 图片使用情况分析\n")
    print("=" * 80)
    for img_name in sorted(usage.keys()):
        print(f"\n🖼️  {img_name}")
        print(f"   使用位置:")
        for doc_path in usage[img_name]:
            print(f"   - {doc_path}")
    
    unused = [img.name for img in images if img.name not in usage]
    if unused:
        print(f"\n⚠️  未使用的图片 ({len(unused)} 个):")
        for img_name in unused:
            print(f"   - {img_name}")


def main():
    parser = argparse.ArgumentParser(
        description='图片翻译辅助工具'
    )
    parser.add_argument(
        'action',
        choices=['list', 'create-checklist', 'analyze'],
        help='操作类型'
    )
    parser.add_argument(
        '--dir',
        type=str,
        default='i18n/en/docusaurus-plugin-content-docs/current/introduction/images',
        help='图片目录路径（相对于项目根目录）'
    )
    parser.add_argument(
        '--output',
        type=str,
        help='输出文件路径（仅用于 create-checklist）'
    )
    
    args = parser.parse_args()
    
    # 解析目录路径
    if Path(args.dir).is_absolute():
        img_dir = Path(args.dir)
    else:
        img_dir = ROOT_DIR / args.dir
    
    if args.action == 'list':
        images = list_images(img_dir)
        print(f"\n📷 找到 {len(images)} 个图片文件:\n")
        for img in images:
            size_kb = img.stat().st_size / 1024
            print(f"  - {img.name} ({size_kb:.1f} KB)")
    
    elif args.action == 'create-checklist':
        output_file = Path(args.output) if args.output else None
        create_checklist(img_dir, output_file)
    
    elif args.action == 'analyze':
        analyze_image_usage(img_dir)


if __name__ == "__main__":
    main()

