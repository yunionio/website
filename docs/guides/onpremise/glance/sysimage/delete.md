---
sidebar_position: 4
---

# 删除镜像

## Climc命令删除镜像

镜像默认启用了删除保护，当镜像确定不用了，需要先通过`climc image-update`禁用删除保护，再通过 `climc image-delete` 删除镜像。

```bash
# 禁用镜像删除保护
$ climc image-update --unprotected <image_id>

# 删除镜像
$ climc image-delete <image_id>
```
