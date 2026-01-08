---
sidebar_position: 1
---

# GPU Passthrough

Introduction to how to use GPU passthrough devices on virtual machines.

To use GPUs in KVM virtual machines, you need to use PCI Passthrough to passthrough Nvidia/AMD GPUs on hosts to virtual machines for use.

## Host Settings

In addition to regular PCI/PCIe device passthrough settings, to avoid host Linux kernel's built-in GPU drivers competing with vfio for devices, you need to set the following additional kernel command line parameters:

```bash
rdblacklist=nouveau nouveau.modeset=0
```

At the same time, you need to set the host's /etc/yunion/host.conf's disable_gpu: false (already set by default).


## GPU Related Command Lines

### Create GPU Cloud Host

- Query gpu list

```bash
$ climc isolated-device-list --gpu
+--------------------------------------+----------+---------------------+---------+------------------+--------------------------------------+
|                  ID                  | Dev_type |        Model        |  Addr   | Vendor_device_id |               Host_id                |
+--------------------------------------+----------+---------------------+---------+------------------+--------------------------------------+
| 273f4f72-06b6-49aa-8456-4beceec44997 | GPU-HPC  | GeForce GTX 1050 Ti | 41:00.0 | 10de:1c82        | 3bce9607-2597-469f-8d9b-977345456739 |
| a77333e9-08d9-45c6-87eb-a7d8d902c5f5 | GPU-HPC  | Quadro FX 580       | 05:00.0 | 10de:0659        | 3bce9607-2597-469f-8d9b-977345456739 |
+--------------------------------------+----------+---------------------+---------+------------------+--------------------------------------+
```

- Create server

The `--isolated-device` parameter in server-create specifies passthrough devices to cloud hosts. It can be used multiple times to passthrough multiple gpus to cloud hosts, but gpus passthrough to the same cloud host must be on the same host. Other creation parameters are the same as creating ordinary cloud hosts.

```bash
$ climc server-create --hypervisor kvm --isolated-device 273f4f72-06b6-49aa-8456-4beceec44997 ...
```

### Set GPU Device Type

GPU devices support device types: GPU-HPC, GPU-VGA
- GPU-HPC: High-Performance Computing card, mainly used for scientific computing, data analysis, machine learning and other tasks that require large-scale parallel computing.
- GPU-VGA: Video Graphics Array card, used for graphics rendering and display purposes.

**Considerations**
When GPU-VGA type GPU cards are passthrough to virtual machines for use, simulated VGA devices are no longer provided. Graphics card drivers need to be installed in images in advance.

#### Set GPU Card Type
```
$ climc isolated-device-update
Usage: climc isolated-device-update [--reserved-mem RESERVED_MEM] [--reserved-storage RESERVED_STORAGE] [--dev-type {GPU-HPC,GPU-VGA}] [--help] [--reserved-cpu RESERVED_CPU] <ID> ...
# example: 
$ climc isolated-device-update --dev-type GPU-VGA b46a7374-6da2-46a4-8eda-abd16c502e0b
```

### Query GPU Cloud Host

```bash
$ climc server-list --gpu
```

### Associate GPU

If the host where the cloud host is located has available gpus, when the host is shut down, you can associate gpus with cloud hosts through the `server-attach-isolated-device` command. After the host starts next time, you can use this gpu.

```bash
$ climc server-attach-isolated-device <server_id> <device_id>
```

### Unmount GPU

If a cloud host has gpus associated, you can unmount a certain gpu of the host through `server-detach-isolated-device`.

```bash
$ climc server-detach-isolated-device <server_id> <device_id>
```

