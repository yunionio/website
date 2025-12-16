---
sidebar_position: 11
---

# Debug Virtual Machine Startup Parameters

Introduction to how to debug and modify KVM virtual machine command line parameters.

Private cloud KVM virtual machine configurations are stored in /opt/cloud/workspace/servers on the host.

Under the servers directory, each virtual machine ID's directory stores configuration files related to this virtual machine. Main files are:

```bash
-rw-r--r-- 1 root root 3114 May 17 10:53 desc
-rwx------ 1 root root  344 Jun 22 10:07 if-down-br0-vnet222-252.sh
-rwx------ 1 root root 1074 Jun 22 10:07 if-up-br0-vnet222-252.sh
-rw-r--r-- 1 root root 2810 Jun 22 10:07 startvm
-rw-r--r-- 1 root root  661 Jun 22 10:07 stopvm
```

Among them, startvm is the script file for starting the virtual machine, containing all command line parameters for starting this virtual machine. You can modify qemu startup parameters in this file to achieve the purpose of debugging qemu startup parameters.

General steps are:

1) Stop the virtual machine

2) Modify this virtual machine's startvm script parameters

3) Start the virtual machine as root: sh startvm

4) On the frontend, perform "Sync Status" operation on the virtual machine

5) After syncing status, the frontend displays this virtual machine as running state. You can then view this virtual machine's vnc terminal and perform other control operations

