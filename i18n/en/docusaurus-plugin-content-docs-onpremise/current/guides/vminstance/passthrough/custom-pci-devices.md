---
sidebar_position: 4
---

# Custom PCI Device Passthrough

The platform already supports passthroughing devices of types GPU, USB, SR-IOV NIC, NVME, etc. For devices outside these types, support them through custom PCI device type methods.

Steps to use custom PCI passthrough devices are as follows:
1. Get vendor_id and device_id of this type of PCI device
2. Add custom PCI device type on the platform
3. Probe custom PCI devices mounted on hosts
4. Bind PCI devices with virtual machines on the platform, use this device inside virtual machines


## Get PCI Device vendor_id and device_id

Before adding custom PCI device types, you need to get the device's vendor_id and device_id

```
Log in to the host with this device, execute lspci to find the corresponding pci device address:
eg:
$ lspci
00:00.0 Host bridge: Intel Corporation Xeon E7 v2/Xeon E5 v2/Core i7 DMI2 (rev 04)
00:01.0 PCI bridge: Intel Corporation Xeon E7 v2/Xeon E5 v2/Core i7 PCI Express Root Port 1a (rev 04)
00:02.0 PCI bridge: Intel Corporation Xeon E7 v2/Xeon E5 v2/Core i7 PCI Express Root Port 2a (rev 04)
00:03.0 PCI bridge: Intel Corporation Xeon E7 v2/Xeon E5 v2/Core i7 PCI Express Root Port 3a (rev 04)
00:05.0 System peripheral: Intel Corporation Xeon E7 v2/Xeon E5 v2/Core i7 VTd/Memory Map/Misc (rev 04)
00:05.2 System peripheral: Intel Corporation Xeon E7 v2/Xeon E5 v2/Core i7 IIO RAS (rev 04)
00:05.4 PIC: Intel Corporation Xeon E7 v2/Xeon E5 v2/Core i7 IOAPIC (rev 04)
00:11.0 PCI bridge: Intel Corporation C600/X79 series chipset PCI Express Virtual Root Port (rev 06)
00:16.0 Communication controller: Intel Corporation C600/X79 series chipset MEI Controller #1 (rev 05)
00:19.0 Ethernet controller: Intel Corporation 82579LM Gigabit Network Connection (Lewisville) (rev 06)
00:1a.0 USB controller: Intel Corporation C600/X79 series chipset USB2 Enhanced Host Controller #2 (rev 06)
00:1b.0 Audio device: Intel Corporation C600/X79 series chipset High Definition Audio Controller (rev 06)
00:1c.0 PCI bridge: Intel Corporation C600/X79 series chipset PCI Express Root Port 3 (rev b6)
00:1c.4 PCI bridge: Intel Corporation C600/X79 series chipset PCI Express Root Port 5 (rev b6)
00:1d.0 USB controller: Intel Corporation C600/X79 series chipset USB2 Enhanced Host Controller #1 (rev 06)
00:1e.0 PCI bridge: Intel Corporation 82801 PCI Bridge (rev a6)
00:1f.0 ISA bridge: Intel Corporation C600/X79 series chipset LPC Controller (rev 06)
00:1f.2 RAID bus controller: Intel Corporation C600/X79 series chipset SATA RAID Controller (rev 06)
00:1f.3 SMBus: Intel Corporation C600/X79 series chipset SMBus Host Controller (rev 06)
02:00.0 VGA compatible controller: NVIDIA Corporation GK107GL [Quadro K420] (rev a1)

Get vendor_id and device_id based on pci address:
lspci -n -s <PCI_ADDR>
eg:
lspci -n -s 02:00.0
02:00.0 0300: 10de:0ff3 (rev a1)
10de is vendor_id, 0ff3 is device_id
```

## Add Custom PCI Device Type

Create custom pci device type on cloud platform
```bash
climc isolated-device-model-create
Usage: climc isolated-device-model-create [--help] [--hosts HOSTS] <MODEL> <DEV_TYPE> <VENDOR_ID> <DEVICE_ID>

# --hosts are hosts that need to probe scan PCI devices. If not filled, restart host-agent to take effect. If there are many hosts, it is recommended to directly restart host-agent
# <MODEL> is PCI device model
# <DEV_TYPE> is device type, such as NPU. For already supported device types USB, GPU-HPC, GPU-VGA, NIC, etc., cannot be created again.
# <VENDOR_ID> <DEVICE_ID> are vendor ID and device ID


eg:
climc isolated-device-model-create --hosts host1 Atlas-800 NPU 1a03 2000
```

## Probe Custom PCI Devices

After defining custom PCI device types, you need to probe and report custom PCI devices mounted on specified hosts. Specific methods are:

* Use the following climc command

```bash
$ climc isolated-device-list  --host oc-node-1-192-168-121-21
```

* Access frontend WebUI, specify specified host's details-passthrough device list

* Restart default-host container on this host

After executing any of the above operations, if configuration is correct, you can view reported passthrough devices in this host's passthrough device list

## Use Custom PCI Devices

After adding custom PCI device types is complete, you can select custom device types when creating virtual machines.
```
climc server-create --isolated-device 'Atlas-800' ......
```

View custom PCI device type list
```
climc isolated-device-model-list
```

## Host Disable Custom PCI Devices

Add in /etc/yunion/host.conf

```yaml
disable_custom_device: true
```

