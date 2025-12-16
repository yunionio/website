---
sidebar_position: 2
---

# vGPU

vGPU is a GPU virtualization technology. It can virtualize a single physical GPU into multiple virtual GPU instances for multiple virtual machines to use simultaneously.

Both NVIDIA and AMD provide virtual GPU (vgpu) solutions, but they have some differences in implementation methods.

NVIDIA vGPU Implementation Method:
- NVIDIA vGPU is implemented based on NVIDIA's GRID technology. It uses NVIDIA's physical GPU and divides it into multiple virtual GPUs. Each virtual GPU can be assigned to an independent virtual machine instance.
- NVIDIA vGPU uses proprietary virtual GPU management software (such as NVIDIA Virtual GPU Manager). This software creates and manages virtual GPUs on physical GPUs and assigns them to virtual machines for use.

AMD vGPU Implementation Method:
- AMD vGPU is implemented based on AMD's SR-IOV (Single Root I/O Virtualization) technology. It divides physical GPUs into multiple virtual GPUs through hardware-assisted virtualization technology.

## AMD vGPU Configuration

```bash
# View AMD GPU device PCI configuration space, confirm SR-IOV is enabled
$ lspci -k -s 04:00.0 -v
04:00.0 VGA compatible controller: Advanced Micro Devices, Inc. [AMD/ATI] Tonga XT GL [FirePro S7150] (prog-if 00 [VGA controller])
        Subsystem: Advanced Micro Devices, Inc. [AMD/ATI] Device 030c
        Flags: bus master, fast devsel, latency 0, IRQ 209, NUMA node 0
        Memory at 3bfe0000000 (64-bit, prefetchable) [size=256M]
        Memory at 3bff4000000 (64-bit, prefetchable) [size=2M]
        I/O ports at 2000 [size=256]
        Memory at 95c00000 (32-bit, non-prefetchable) [size=256K]
        Expansion ROM at 95c40000 [disabled] [size=128K]
        Capabilities: [48] Vendor Specific Information: Len=08 <?>
        Capabilities: [50] Power Management version 3
        Capabilities: [58] Express Legacy Endpoint, MSI 00
        Capabilities: [a0] MSI: Enable+ Count=1/4 Maskable+ 64bit+
        Capabilities: [100] Vendor Specific Information: ID=0001 Rev=1 Len=010 <?>
        Capabilities: [150] Advanced Error Reporting
        Capabilities: [200] #15
        Capabilities: [270] #19
        Capabilities: [2b0] Address Translation Service (ATS)
        Capabilities: [2c0] Page Request Interface (PRI)
        Capabilities: [2d0] Process Address Space ID (PASID)
        Capabilities: [328] Alternative Routing-ID Interpretation (ARI)
        Capabilities: [330] Single Root I/O Virtualization (SR-IOV) ### SR-IOV is enabled
        Capabilities: [400] Vendor Specific Information: ID=0002 Rev=1 Len=070 <?>
        Kernel modules: amdgpu
```

