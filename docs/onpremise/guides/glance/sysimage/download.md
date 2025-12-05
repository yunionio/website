---
sidebar_position: 3
---

# 导出镜像

将镜像文件下载到指定路径。

## Climc操作

如果需要将云平台的镜像导出到本地，就需要用 `climc image-download` 把 glance 存的镜像下载下来。

参考 [查询镜像](./show/) 查询你想要下载的镜像，获取镜像 id 或 name。

下载镜像:

```bash
# OUTPUT 指定镜像的保存路径和文件名称，如/root/test.qcow2
$ climc image-download [--output OUTPUT] <image_id>
```
