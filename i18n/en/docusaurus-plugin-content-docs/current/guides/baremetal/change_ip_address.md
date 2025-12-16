---
sidebar_position: 6
---

# Change Physical Machine IP

Introduction to how to change the IPMI, PXE, and installed operating system IP addresses of physical machines in the platform.

Physical machines in the cloud platform are allocated 2 IP addresses, one assigned to the BMC IPMI address, and another is the address when the physical machine PXE boots. If the physical machine has an operating system installed, a bare metal record will be generated in the platform, and the bare metal record will also be allocated an IP address. When the physical machine installs the operating system, in the default case where no IP address is specified, the bare metal allocated IP address will preferentially reuse the PXE IP address on the corresponding physical machine.

Normally, these IP addresses are recorded and managed by the cloud platform and do not need to be manually changed. But sometimes when encountering physical network changes, you may manually change the IPMI or operating system IP address. After manually changing the corresponding IP address, you need to update the corresponding IP address in the cloud platform.

:::warning
If you manually change the physical machine's IP address, but the corresponding information in the cloud platform is not synchronized and updated, IP address conflicts may occur when managing other physical machines.
:::

## Change Physical Machine IP

For physical machines without an operating system installed, you can change the IPMI and PXE IP addresses.

### Change IPMI IP

Assuming you want to change the IPMI address of physical machine named bm1 to 10.0.2.2

```bash
# First use host-list to find the corresponding physical machine
# You can see bm1's status field is running
$ climc host-list --search bm1
+--------------------------------------+------+-------------------+--------------+---------+---------+-------------+----------+-----------+------------+---------------+--------------+-----------+--------------+-----------+--------------+
|                  ID                  | Name |    Access_mac     |  Access_ip   | Status  | enabled | host_status | mem_size | cpu_count | node_count |      sn       | storage_type | host_type | storage_size | domain_id | public_scope |
+--------------------------------------+------+-------------------+--------------+---------+---------+-------------+----------+-----------+------------+---------------+--------------+-----------+--------------+-----------+--------------+
| 610a7133-a2f6-4e52-8b12-2067296863a4 | bm1  | 52:54:00:12:34:56 | 10.168.26.70 | running | true    | offline     | 4096     | 1         | 1          | Not Specified | hybrid       | baremetal | 215040       | default   | system       |
+--------------------------------------+------+-------------------+--------------+---------+---------+-------------+----------+-----------+------------+---------------+--------------+-----------+--------------+-----------+--------------+

# View IP addresses corresponding to network cards on bm1
# You can see the network card of type ipmi 30:4e:05:26:22:43 is allocated address 10.0.2.3
$ climc host-network-list --host bm1 --details
+--------------------------------------+------+--------------------------------------+------------+--------------+-------------------+----------+
|             Baremetal_ID             | Host |              Network_ID              |  Network   |   IP_addr    |     Mac_addr      | Nic_Type |
+--------------------------------------+------+--------------------------------------+------------+--------------+-------------------+----------+
| 610a7133-a2f6-4e52-8b12-2067296863a4 | bm1  | 14f56d88-0a70-404f-872e-56949bf0e488 | pxe-net    | 10.168.26.72 | 52:54:00:12:34:56 | admin    |
| 610a7133-a2f6-4e52-8b12-2067296863a4 | bm1  | 14f56d88-0a70-404f-872e-56949bf0e488 | ipmi-net   | 10.0.2.3     | 30:4e:05:26:22:43 | ipmi     |
+--------------------------------------+------+--------------------------------------+------------+--------------+-------------------+----------+

# Update IPMI address to 10.0.2.2
$ climc host-update --ipmi-ip-addr 10.0.2.2 bm1

# After updating IPMI address, need to call IPMI probe interface to refresh information again
$ climc host-ipmi-probe bm1

# After executing host-ipmi-probe, bm1's status field will change to start_probe
# After probing is complete, status will change to running. You can use host-list command to check during this period

# After probing is complete, use host-network-list command to check ipmi address
# Found it has been updated to 10.0.2.2
$ climc host-network-list --host bm1 --details | grep ipmi
| 610a7133-a2f6-4e52-8b12-2067296863a4 | bm1  | 14f56d88-0a70-404f-872e-56949bf0e488 | ipmi-net   | 10.0.2.2     | 30:4e:05:26:22:43 | ipmi     |
```

