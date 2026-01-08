---
sidebar_position: 1
---

# Upload Image

Introduction to how to upload custom images to the platform.

## Obtain Image

Before uploading an image, you need to obtain the image first. There are many ways, such as downloading images for cloud platforms from distribution official websites, or making them yourself.

### Distribution Images

Download distribution images according to your distribution needs. Common Linux distributions provide images for cloud platform virtual machines. Please refer to [Common System Images](../common-image-url) to obtain.

### Create Image

Reference: [Create Image](./create/)

## Upload Image

After downloading or creating the image, you can upload the image to the platform's glance service through interface operations and Climc command line.

### Climc Command

Use `climc image-upload` to upload to the cloud platform's glance service. The following uses downloading CentOS-7-x86_64-GenericCloud-1711 provided by CentOS as an example:

```bash
# Download CentOS-7-x86_64-GenericCloud-1711.qcow2 
$ wget http://cloud.centos.org/centos/7/images/CentOS-7-x86_64-GenericCloud-1711.qcow2

# Upload image to cloud platform and name it CentOS-7-x86_64-GenericCloud-1711.qcow2
$ climc image-upload --format qcow2 --os-type Linux --os-arch x86_64 --standard CentOS-7-x86_64-GenericCloud-1711.qcow2 ./CentOS-7-x86_64-GenericCloud-1711.qcow2
```

Upload time depends on network environment and image size. After upload is complete, you need to query the image status. When the status becomes 'active', it can be used. (For more information on image queries, refer to: [Image Query](./show/#query-image) )

```bash
$ climc image-show CentOS-7-x86_64-GenericCloud-1711.qcow2 | grep status
|| status          | active |
```
Use `climc image-upload --help` to get explanations of each parameter.

### Turn Off Automatic Conversion of vmdk Images {#turn-off-image-formats}

After upload, the platform supports multi-cloud images. Except for ISO format images, other format images imported to the platform will be converted into 3 different format images.
If the image is large, conversion will take a long time. If you do not use vmware, you can use the `climc service-config-edit glance` command to modify target_image_formats to qcow2.

```yaml
  target_image_formats:
  - qcow2
```