AMD vGPU on hosts needs to install GIM driver. Refer to: [https://github.com/GPUOpen-LibrariesAndSDKs/MxGPU-Virtualization#how-to-load](https://github.com/GPUOpen-LibrariesAndSDKs/MxGPU-Virtualization#how-to-load)

```bash
$ git clone https://github.com/GPUOpen-LibrariesAndSDKs/MxGPU-Virtualization.git && cd MxGPU-Virtualization/drv
$ make && make install

# Modify driver to disable amdgpu driver
$ vi /etc/modprobe.d/blacklist.conf
blacklist amdgpu
blacklist amdkfd

# Configure VF quantity
$ cat /etc/gim_config
fb_option=0
sched_option=0
vf_num=2 # vf quantity
pf_fb=0
vf_fb=0
sched_interval=0
sched_interval_us=0
fb_clear=0
$ modprobe gim
```

Modify /etc/yunion/host.conf to configure AMD vGPU.

```bash
$ vi /etc/yunion/host.conf
AMDVgpuPFs:
- 04:00.0 # AMD GPU PCI address
```

Restart host-agent service.

```bash
$ kubectl -n onecloud rollout restart ds default-host
```

## NVIDIA vGPU Configuration

NVIDIA needs to install GRID driver (driver needs enterprise registration on NVIDIA official website to download):

```bash
$ ./NVIDIA-Linux-x86_64-510.85.03-vgpu-kvm.run

# After installation, restart server
# View whether nvidia vgpu driver is loaded
# Kernel needs to support vfio and vfio-mdev
$ lsmod | grep nvidia
nvidia_vgpu_vfio       53248  19
nvidia              39120896  273
mdev                   24576  2 vfio_mdev,nvidia_vgpu_vfio
drm                   491520  4 drm_kms_helper,drm_vram_helper,nvidia,ttm
vfio                   32768  7 vfio_mdev,nvidia_vgpu_vfio,vfio_iommu_type1,vfio_pci

# View nvidia vgpu management service status
$ systemctl status nvidia-vgpu-mgr.service

# Configure vGPU
# cd /sys/class/mdev_bus/domain\:bus\:slot.function/mdev_supported_types, eg:
$ cd /sys/class/mdev_bus/0000:82:00.0/mdev_supported_types && ls
nvidia-156  nvidia-241  nvidia-284  nvidia-286  nvidia-46  nvidia-48  nvidia-50  nvidia-52  nvidia-54  nvidia-56  nvidia-58  nvidia-60  nvidia-62
nvidia-215  nvidia-283  nvidia-285  nvidia-287  nvidia-47  nvidia-49  nvidia-51  nvidia-53  nvidia-55  nvidia-57  nvidia-59  nvidia-61

# These directories represent different vGPU types. View nvidia-46 detailed description
$ ls nvidia-46
available_instances  create               description          device_api           devices/             name
$ cat nvidia-46/description
num_heads=4, frl_config=60, framebuffer=1024M, max_resolution=5120x2880, max_instance=24
$ cat nvidia-46/name
GRID P40-1Q
$ cat nvidia-46/available_instances
22
```

NVIDIA official website description is as follows:

- available_instances
This file contains the number of instances of this vGPU type that can still be created. This file is updated any time a vGPU of this type is created on or removed from the physical GPU.
- create
This file is used for creating a vGPU instance. A vGPU instance is created by writing the UUID of the vGPU to this file. The file is write only.
- description
This file contains the following details of the vGPU type:
The maximum number of virtual display heads that the vGPU type supports
The frame rate limiter (FRL) configuration in frames per second
The frame buffer size in Mbytes
The maximum resolution per display head
The maximum number of vGPU instances per physical GPU
For example:

```bash
$ cat description
num_heads=4, frl_config=60, framebuffer=2048M, max_resolution=4096x2160, max_instance=4
- device_api
This file contains the string vfio_pci to indicate that a vGPU is a PCI device.
- devices
This directory contains all the mdev devices that are created for the vGPU type. For example:
$ ll devices
total 0
lrwxrwxrwx 1 root root 0 Dec  6 01:52 aa618089-8b16-4d01-a136-25a0f3c73123 -> ../../../aa618089-8b16-4d01-a136-25a0f3c73123
- name
This file contains the name of the vGPU type. For example:
$ cat name
GRID M10-2Q
```

You can configure vGPU according to your needs, eg:

```bash
# Generate uuid format string for configuring vGPU id
$ uuidgen
070bcb42-18fc-4971-9aa9-67f5ee1281c3
$ echo 070bcb42-18fc-4971-9aa9-67f5ee1281c3 > nvidia-46/create
# If persistence is needed, need to configure in /etc/rc.local:
echo "echo 070bcb42-18fc-4971-9aa9-67f5ee1281c3 > /sys/class/mdev_bus/0000:82:00.0/mdev_supported_types/nvidia-46/create" >> /etc/rc.local
```

Configure /etc/yunion/host.conf

```bash
nvidia_vgpu_pfs:
- 82:00.0
```

Restart host-agent service

```bash
$ kubectl -n onecloud rollout restart ds default-host
```

### NVIDIA vGPU Virtual Machine Configuration

Install GIRD driver inside virtual machine

```
Disable nouveau driver
$ cat /etc/modprobe.d/blacklist-nouveau.conf
blacklist nouveau
options nouveau modeset=0
$ ./NVIDIA-Linux-x86_64-510.85.02-grid.run
# View nvidia-gridd service status
$ systemctl status nvidia-gridd 
# Configure license server address
$ cp /etc/nvidia/gridd.conf.template /etc/nvidia/gridd.conf
$ vi /etc/nvidia/gridd.conf # Configure as needed
# Description: Set License Server Address
# Data type: string
# Format:  "<address>"
ServerAddress= example.com # license server address

# Description: Set License Server port number
# Data type: integer
# Format:  <port>, default is 7070
ServerPort=7070 # license server port

# Description: Set Feature to be enabled
# Data type: integer
# Possible values:
#    0 => for unlicensed state
#    1 => for NVIDIA vGPU (Optional, autodetected as per vGPU type)
#    2 => for NVIDIA RTX Virtual Workstation
#    4 => for NVIDIA Virtual Compute Server
# All other values reserved
FeatureType=1 # 

$ systemctl restart nvidia-gridd
$ nvidia-smi -q
    vGPU Software Licensed Product
        Product Name                      : NVIDIA RTX Virtual Workstation
        License Status                    : Licensed (Expiry: 2023-8-14 13:47:59 GMT) # license status is licensed
```

## Reference Links

- [https://github.com/GPUOpen-LibrariesAndSDKs/MxGPU-Virtualization#how-to-load](https://github.com/GPUOpen-LibrariesAndSDKs/MxGPU-Virtualization#how-to-load)
- [https://docs.nvidia.com/grid/latest/grid-vgpu-user-guide/index.html#creating-vgpu-device-red-hat-el-kvm](https://docs.nvidia.com/grid/latest/grid-vgpu-user-guide/index.html#creating-vgpu-device-red-hat-el-kvm)
- [https://cloud-atlas.readthedocs.io/zh_CN/latest/kvm/vgpu/vgpu_quickstart.html](https://cloud-atlas.readthedocs.io/zh_CN/latest/kvm/vgpu/vgpu_quickstart.html)

