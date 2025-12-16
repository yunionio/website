---
sidebar_position: 6
---

# host-deployer Service Introduction

host-deployer is deployed in cloudpods as a daemonset, mainly performing initialization and system detection operations on virtual machine image files. Specific content includes
- Set virtual machine password and keys
- Inject custom data
- Inject virtual machine monitoring components
- Configure virtual machine network environment
- Disk formatting, create file system
- Image system information detection
- ......

You can view it through `kubectl -n onecloud get pods -l app=host-deployer`
```bash
$ kubectl -n onecloud get pods -l app=host-deployer
NAME                          READY   STATUS    RESTARTS   AGE
default-host-deployer-6qtzz   1/1     Running   2          19d
default-host-deployer-78rk9   1/1     Running   0          19d
```

To initialize virtual machine image files, host-deployer currently supports two methods:
- Use nbd module to mount virtual machine disk files on the host (default method before 3.10.8)
- Deploy the image that needs to be deployed inside the virtual machine by running a virtual machine (default method starting from 3.10.8)

qemu-nbd mount disk example:
```bash
$ qemu-nbd -c /dev/nbd1 /disk1_path
$ mount /dev/nbd1p2 /mount_path
# Next, you can perform virtual machine deployment operations on mount_path

# Disconnect
$ umount /mount_path
$ qemu-nbd -d /dev/nbd1
```

Before 3.10.8, nbd method was used to deploy virtual machines. However, this method has some defects:
- In concurrent environments, it may cause resource conflicts, such as lvm uuid and xfs uuid conflicts
- Depends on host kernel supporting virtual machine system's file system, such as high-version xfs, btrfs, etc.
- Depends on host installing qemu-nbd and host kernel containing nbd module, and often encounters nbd device residue problems;
The main reason for nbd device residue problems is that when qemu-nbd disconnects, residual files in the disk file system are opened by the operating system

So in version 3.10.8, support for using lightweight virtual machines to deploy disks was developed.

# Virtual Machine Deployment Introduction

The virtual machine that runs deployment is a customized initramfs, which is a memory system. Except for the disk file to be deployed, there are no other disk devices.
The host-deployer on the host is responsible for the lifecycle management of the deployment virtual machine, and after the deployment virtual machine starts, it controls the virtual machine through ssh to deploy the virtual machine's image file.
initramfs creation reference: https://github.com/yunionio/yunionos
Compared to nbd mounting disks depending on the host environment, updating initramfs is relatively more convenient.


Virtual machine deployment running example:
```bash
$ /usr/libexec/qemu-kvm -smp 2 -m 256M -kernel kernel_path -initrd initrd_path -netdev user,id=hostnet0,hostfwd=tcp::10022-:22 ...
# Virtual machine exposes port 22 to let host host-deployer service control deployment process
```

By default, up to 5 deployment virtual machines can run simultaneously through virtual machine deployment. You can modify the concurrency by modifying /etc/yunion/host.conf:
```bash
# For example, modify concurrency to 10
$ vi /etc/yunion/host.conf
deploy_concurrent: 10
```

Compared to nbd deployment, using virtual machine deployment takes relatively longer. If you need to switch back to nbd deployment, you can modify configmap default-host:
```bash
$ kubectl edit cm -n onecloud default-host
image_deploy_driver: nbd
```


