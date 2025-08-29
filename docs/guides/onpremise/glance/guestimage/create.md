---
sidebar_position: 1
---

# 制作主机镜像

主机镜像可以通过如下几种方式制作。

## 基于虚拟主机创建

保存虚拟机镜像时，可以选择保存主机镜像，即把主机所有磁盘都分别保存为镜像，并且组成一个主机镜像。

## 基于已有磁盘镜像创建

可以将多个磁盘镜像组成一个主机镜像。

climc命令如下：

```bash
climc guest-image-create <name> --image <id_of_root_image> --image <id_of_data_image> --image ...
```

要求所有镜像的状态都是active状态，并且第一个镜像为系统盘，并且设置了os_type属性。

### 如何将vmware的ova虚拟机文件导入成为主机镜像？

ova其实是一个zip压缩目录。首先将ova解压缩为一个目录，目录内部包含ovf文件描述虚拟机的配置信息，以及若干vmdk磁盘文件。将vmdk磁盘文件分别上传平台成为磁盘镜像。然后按上述步骤将这些vmdk的磁盘镜像合并为一个主机镜像，注意这些vmdk镜像的顺序需要严格按照ova中的顺序。
