---
sidebar_position: 3.1
---

# Physical Machine Related Operations

## View Physical Machine List Information

### Query Physical Machine

```bash
# list baremetal records
climc host-list --baremetal true

# list physical machines that have installed system
climc host-list --baremetal true --occupied

# list physical machines without installed system
climc host-list --baremetal true --empty

# Query physical machine details, including hardware information, data center information
climc host-show <host_id>
```

### Get Physical Machine Login Information

```bash
climc host-logininfo <host_id>
```

## Remote Terminal

Connect to physical machine through remote terminal. This function supports using SOL (Serial over LAN) and ssh to remotely connect to physical machine. SOL means remote connection through serial port. After connection, you need to use the username and password in the initial account column to log in.

:::tip
- If the user has enabled MFA, opening the remote terminal requires MFA verification first.
:::

### Frontend Interface Operations

1. In the left navigation bar, select **_"Host/Basic Resources/Physical Machine"_** menu item to enter the physical machine page.
2. Click the **_"Remote Terminal"_** button in the physical machine's right operation column, select the dropdown menu **_"SOL Remote Terminal"_** menu item to remotely connect to the physical machine through SOL.
3. Click the **_"Remote Terminal"_** button in the physical machine's right operation column, select the dropdown menu **_"SSH IP Address"_** menu item to establish a web SSH connection with the physical machine.
4. If port 22 on the physical machine is occupied by other applications and the ssh service port is another port, you can select the dropdown menu **_"SSH IP Address: Custom Port"_** menu item, set the port number in the popup dialog box, and click the **_"OK"_** button to establish a web SSH connection with the physical machine.
5. Click the **_"Remote Terminal"_** button in the physical machine's right operation column, select the dropdown menu **_"Java Console"_** menu item to download and open the jnlp file to connect to the physical machine.

## Enable/Disable

Enable or disable physical machines. Enabled physical machines are used to create bare metal servers.

### Enable

```bash
# Enable physical machine
$ climc host-enable --baremetal true <id>
```

### Disable

This function is used to disable physical machines in "enabled" status. Disabled physical machines cannot create bare metal servers.

```bash
# Disable physical machine
climc host-disable --baremetal true <id>
```

## Power On/Off

### Power On

This function is used to power on physical machines in powered-off status.

```bash
climc host-start <host_id>
```

### Power Off

This function is used to power off physical machines in running status. When physical machines have been allocated to bare metal use, power off operation is not supported.

```bash
climc host-stop <host_id>
```

## Enter/Exit Maintenance Mode

Enter/exit maintenance mode for physical machines. In maintenance mode, you can change partitions, redo RAID, change passwords, and other operations.

### Enter Maintenance Mode

This function is used to make physical machines that have been allocated bare metal equipment enter the offline system (PXE boot system). Administrators can perform operations such as changing partitions, redoing RAID, changing passwords, etc. in the offline system. Unallocated physical machines are in the offline system by default.

```bash
climc host-maintenance <host_id>
```

### Exit Maintenance Mode

This function is used to exit maintenance mode.

```bash
climc host-unmaintenance <host_id>
```

## Delete Physical Machine


This function is used to delete physical machines. Only physical machines that are not allocated to bare metal equipment and are in disabled status can be deleted.

```bash
climc host-delete <host_id>
```

