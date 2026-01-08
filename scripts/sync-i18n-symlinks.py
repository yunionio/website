#!/usr/bin/env python3
"""
同步 i18n 翻译目录中的软连接

该脚本会：
1. 扫描 docs/{instance}/ 目录中的软连接
2. 在对应的 i18n/en/docusaurus-plugin-content-docs-{instance}/current/ 目录中创建相同的软连接
3. 软连接指向 shared 的翻译文件
"""

import os
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
DOCS_DIR = ROOT_DIR / "docs"
I18N_EN_DIR = ROOT_DIR / "i18n" / "en"

# 文档实例映射
INSTANCE_MAP = {
    "onpremise": "docusaurus-plugin-content-docs-onpremise",
    "cmp": "docusaurus-plugin-content-docs-cmp",
    "baremetal": "docusaurus-plugin-content-docs-baremetal",
    "shared": "docusaurus-plugin-content-docs",  # default instance
}


def find_symlinks(directory: Path):
    """查找目录中的所有软连接"""
    symlinks = []
    for root, dirs, files in os.walk(directory):
        root_path = Path(root)
        for item in dirs + files:
            item_path = root_path / item
            if item_path.is_symlink():
                symlinks.append(item_path)
    return symlinks


def create_i18n_symlink(zh_symlink: Path, instance: str, target_instance: str = "shared"):
    """在 i18n 翻译目录中创建软连接"""
    instance_dir = DOCS_DIR / instance
    rel_path = zh_symlink.relative_to(instance_dir)
    
    # 获取软连接指向的目标路径
    target_path = zh_symlink.readlink()
    if not target_path.is_absolute():
        target_path = (zh_symlink.parent / target_path).resolve()
    
    # 计算目标路径相对于 docs/shared/ 的路径
    shared_dir = DOCS_DIR / target_instance
    try:
        target_rel_path = target_path.relative_to(shared_dir)
    except ValueError:
        print(f"⚠️  软连接目标不在 {target_instance} 目录: {target_path}")
        return False
    
    # i18n 翻译目录中的路径
    i18n_instance_dir = I18N_EN_DIR / INSTANCE_MAP[instance] / "current"
    i18n_symlink_path = i18n_instance_dir / rel_path
    
    i18n_target_dir = I18N_EN_DIR / INSTANCE_MAP[target_instance] / "current"
    i18n_target_path = i18n_target_dir / target_rel_path
    
    if not i18n_target_path.exists():
        print(f"⚠️  目标翻译文件不存在: {i18n_target_path}")
        return False
    
    i18n_symlink_path.parent.mkdir(parents=True, exist_ok=True)
    
    if i18n_symlink_path.exists() or i18n_symlink_path.is_symlink():
        if i18n_symlink_path.is_symlink():
            existing_target = i18n_symlink_path.readlink()
            if existing_target.resolve() == i18n_target_path.resolve():
                return True
        i18n_symlink_path.unlink()
    
    # 计算相对路径
    try:
        relative_target = os.path.relpath(i18n_target_path, i18n_symlink_path.parent)
    except ValueError:
        relative_target = str(i18n_target_path)
    
    try:
        i18n_symlink_path.symlink_to(relative_target)
        print(f"✓  创建软连接: {rel_path} -> {relative_target}")
        return True
    except Exception as e:
        print(f"❌ 创建软连接失败: {rel_path} - {e}")
        return False


def sync_instance_symlinks(instance: str):
    """同步某个文档实例的软连接"""
    instance_dir = DOCS_DIR / instance
    if not instance_dir.exists():
        return
    
    symlinks = find_symlinks(instance_dir)
    if not symlinks:
        return
    
    print(f"\n📁 扫描 {instance} 实例的软连接...")
    print(f"  找到 {len(symlinks)} 个软连接")
    
    success_count = 0
    for symlink in symlinks:
        target_path = symlink.readlink()
        if not target_path.is_absolute():
            target_path = (symlink.parent / target_path).resolve()
        
        if str(target_path).startswith(str(DOCS_DIR / "shared")):
            if create_i18n_symlink(symlink, instance, "shared"):
                success_count += 1
    
    print(f"✓  成功同步 {success_count}/{len(symlinks)} 个软连接")


def main():
    instances = ["onpremise", "cmp", "baremetal"]
    print("🔗 开始同步 i18n 翻译目录中的软连接...\n")
    
    for instance in instances:
        sync_instance_symlinks(instance)
    
    print("\n✅ 同步完成！")


if __name__ == "__main__":
    main()
