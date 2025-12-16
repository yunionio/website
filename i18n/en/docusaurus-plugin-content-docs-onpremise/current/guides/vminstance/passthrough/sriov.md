---
sidebar_position: 3
---

# Network Card SR-IOV

Introduction to SR-IOV network card passthrough and OVS Offload hardware offload usage methods.

## SR-IOV Introduction

SR-IOV technology is a hardware-based virtualization solution that can improve performance and scalability. SR-IOV standard allows efficient sharing of PCIe (Peripheral Component Interconnect Express) devices between virtual machines, and it is implemented in hardware, achieving I/O performance comparable to native performance. SR-IOV specification defines new standards. According to this standard, newly created devices allow direct connection of virtual machines to I/O devices.

SR-IOV specification is defined and maintained by PCI-SIG on [http://www.pcisig.com](http://www.pcisig.com).

Two new function types in SR-IOV are:

- Physical Function (PF)
PCI function used to support SR-IOV functionality, as defined in SR-IOV specification. PF contains SR-IOV capability structure, used to manage SR-IOV functionality. PF is a fully functional PCIe function, can be discovered, managed and processed like any other PCIe device. PF has complete configuration resources, can be used to configure or control PCIe devices.

- Virtual Function (VF)
A function associated with physical function. VF is a lightweight PCIe function that can share one or more physical resources with physical function and other VFs associated with the same physical function. VF only allows having configuration resources for its own behavior.


### Host Enable SR-IOV

In addition to regular PCI/PCIe device passthrough settings, you also need to ensure SR-IOV is enabled in host BIOS, and need to perform necessary kernel settings for device VFs. Specific methods are as follows:

1. Enable device SR-IOV functionality in BIOS (according to machine model and device model, specific operation methods may also be different, refer to actual machine configuration).

2. Enable Virtual Functions on host nodes

```bash
# For different network card models, the enabling method is also different. The following uses Intel I350 network card as an example, set 7 Virtual Functions (the number of virtual functions supported by network cards is also different, need to configure according to specific network card supported quantity)
# Add igb.max_vfs=7 in grub cmdline
GRUB_CMDLINE_LINUX="...... igb.max_vfs=7"
# Regenerate grub boot configuration file
$ grub2-mkconfig -o /boot/grub2/grub.cfg
```

#### Mellanox Network Card Configuration

Mellanox network cards need to install MLNX_OFED drivers. Refer to their official documentation:

- [https://enterprise-support.nvidia.com/s/article/howto-install-mlnx-ofed-driver](https://enterprise-support.nvidia.com/s/article/howto-install-mlnx-ofed-driver)
- [https://docs.nvidia.com/networking/display/MLNXOFEDv461000/Installing+Mellanox+OFED](https://docs.nvidia.com/networking/display/MLNXOFEDv461000/Installing+Mellanox+OFED)
- [https://network.nvidia.com/products/infiniband-drivers/linux/mlnx_ofed/](https://network.nvidia.com/products/infiniband-drivers/linux/mlnx_ofed/)

```bash
# Note to use high version gcc
$ yum install centos-release-scl
$ yum install -y devtoolset-9
$ scl enable devtoolset-9 bash
# Download iso corresponding to operating system version, note to distinguish centos7.x
# Can download on nvidia provided driver website: https://network.nvidia.com/products/infiniband-drivers/linux/mlnx_ofed/
$ wget https://content.mellanox.com/ofed/MLNX_OFED-5.8-1.1.2.1/MLNX_OFED_LINUX-5.8-1.1.2.1-rhel7.9-x86_64.iso
$ mount -o loop MLNX_OFED_LINUX-5.8-1.1.2.1-rhel7.9-x86_64.iso /mnt
$ cd /mnt
# Wait for compilation
$ ./mlnxofedinstall --add-kernel-support
Restart needed for updates to take effect.
Log File: /tmp/ZXf5cnZzxo
Real log file: /tmp/MLNX_OFED_LINUX.62574.logs/fw_update.log
You may need to update your initramfs before next boot. To do that, run:
 
   dracut -f
To load the new driver, run:
/etc/init.d/openibd restart
 
$ dracut -f
$ /etc/init.d/openibd restart

$ mst start
# Configure SRIOV VF quantity, restart to take effect, view specific device name through mst status -v
$ mlxconfig -d /dev/mst/mt4119_pciconf0 set SRIOV_EN=1 NUM_OF_VFS=64

# Notes for mlnx infiniband network cards after enabling sriov!!
# IB network cards after enabling sriov may cause ip command to report the following error:
Error: Buffer too small for object.
Dump terminated
Need to use ip command in mlnx's iproute package to replace host's original ip command. This package is in ofed driver, such as:
- /mnt/DEBS/mlnx-iproute2_6.4.0-1.2310055_amd64.deb # debian link
- /mnt/RPMS/mlnx-iproute2-5.19.0-1.58203.x86_64.rpm # centos

# Configure VF network card name udev rules. If not configured, will follow system default new network card naming rules
cp /usr/share/doc/mlnx-ofa_kernel-5.8/vf-net-link-name.sh /etc/infiniband/
# If files conflict, need to merge as needed
cp /usr/share/doc/mlnx-ofa_kernel-5.8/82-net-setup-link.rules /etc/udev/rules.d/

# Restart virtual machine
$ reboot
```

5. After setting, restart the host, view /proc/cmdline to confirm configuration takes effect.

### host-agent Enable SR-IOV
Log in to the corresponding host node
```bash
# SR-IOV is not enabled by default, need to modify host-agent configuration
# Configure SR-IOV corresponding network eg:
$ vi /etc/yunion/host.conf
networks:
- eth1/br0/192.168.100.111
- eth2/br1/bcast1
# networks contains two configuration methods. The first parameter is physical network card name, the second parameter is bridge name,
# The third parameter has two types, one is ip address, the other is wire. For network cards that don't want to configure ip addresses, you can use wire attribute. wire represents the layer 2 network where this network card is located.

sriov_nics:
- eth1 # Specify as the wire where 192.168.100.111 is located
- eth2 # Specify as bcast1
- eth3 # Not configured in networks, will default to use the first network card's wire. infiniband network cards should use this configuration method
# Enable sriov for eth2 network card
```

After modification is complete, restart host-agent service: `kubectl rollout restart ds default-host`. After restart is complete, wait for host-agent service to start successfully. You can use climc on the control node to view configured VF network cards.

e.g.:

```bash
# For example, I350 Ethernet Controller Virtual Function is the VF network card we configured this time.
$ climc isolated-device-list
+--------------------------------------+----------+-------------------------------------------+---------+------------------+--------------------------------------+--------------------------------------+
|                  ID                  | Dev_type |                   Model                   |  Addr   | Vendor_device_id |               Host_id                |               Guest_id               |
+--------------------------------------+----------+-------------------------------------------+---------+------------------+--------------------------------------+--------------------------------------+
| 37b2fe7b-f202-428e-8c34-35ccdac82852 | NIC      | ConnectX-5 Virtual Function               | 0a:01.1 | 15b3:1018        | c48b1b8b-28a3-453a-863f-ddf7c62bcfe2 |                                      |
| 9a0f2b3a-b372-4e37-840f-60427d026479 | NIC      | ConnectX-5 Virtual Function               | 0a:01.0 | 15b3:1018        | c48b1b8b-28a3-453a-863f-ddf7c62bcfe2 |                                      |
| 37b54017-4da3-44a6-8ffe-056ffc9e853b | NIC      | ConnectX-5 Virtual Function               | 0a:00.7 | 15b3:1018        | c48b1b8b-28a3-453a-863f-ddf7c62bcfe2 |                                      |
| 74558948-f5e9-453b-86d6-89c6bc00c710 | NIC      | ConnectX-5 Virtual Function               | 0a:00.6 | 15b3:1018        | c48b1b8b-28a3-453a-863f-ddf7c62bcfe2 |                                      |
| 75df24b3-c27a-49bb-8cf7-385c9f0d2385 | NIC      | ConnectX-5 Virtual Function               | 0a:00.5 | 15b3:1018        | c48b1b8b-28a3-453a-863f-ddf7c62bcfe2 |                                      |
| 17841618-c3e7-43f6-805a-23d2adbcd70c | NIC      | ConnectX-5 Virtual Function               | 0a:00.4 | 15b3:1018        | c48b1b8b-28a3-453a-863f-ddf7c62bcfe2 |                                      |
| 51627e5a-22af-40ee-8af5-dc1971bf89c9 | NIC      | ConnectX-5 Virtual Function               | 0a:00.3 | 15b3:1018        | c48b1b8b-28a3-453a-863f-ddf7c62bcfe2 |                                      |
| f794eba5-fbe7-4bcd-880a-4082523f5c94 | NIC      | ConnectX-5 Virtual Function               | 0a:00.2 | 15b3:1018        | c48b1b8b-28a3-453a-863f-ddf7c62bcfe2 |                                      |
| 10266e05-8d34-4594-81ca-64afbd365ee7 | NIC      | I350 Ethernet Controller Virtual Function | 03:13.0 | 8086:1520        | c48b1b8b-28a3-453a-863f-ddf7c62bcfe2 |                                      |
| a837b5ca-d3ee-4cd8-8de5-447b3ab274d0 | NIC      | I350 Ethernet Controller Virtual Function | 03:12.4 | 8086:1520        | c48b1b8b-28a3-453a-863f-ddf7c62bcfe2 |                                      |
| fab303c9-5dbb-4b85-8df9-fada299622f4 | NIC      | I350 Ethernet Controller Virtual Function | 03:12.0 | 8086:1520        | c48b1b8b-28a3-453a-863f-ddf7c62bcfe2 |                                      |
| f2cb8fd5-aa26-46a7-8dc2-2eca2b77a887 | NIC      | I350 Ethernet Controller Virtual Function | 03:11.4 | 8086:1520        | c48b1b8b-28a3-453a-863f-ddf7c62bcfe2 |                                      |
| b2933d5c-9a3a-45ff-8c80-15ac3291ae7661 | NIC      | I350 Ethernet Controller Virtual Function | 03:11.0 | 8086:1520        | c48b1b8b-28a3-453a-863f-ddf7c62bcfe2 |                                      |
| b22e6511-c70b-440c-8c05-6d1041ae7661 | NIC      | I350 Ethernet Controller Virtual Function | 03:10.4 | 8086:1520        | c48b1b8b-28a3-453a-863f-ddf7c62bcfe2 |                                      |
| f523f12a-82bf-45a3-80cf-94d5a9649665 | NIC      | I350 Ethernet Controller Virtual Function | 03:10.0 | 8086:1520        | c48b1b8b-28a3-453a-863f-ddf7c62bcfe2 |                                      |
+--------------------------------------+----------+-------------------------------------------+---------+------------------+--------------------------------------+--------------------------------------+
***  Total: 24 Pages: 2 Limit: 15 Offset: 0 Page: 1  ***

# Use VF network card to create virtual machine. netdesc can specify sriov-nic-model or specify sriov-nic-id
$ climc server-create --disk ae0de3e9-dd45-458e-83b2-4dbc48d70234 \
                      --net 'sriov-nic-model=I350 Ethernet Controller Virtual Function' \
                      --ncpu 2 --mem-spec 4G wyq-test-sriov-nic --auto-start

# Mount VF network card
$ climc server-attach-network c15a5a99-75ea-4b8c-8c7a-521e5f980db4 \
                              'sriov-nic-model=I350 Ethernet Controller Virtual Function:8056e77e-dc14-44b5-8ef9-e43aff344c0d'

```


## OVS Offload

OVS Offload is a technology for OpenvSwitch data forwarding hardware offload implemented by some vendors based on SR-IOV. If hardware supports OVS Offload, it can offload OVS data plane to network cards. OVS control plane does not need to make any changes.

OVS Offload's basic configuration depends on SR-IOV configuration. Ensure the host has already enabled SR-IOV. Then you need to install dependencies necessary for enabling OVS Offload, such as Mellanox network cards need to install MLNX_OFED drivers.

Currently, Mellanox's Connect-6 series network cards support OVS Offload.

### Install OFED Driver, Configure SRIOV VF
```
# Note to use high version gcc
$ yum install centos-release-scl
$ yum install -y devtoolset-9
$ scl enable devtoolset-9 bash
# Download iso corresponding to operating system version, note to distinguish centos7.x
# Can download on nvidia provided driver website: https://network.nvidia.com/products/infiniband-drivers/linux/mlnx_ofed/
$ wget https://content.mellanox.com/ofed/MLNX_OFED-5.8-1.1.2.1/MLNX_OFED_LINUX-5.8-1.1.2.1-rhel7.9-x86_64.iso
$ mount -o loop MLNX_OFED_LINUX-5.8-1.1.2.1-rhel7.9-x86_64.iso /mnt
$ cd /mnt
# Wait for compilation
$ ./mlnxofedinstall --add-kernel-support
Restart needed for updates to take effect.
Log File: /tmp/ZXf5cnZzxo
Real log file: /tmp/MLNX_OFED_LINUX.62574.logs/fw_update.log
You may need to update your initramfs before next boot. To do that, run:
 
   dracut -f
To load the new driver, run:
/etc/init.d/openibd restart
 
$ dracut -f
$ /etc/init.d/openibd restart

$ mst start
# Configure SRIOV VF quantity, restart to take effect, view specific device name through mst status -v
$ mlxconfig -d /dev/mst/mt4119_pciconf0 set SRIOV_EN=1 NUM_OF_VFS=64
$ reboot
```
Mellanox network card MLNX_OFED driver installation reference:
- [https://enterprise-support.nvidia.com/s/article/howto-install-mlnx-ofed-driver](https://enterprise-support.nvidia.com/s/article/howto-install-mlnx-ofed-driver)
- [https://docs.nvidia.com/networking/display/MLNXOFEDv461000/Installing+Mellanox+OFED](https://docs.nvidia.com/networking/display/MLNXOFEDv461000/Installing+Mellanox+OFED)
- [https://network.nvidia.com/products/infiniband-drivers/linux/mlnx_ofed/](https://network.nvidia.com/products/infiniband-drivers/linux/mlnx_ofed/)

Mellanox configuration reference documentation:

[https://docs.nvidia.com/networking/display/MLNXOFEDv471001/OVS+Offload+Using+ASAP2+Direct#OVSOffloadUsingASAP2Direct-Overview](https://docs.nvidia.com/networking/display/MLNXOFEDv471001/OVS+Offload+Using+ASAP2+Direct#OVSOffloadUsingASAP2Direct-Overview)

### host-agent Enable SR-IOV

After installing OFED driver, configure the platform to enable offload network cards

#### Mellanox CX6 and Below (CX5/CX4) Disable Security Groups

Mellanox CX6 and below ovs offload has poor support for connection tracking, so security groups need to be disabled:

```bash
$ kubectl -n onecloud edit cm default-host
disable_security_group: true # Change to true
```

### Configure host.conf

Log in to the corresponding host node

```bash
# SR-IOV is not enabled by default, need to modify host-agent configuration
# Configure SR-IOV corresponding network eg:
$ vi /etc/yunion/host.conf
networks:
- eth1/br0/192.168.100.111
- eth2/br1/bcast0
# networks contains two configuration methods. The first parameter is physical network card name, the second parameter is bridge name,
# The third parameter has two types, one is ip address, the other is wire. For network cards that don't want to configure ip addresses, you can use wire attribute. wire represents the layer 2 network where this network card is located.
ovs_offload_nics:
- eth2
# Enable ovs offload for eth2 network card
```

After modification is complete, restart host-agent service: `kubectl rollout restart ds default-host`. Usage is consistent with SR-IOV.

### Offload Network Card Configure Bond

Mellanox network cards support bond modes:
- Active-Backup (mode 1)
- XOR           (mode 2)
- LACP          (mode 4)

In offload mode, packets from two PFs can be forwarded to any VF, and traffic from VFs can be forwarded to two ports according to bond status.
This means that in Active-Backup mode, as long as one PF is active, traffic from any VF can be sent through this PF.
In XOR or LACP mode, if both PFs are active, traffic from VFs will be distributed between these two PFs.

For specific Bond configuration methods, please refer to other documentation.

After network card bond is configured, modify host.conf configuration file:
```bash
$ vi /etc/yunion/host.conf
networks:
- bond0/br1/bcast0 # bond0 is bond port name
......
ovs_offload_nics:
- bond0
```

## Virtual Machine Configuration

After SR-IOV is passthrough to virtual machines, it appears as physical network cards of the same model to virtual machines. For Mellanox network cards, it is also recommended to install official OFED drivers.

```
$ wget https://content.mellanox.com/ofed/MLNX_OFED-5.8-1.1.2.1/MLNX_OFED_LINUX-5.8-1.1.2.1-rhel7.9-x86_64.iso
$ mount -o loop MLNX_OFED_LINUX-5.8-1.1.2.1-rhel7.9-x86_64.iso /mnt
$ cd /mnt
$ ./mlnxofedinstall
$ dracut -f
$ /etc/init.d/openibd restart
$ reboot
```

## Common Questions

#### How to Verify a PCI Device Supports SR-IOV?

Execute the following command to view whether the device's capabilities contain SR-IOV:

```bash
# lspci -v -s 01:00.0
01:00.0 Ethernet controller: Mellanox Technologies MT2894 Family [ConnectX-6 Lx]
	Subsystem: Mellanox Technologies Device 0001
	Physical Slot: 4
	Flags: bus master, fast devsel, latency 0, IRQ 60, NUMA node 0
	Memory at ea000000 (64-bit, prefetchable) [size=32M]
	Expansion ROM at f0300000 [disabled] [size=1M]
	Capabilities: [60] Express Endpoint, MSI 00
	Capabilities: [48] Vital Product Data
	Capabilities: [9c] MSI-X: Enable+ Count=64 Masked-
	Capabilities: [c0] Vendor Specific Information: Len=18 <?>
	Capabilities: [40] Power Management version 3
	Capabilities: [100] Advanced Error Reporting
	Capabilities: [150] Alternative Routing-ID Interpretation (ARI)
	Capabilities: [180] Single Root I/O Virtualization (SR-IOV)
	Capabilities: [1c0] #19
	Capabilities: [230] Access Control Services
	Capabilities: [320] #27
	Capabilities: [370] #26
	Capabilities: [420] #25
	Kernel driver in use: mlx5_core
	Kernel modules: mlx5_core
```

#### How to Verify OVS Offload Takes Effect

First, confirm that OpenvSwitch has enabled hardware offload feature on the control plane:

```bash
$ ovs-vsctl list Open_vSwitch . | grep other_config
## Output content needs to contain hw-offload="true"
other_config        : {hw-offload="true"}
````

Second, execute `ovs-appctl dpctl/dump-flows type=offloaded` to view flow tables offloaded to hardware forwarding table. If hardware offload does not take effect, output will be empty.


## Network Card SR-IOV Common Questions:

If after configuring according to the above and restarting the host, SR-IOV network cards are not reported normally, you need to view host-agent logs and host dmesg for further troubleshooting.
The following are some common issues encountered:

1. Check whether host IOMMU is enabled
```
$ cat /proc/cmdline
Check if it contains the following options
intel_iommu=on iommu=pt

Run to see if there is output. If iommu is enabled, there should be output
$ dmesg | grep -e DMAR -e IOMMU -e AMD-Vi
```


2. dmesg: not enough MMIO resources for SR-IOV
```
$ Add pci=realloc to /etc/default/grub cmdline

$ grub2-mkconfig -o /boot/grub2/grub.cfg
$ Restart
```

3. dmesg: ENABLE_HCA(0x104) timeout
Find these words in BIOS boot system "ACS", "PCIe Ari Support" and "Iommu" and enable them.




