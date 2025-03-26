---
sidebar_position: 5
---

## 切换为对象存储

Glance服务默认将镜像存储在本地的 /opt/cloud/workspace/data/glance/images 目录中，该目录通过一个本地目录的PVC提供。本地存储简单方便，但是存在glance锁死在单个节点，并且存储空间受限的缺陷。

Glance同时支持将镜像存储在对象存储，下面介绍Glance使用对象存储的配置方法：

### 1. 修改glance配置

```bash
climc service-config-edit glance
```

主要修改如下配置：

| 配置项           | 说明                                                  | 是否可选 |
|-----------------|------------------------------------------------------|--------|
| storage_driver  | 存储类型，默认为 local，需要设置为 s3                     | 必填  |
| s3_endpoint     | 对象存储访问地址，为 addr:port 形式，例如 10.157.23.2:443 | 必填 |
| s3_use_ssl      | 对象存储是否用https访问                                 | 必填 |
| s3_bucket_name  | 用于保存镜像的存储桶名称                                 | 必填 |
| s3_access_key   | 对象存储的 access_key                                  | 必填 |
| s3_secret_key   | 对象存储的 秘钥                                         | 必填 |
| s3_sign_version | 对象存储签名算法版本，默认为 v4，某些对象存储需要设置为 v2    | 可选 |

设置后，重启glance服务

### 2. 工作原理

Glance启用对象存储后端后，会将对象存储桶通过s3fs挂载在本地的 /opt/cloud/workspace/data/glance/s3images 目录下。用户上传镜像时，会先将镜像保存在本地路径，等上传成功后，才会调用s3协议将镜像转存到对象存储。