### Change PXE IP

When a physical machine installs a system or reinstalls a system, it will first PXE boot into the platform's customized minimal Linux system. You can change the IP address allocated during PXE boot through the following command.

Assuming you want to change the PXE boot IP address of physical machine named bm1 from 10.168.26.72 to 10.168.26.70.

```bash
# First view IP addresses already allocated to network cards on physical machine bm1
$ climc host-network-list --host bm1 --details
+--------------------------------------+------+--------------------------------------+------------+--------------+-------------------+----------+
|             Baremetal_ID             | Host |              Network_ID              |  Network   |   IP_addr    |     Mac_addr      | Nic_Type |
+--------------------------------------+------+--------------------------------------+------------+--------------+-------------------+----------+
| 610a7133-a2f6-4e52-8b12-2067296863a4 | bm1  | 14f56d88-0a70-404f-872e-56949bf0e488 | pxe-net    | 10.168.26.72 | 52:54:00:12:34:56 | admin    |
| 610a7133-a2f6-4e52-8b12-2067296863a4 | bm1  | 14f56d88-0a70-404f-872e-56949bf0e488 | ipmi-net   | 10.0.2.2     | 30:4e:05:26:22:43 | ipmi     |
+--------------------------------------+------+--------------------------------------+------------+--------------+-------------------+----------+

# Network card of type admin represents IP allocated for PXE boot
# Corresponding network card MAC address is 52:54:00:12:34:56
# First disable the physical machine network card
$ climc host-disable-netif bm1 52:54:00:12:34:56

# Then re-enable the corresponding network card, allocate specified IP address
$ climc host-enable-netif --ip 10.168.26.70 bm1 52:54:00:12:34:56

# View network card IP address allocation on bm1 again, found admin type network card has changed to 10.168.26.70
$ climc host-network-list --host bm1 --details
+--------------------------------------+------+--------------------------------------+------------+--------------+-------------------+----------+
|             Baremetal_ID             | Host |              Network_ID              |  Network   |   IP_addr    |     Mac_addr      | Nic_Type |
+--------------------------------------+------+--------------------------------------+------------+--------------+-------------------+----------+
| 610a7133-a2f6-4e52-8b12-2067296863a4 | bm1  | 14f56d88-0a70-404f-872e-56949bf0e488 | pxe-net    | 10.168.26.70 | 52:54:00:12:34:56 | admin    |
| 610a7133-a2f6-4e52-8b12-2067296863a4 | bm1  | 25056dcc-45dr-3wef-8734-9b5694f880e4 | ipmi-net   | 10.0.2.2     | 30:4e:05:26:22:43 | ipmi     |
+--------------------------------------+------+--------------------------------------+------------+--------------+-------------------+----------+
```

## Change Bare Metal IP Address

After a physical machine installs an operating system, there is a corresponding bare metal record in the platform. The bare metal allocated IP address corresponds to the IP address on the current disk operating system. If you manually modify the operating system IP, you need to use the following command line to change the corresponding bare metal IP address.

```bash
# First find the corresponding bare metal record on physical machine bm1
$ climc server-list --scope system --host bm1

# View network card and IP address correspondence on bare metal bms
# You will find that the network card MAC address on bms is actually consistent with the network card on physical machine bm1
# IP address is also preferentially reused
$ climc server-network-list --server bms --details
+--------------------------------------+-------+--------------------------------------+---------+-------------------+---------------+
|               Guest_ID               | Guest |              Network_ID              | Network |     Mac_addr      |     IP_addr   |
+--------------------------------------+-------+--------------------------------------+---------+-------------------+---------------+
| 398df1ce-1675-42b9-87d0-87634e21f139 | bms   | 14f56d88-0a70-404f-872e-56949bf0e488 | pxe-net | 52:54:00:12:34:56 | 10.168.26.72  |
+--------------------------------------+-------+--------------------------------------+---------+-------------------+---------------+

# Then update bare metal bms IP address, change to 10.168.26.70 address in pxe-net subnet
$ climc server-change-ipaddr bms 52:54:00:12:34:56 pxe-net:10.168.26.70
```

