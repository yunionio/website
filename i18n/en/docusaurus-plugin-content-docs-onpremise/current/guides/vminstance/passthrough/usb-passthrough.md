---
sidebar_position: 5
---

# USB Passthrough

  Introduction to how to passthrough host's USB devices to virtual machines for use.

:::tip
Currently only virtual machines on built-in private cloud platforms can use USB devices on hosts. Prerequisite is that hosts need to have the `lsusb` tool. If not, please install the `usbutils` package.
:::

## Configure Host

View USB devices on the host. Command is as follows:

```bash
$ lsusb
Bus 002 Device 002: ID 0951:1666 Kingston Technology DataTraveler 100 G3/G4/SE9 G2/50
Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
Bus 001 Device 002: ID 0627:0001 Adomax Technology Co., Ltd
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
```

By default, host USB device passthrough functionality is disabled. You need to set `disable_usb: false` in the `/etc/yunion/host.conf` configuration file.

```bash
$ vim /etc/yunion/host.conf
...
disable_usb: false
...
```

Assume host hostname is `oc-node-1`, then restart the host service. Log in to the control node and execute the following command:

```bash
# First find the corresponding host service
$ kubectl get pods -n onecloud -o wide | grep host | grep oc-node-1 | egrep -v 'deployer|image'
default-host-59k76                                  3/3     Running   7          3d22h   192.168.121.21   oc-node-1   <none>           <none>

# Delete pod on host, wait for recreation
$ kubectl delete pods -n onecloud default-host-59k76
pod "default-host-59k76" deleted

# View newly created host service
$ kubectl get pods -n onecloud -o wide | grep host | grep oc-node-1 | egrep -v 'deployer|image'
default-host-6cl8w                                  3/3     Running   0          17s     192.168.121.21   oc-node-1   <none>           <none>
# Ensure this service becomes Running, then go to cloud platform to view passthrough USB devices
```

If there are many hosts, you can also use the `kubectl -n rollout restart daemonset default-host` command to restart host services on all hosts.

## View USB Passthrough Devices

### climc Command Line View Passthrough Devices

Use command line `climc isolated-device-list --details` to view devices:

```bash
$ climc isolated-device-list --details
+--------------------------------------+----------+------------------------------------------------------+---------+------------------+--------------------------------------+--------------------------+----------+-------+--------------+
|                  ID                  | Dev_type |                        Model                         |  Addr   | Vendor_device_id |               Host_id                |           Host           | Guest_id | Guest | Guest_status |
+--------------------------------------+----------+------------------------------------------------------+---------+------------------+--------------------------------------+--------------------------+----------+-------+--------------+
| 1541047f-0203-488a-8226-2de740da061f | USB      | Adomax Technology Co., Ltd                           | 001:002 | 0627:0001        | 7a11731f-dcc0-41e5-8d64-68eb36defcbe | oc-node-1-192-168-121-21 |          |       |              |
| a3fa9bd4-236c-4c5b-8056-f7afa807138d | USB      | Kingston Technology DataTraveler 100 G3/G4/SE9 G2/50 | 002:002 | 0951:1666        | 7a11731f-dcc0-41e5-8d64-68eb36defcbe | oc-node-1-192-168-121-21 |          |       |              |
+--------------------------------------+----------+------------------------------------------------------+---------+------------------+--------------------------------------+--------------------------+----------+-------+--------------+
***  Total: 2 Pages: 1 Limit: 20 Offset: 0 Page: 1  ***
```

### Web Interface View Passthrough Devices

1. On the passthrough device page, you can view USB passthrough devices on hosts.

Now the cloud platform has USB passthrough devices on host oc-node-1. Next, you can give these devices to virtual machines for use.

## Virtual Machine Mount USB

USB can be mounted while virtual machines are running. You can mount USB to virtual machines in the frontend passthrough device list. One virtual machine can associate multiple USB passthrough devices. However, one USB passthrough device can only be used by one virtual machine.

### Web Interface Mount USB

**Mount USB Passthrough Device on Virtual Machine Page**

1. In the left navigation bar, select the **_"Host/Host/Virtual Machine"_** menu item to enter the virtual machine page.
2. Click the **_"More"_** button in the operation column on the right side of the virtual machine, select the **_"Instance Settings-Set USB Passthrough"_** menu item from the dropdown menu to pop up the set USB passthrough dialog.
2. Configure the following parameters:
    - Whether to bind: Select bind USB passthrough device.
    - USB device: When binding USB passthrough device is enabled, this item is displayed, and select specific passthrough device.
    - Auto start: Whether virtual machine auto starts after USB device mounting is successful. Only effective when virtual machine is in shutdown state.
3. Click the **_"OK"_** button to mount or unmount USB passthrough device.


**Associate Virtual Machine on Passthrough Device Page**

1. On the passthrough device page, click the **_"Associate Virtual Machine"_** button in the operation column on the right side of USB type passthrough device to pop up the associate virtual machine dialog.
2. Configure the following parameters:
    - Select virtual machine: Select virtual machine that needs to associate passthrough device.
    - Auto start: Whether virtual machine auto starts after USB device mounting is successful. Only effective when virtual machine is in shutdown state.
3. Click the **_"OK"_** button to associate virtual machine for USB passthrough device.

### Climc Command Line Mount USB Device

Corresponding command line operation is as follows `climc server-attach-isolated-device $server_id $device_id`:

