---
sidebar_position: 12
---

# How to Manually Change RAID Configuration of Bare Metal Servers with Operating System Installed

## Manually Change RAID Configuration of Bare Metal Servers with Operating System Installed

Bare metal management can automatically configure RAID configuration during the operating system installation process, supporting RAID cards such as MegaRaid and HPSmart Array. However, after the operating system is installed, without reinstalling the system, RAID cannot be automatically reconfigured, such as adding disks to RAID or changing RAID levels, etc. At this time, it must be done manually. This article introduces how to manually change the RAID configuration of bare metal servers with operating system installed.

1. Restart the bare metal server into maintenance mode

```bash
climc host-maintenance <host_id>
```

This command will restart the physical machine and boot into the network PXE boot memory operating system

2. After booting into the memory operating system, ssh into the system

```bash
climc host-ssh <host_id>
```

3. Change RAID configuration

RAID tool software is located in the /opt directory of the memory operating system, including control tool software for RAID such as MegaRaid, HPSA, SAS, Marvel, etc.

4. After RAID configuration change is complete, restart to restore the installed operating system

```bash
climc host-unmaintenance <host_id>
```

