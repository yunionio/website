---
sidebar_position: 4
---

# Expand Backend Image Storage

Introduction to how to expand backend image storage.

:::tip
This method only applies to cases where the glance image service uses local storage, and does not apply to cases where the backend uses S3 as backend storage.
:::

## Expansion Applies to the Following Two Cases

- New deployment environment **/opt/cloud/workspace/data/glance** space is too small, insufficient to store required images
- Existing environment has exhausted storage space, cannot store new images, and existing images are in use and cannot be cleaned and released

## New Environment

The goal is to expand the **empty** /opt/cloud/workspace/data/glance to ensure it can store required image files.

### Expand to Block Device

Assuming the block device to expand is /dev/sdd.

- Partition and format /dev/sdd
- Mount /dev/sdd1 to /opt/cloud/workspace/data/glance directory, and write mount information to /etc/fstab
- mount /dev/sdd1 /opt/cloud/workspace/data/glance

### Expand to Directory

Assuming expanding to directory /home/glance/images.

- Mount /home/glance/images directory to /opt/cloud/workspace/data/glance directory, and write mount information to /etc/fstab
- mount --bind /home/glance/images /opt/cloud/workspace/data/glance

## Existing Environment Expansion

The goal is to expand **existing images** /opt/cloud/workspace/data/glance.

### Expand to Block Device

Assuming the block device to expand is /dev/sdd.

- Partition and format /dev/sdd
- Mount /dev/sdd1 to /mnt directory (mount /dev/sdd1 /mnt)
- Transfer /opt/cloud/workspace/data/glance images to /mnt (rsync -avp /opt/cloud/workspace/data/glance/* /mnt/)
- Unmount /dev/sdd1 (umount /dev/sdd1)
- Mount /dev/sdd1 to /opt/cloud/workspace/data/glance directory, and write mount information to /etc/fstab
- mount /dev/sdd1 /opt/cloud/workspace/data/glance

### Expand to Directory

Assuming expanding to directory /home/glance/images.

- Transfer /opt/cloud/workspace/data/glance image files to /home/glance/images directory (rsync -avp /opt/cloud/workspace/data/glance/* /home/glance/images/)
- Mount /home/glance/images directory to /opt/cloud/workspace/data/glance directory, and write mount information to /etc/fstab
- mount --bind /home/glance/images /opt/cloud/workspace/data/glance


