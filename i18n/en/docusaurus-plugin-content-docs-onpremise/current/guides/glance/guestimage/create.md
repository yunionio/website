---
sidebar_position: 1
---

# Create Guest Image

Guest images can be created in the following ways.

## Create Based on Virtual Host

When saving a virtual machine image, you can choose to save a guest image, that is, save all host disks as images separately, and compose them into a guest image.

## Create Based on Existing Disk Images

You can compose multiple disk images into a guest image.

climc command is as follows:

```bash
climc guest-image-create <name> --image <id_of_root_image> --image <id_of_data_image> --image ...
```

Requires all images to be in active status, and the first image to be the system disk with os_type attribute set.

### How to Import VMware OVA Virtual Machine Files as Guest Images?

OVA is actually a zip compressed directory. First decompress the OVA into a directory. The directory contains an OVF file describing the virtual machine configuration information, and several VMDK disk files. Upload the VMDK disk files to the platform separately to become disk images. Then follow the above steps to merge these VMDK disk images into a guest image. Note that the order of these VMDK images needs to strictly follow the order in the OVA.


