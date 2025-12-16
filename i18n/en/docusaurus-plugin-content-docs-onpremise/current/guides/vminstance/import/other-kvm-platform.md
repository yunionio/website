---
sidebar_position: 3
---

# Migrate Other Platform Virtual Machine Disks

Import through migrating other platform virtual machine disks. This method is relatively low-level. The principle is to import all disks of virtual machines to be imported into Cloudpods built-in private cloud as virtual machine image template files.

1. Export virtual machine disk files (.qcow2 files) through other platforms.
2. Upload images to an http server.
3. Use Cloudpods image service to import system images.
4. Create virtual machines through images.
5. If the original virtual machine had cloud disks mounted, you can migrate according to the following methods:
   - Similar to the above operations, you need to first generate images from data disks, import similarly, Cloudpods uses this image to create data cloud disks, then mount cloud disks to virtual machines.
   - First create a cloud disk of the same size in Cloudpods, find the corresponding path, directly copy original cloud disk data to the new path, and finally mount it to the virtual machine. 

## Proxmox Example

Log in to pve console, select the corresponding host, view current host hard disk id in hardware:

![](https://github.com/yunionio/cloudpods/assets/1650540/eea3492e-e55d-4b95-ba95-45b9feadf41b)

Using local-lvm:vm-101-disk-0 in the figure as an example, log in to the corresponding host, execute:

```bash
$ pvesm path local-lvm:vm-101-disk-0
/dev/pve/vm-101-disk-0
```

`/dev/pve/vm-101-disk-0` is the disk we want to migrate. Stop the virtual machine, export:

```
$ qemu-img convert -c -p -f raw -O qcow2  /dev/pve/vm-101-disk-0 /mnt/vm-101-disk0
```

Exported image is located at /mnt/vm-101-disk-0. Since compression is enabled, the file will be smaller.

>  '-c' indicates that target image must be compressed (qcow format only)

In the current directory, python3 -m http.server 9999 starts http server, or upload to nginx and other http services. In cloudpods system images, import images, create virtual machines.

If virtual machines have multiple disks, export multiple disks as qcow2 according to the above method, then import as system images. Use `climc guest-image-create` to merge multiple system images to create host images.

```bash
$ climc guest-image-create <name> --image <id_of_root_image> --image <id_of_data_image> --image ...
```

Note to strictly ensure that `--image` image order is consistent with pve internal order. ID is the system image UUID imported to cloudpods.

After host image creation is successful, use host images to create virtual machines. Refer to: [Create Host Image](../../glance/guestimage/create/)

