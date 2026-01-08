---
title: VMware Integration Common Questions
sidebar_position: 3
---

## Virtual Machine Creation Error "Disk Allocation Failed"

If creating a VMware virtual machine results in a "Disk Allocation Failed" error, it should be because the platform does not save vmdk format system templates by default.

By default, uploading system images to the platform only retains qcow2 format template files, but creating VMware virtual machines requires vmdk format files. You can enable vmdk image file conversion through the following steps to resolve this issue.

1. Modify platform configuration:

```bash
climc service-config-edit glance
```

Change the `target_image_formats` parameter to qcow2 and vmdk:

```yaml
  target_image_formats:
  - qcow2
  - vmdk
```

2. Restart glance service:

```bash
kubectl rollout restart deployment -n onecloud $(kubectl get deployment -n onecloud | grep glance | awk '{print $1}')
```

Related issues:

- [Managing VMware vSAN, after uploading qcow2 image, using image to create virtual machine reports error "Disk Allocation Failed"](https://github.com/yunionio/cloudpods/issues/18774)
- [Turn off automatic vmdk image conversion](../../../onpremise/guides/glance/sysimage/upload#turn-off-image-formats)


## VMware Synchronization后 Host Has No IP

There may be two reasons:

1. Because VMware host IPs are obtained through vmtools inside the virtual machine, if the virtual machine is in a powered-off state during synchronization, or vmtools is not installed in the virtual machine, or vmtools is not running correctly in the virtual machine, the IP cannot be obtained.

2. The virtual machine's IP can be obtained normally through vmtools, but this IP does not have a corresponding IP subnet on the platform, causing the virtual machine's IP subnet to be undetermined. (At this time, the host's IP information will be saved in the host's tags. The frontend will display this IP, but will prompt "This IP address has no associated IP subnet! Please add an IP subnet containing this IP address and resynchronize the cloud account.")

Therefore, in order for VMware hosts to have IP addresses after synchronization, two conditions need to be met:

1. The host is running, vmtools is installed in the host, and vmtools is running normally

2. The host IP has an associated classic network (Default VPC) IP subnet on the cloud platform

## VMware Synchronization后 Missing Hosts

When the cloud platform synchronizes resources, it requires VMware host UUIDs to be globally unique, and will automatically ignore all hosts with the same UUID. Hosts with the same UUID can be found in synchronization logs.

In order for hosts with the same UUID to synchronize normally, you need to manually modify the host's UUID to ensure global uniqueness. The method is:

On the VMware platform, edit the host's .vmx configuration file and modify the bios.uuid field.

