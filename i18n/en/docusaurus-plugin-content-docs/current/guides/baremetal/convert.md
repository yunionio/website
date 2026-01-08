---
sidebar_position: 9
---

# Convert Between Physical Machine and Host

This function is used to convert physical machine equipment into hosts.

Physical machines are used to create bare metal servers, and hosts are used to create virtual machines.

## Preparation

1. Hosts are compute nodes with host service installed. When converting physical machines to hosts on the cloud management platform, you need to use a specially made host image provided by our company. Images can be obtained from the following addresses:
    - v3.9 image: https://iso.yunion.cn/vm-images/host-convert-v39-20230404.qcow2
    - v3.9 UEFI image (if host is UEFI boot): https://iso.yunion.cn/vm-images/host-convert-uefi-v39-20230404.qcow2
2. Upload this image to the management platform and record the image's id information.
3. Set the default image for physical machine to host conversion through climc command on the control node.

```bash
# Set the image id of the default image
$ climc service-config --config convert_hypervisor_default_template=a9b67435-8c08-4063-8ea6-d885ea26aa79 region2
```

4. When converting a physical machine to a host, you can directly select disk RAID setting parameters to perform the host conversion operation. Or use custom settings to select a host image to perform the host conversion operation.

## Frontend Operations

After preparing the conversion image, you can convert physical machines to hosts in the frontend. Or operate through climc command line.

## Command Line Operations

### Convert Physical Machine

climc operations are as follows:

```bash
# Convert to host
climc host-convert-hypervisor
```

### Recycle to Physical Machine

This function is used to recycle hosts into physical machines. When the host type is KVM and contains IPMI information, it can be converted to a host. Physical machines are used to create bare metal servers, and hosts are used to create virtual machines.

climc operations are as follows:

```bash
# Recycle to physical machine
climc host-undo-convert <host_id>
```

