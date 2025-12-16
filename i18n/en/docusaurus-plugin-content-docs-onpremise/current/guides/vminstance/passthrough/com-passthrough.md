---
sidebar_position: 6
---

# Serial Port COM Passthrough

This article introduces how to passthrough host's serial ports (COM) to virtual machines for use.

## Configure Host

View COM devices on the host. Use command setserial to view:

```bash
# View onboard serial port devices
$ sudo setserial -g /dev/ttyS[0123]
/dev/ttyS0, UART: 16550A, Port: 0x03f8, IRQ: 4
/dev/ttyS1, UART: 16550A, Port: 0x1020, IRQ: 18
/dev/ttyS2, UART: unknown, Port: 0x03e8, IRQ: 4
/dev/ttyS3, UART: unknown, Port: 0x02e8, IRQ: 3
# View USB serial ports
$ sudo setserial -g /dev/ttyUSB[01]
/dev/ttyUSB0, UART: unknown, Port: 0x0000, IRQ: 0
```

Find the serial port device path to be passthrough on the host, for example /dev/ttyUSB0

Add the following command line parameters in QEMU to pass this serial port device to the virtual machine:

```bash
-chardev tty,path=/dev/ttyUSB0,id=hostusbserial
-device pci-serial,chardev=hostusbserial
```

Set the above command line parameters for specified hosts through the following climc command:

```
climc server-add-extra-options <sid> chardev tty,path=/dev/ttyUSB0,id=hostusbserial
climc server-add-extra-options <sid> device pci-serial,chardev=hostusbserial
```

Restart this virtual machine, and view in the virtual machine details page whether the above parameters have been added to command line parameters.