```bash
# For example, virtual machine name is testvm, passthrough device id is a3fa9bd4-236c-4c5b-8056-f7afa807138d
$ climc server-attach-isolated-device testvm a3fa9bd4-236c-4c5b-8056-f7afa807138d

# Then log in to testvm virtual machine, execute lsusb to see host's USB device
[root@testvm ~]# lsusb
Bus 002 Device 002: ID 0951:1666 Kingston Technology DataTraveler 100 G3/G4/SE9 G2/50
```

## Virtual Machine Unmount USB

USB can be unmounted while virtual machines are running. You can unmount USB corresponding virtual machine in the frontend passthrough device list.

### Web Interface Unmount USB

**Unmount USB Passthrough Device on Virtual Machine Page**

1. In the left navigation bar, select the **_"Host/Host/Virtual Machine"_** menu item to enter the virtual machine page.
2. Click the **_"More"_** button in the operation column on the right side of the virtual machine, select the **_"Instance Settings-Set USB Passthrough"_** menu item from the dropdown menu to pop up the set USB passthrough dialog.
2. Configure the following parameters:
    - Whether to bind: Turn off bind USB passthrough device.
    - Auto start: Whether virtual machine auto starts after USB device mounting is successful. Only effective when virtual machine is in shutdown state.
3. Click the **_"OK"_** button to mount or unmount USB passthrough device.


**Cancel Associate Virtual Machine on Passthrough Device Page**

1. On the passthrough device page, click the **_"Cancel Associate Virtual Machine"_** button in the operation column on the right side of USB type passthrough device to pop up the associate virtual machine dialog.
2. Configure the following parameters:
    - Auto start: Whether virtual machine auto starts after USB device unmounting is successful. Only effective when virtual machine is in shutdown state.
3. Click the **_"OK"_** button. USB passthrough device cancels associate virtual machine.


### Climc Command Unmount USB

Corresponding command line operation is as follows `climc server-detach-isolated-device $server_id $device_id`:

```bash
# For example, virtual machine name is testvm, passthrough device id is a3fa9bd4-236c-4c5b-8056-f7afa807138d
$ climc server-detach-isolated-device testvm a3fa9bd4-236c-4c5b-8056-f7afa807138d
```

## Host Refresh Devices

Some situations will frequently plug and unplug USB devices on hosts, which will cause USB device information recorded by the cloud platform to be inconsistent with actual device information on hosts. You can use the following command `climc host-probe-isolated-devices $host_id` to synchronize device information:

```bash
# Assume host name is oc-node-1-192-168-121-21, view current device list
$ lsusb
Bus 002 Device 002: ID 0951:1666 Kingston Technology DataTraveler 100 G3/G4/SE9 G2/50
Bus 001 Device 002: ID 0627:0001 Adomax Technology Co., Ltd

# Cloud platform's device list is consistent
$ climc isolated-device-list  --host oc-node-1-192-168-121-21
+--------------------------------------+----------+------------------------------------------------------+---------+------------------+--------------------------------------+
|                  ID                  | Dev_type |                        Model                         |  Addr   | Vendor_device_id |               Host_id                |
+--------------------------------------+----------+------------------------------------------------------+---------+------------------+--------------------------------------+
| 1541047f-0203-488a-8226-2de740da061f | USB      | Adomax Technology Co., Ltd                           | 001:002 | 0627:0001        | 7a11731f-dcc0-41e5-8d64-68eb36defcbe |
| a3fa9bd4-236c-4c5b-8056-f7afa807138d | USB      | Kingston Technology DataTraveler 100 G3/G4/SE9 G2/50 | 002:002 | 0951:1666        | 7a11731f-dcc0-41e5-8d64-68eb36defcbe |
+--------------------------------------+----------+------------------------------------------------------+---------+------------------+--------------------------------------+
***  Total: 2 Pages: 1 Limit: 20 Offset: 0 Page: 1  ***

# From above, see there are two USB device lists. Then I unplug the Kingston U disk
$ lsusb
Bus 001 Device 002: ID 0627:0001 Adomax Technology Co., Ltd

# Execute command to synchronize current host device information
$ climc host-probe-isolated-devices oc-node-1-192-168-121-21

# View device list again, now there is only one. Kingston U disk record has been deleted
$ climc isolated-device-list  --host oc-node-1-192-168-121-21
+--------------------------------------+----------+----------------------------+---------+------------------+--------------------------------------+
|                  ID                  | Dev_type |           Model            |  Addr   | Vendor_device_id |               Host_id                |
+--------------------------------------+----------+----------------------------+---------+------------------+--------------------------------------+
| fa3cdbbd-7c54-4d2a-87cd-9362aa590a7d | USB      | Adomax Technology Co., Ltd | 001:002 | 0627:0001        | 7a11731f-dcc0-41e5-8d64-68eb36defcbe |
+--------------------------------------+----------+----------------------------+---------+------------------+--------------------------------------+
***  Total: 1 Pages: 1 Limit: 20 Offset: 0 Page: 1  ***
```

### WebUI Dynamic Refresh USB Devices

For user convenience, WebUI will automatically refresh passthrough USB device lists for specified hosts in the following scenarios:

1. Access Host-Details-Passthrough Devices, will automatically refresh passthrough devices for specified hosts
2. Access Virtual Machine-Set USB Passthrough

## Specify USB Controller

By default, qemu-xhci USB controller is used. This controller supports USB 3.0 version, downward compatible with 2.0. For older operating systems, such as Windows Server 2008 R2, USB 3.0 controllers are not recognized. At this time, you need to change to USB 2.0 controller usb-ehci. You can change USB controllers used by virtual machines through the following climc command line:

```bash
climc server-set-qemu-params <sid> --usb-controller-type <usb-ehci|qemu-xhci>
```

After changing, please restart the virtual machine.

