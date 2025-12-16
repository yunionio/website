---
sidebar_position: 3
---

# Export Image

Download image files to a specified path.

## Climc Operation

If you need to export images from the cloud platform to local, you need to use `climc image-download` to download the images stored in glance.

Refer to [Query Image](./show/) to query the image you want to download, and obtain the image id or name.

Download image:

```bash
# OUTPUT specifies the save path and file name of the image, such as /root/test.qcow2
$ climc image-download [--output OUTPUT] <image_id>
```


