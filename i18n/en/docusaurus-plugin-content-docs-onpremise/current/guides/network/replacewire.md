---
sidebar_position: 5
---

# Change Host Network Card's Connected Layer 2 Network

Introduction to how to change the layer 2 network that the platform host network card is connected to.

When the platform network concepts are not very clear, when new hosts are connected, it often happens that it is impossible to determine whether a new layer 2 network needs to be added, resulting in hosts being connected to the wrong layer 2 network.

This article introduces how to correct and change the host's connected layer 2 network through commands when the host's layer 2 network configuration is incorrect.

First, you need to confirm that there are no virtual machines on the host.

View the host's connection parameters, execute the following command:

```bash
climc host-wire-list --host <host_id> --details
```

General output parameters are as follows:
```bash
+--------------------------------------+--------------------------------------+--------+-----------+-------------------+-----------+
|               Host_ID                |               Wire_ID                | Bridge | Interface |     Mac_addr      | is_master |
+--------------------------------------+--------------------------------------+--------+-----------+-------------------+-----------+
| 6fc10297-eb20-4a96-86a8-4b65260d6016 | b0aaa839-2f33-464a-8454-1736d0707fe3 | br1    | em2       | e4:43:4b:06:84:8a | false     |
| 6fc10297-eb20-4a96-86a8-4b65260d6016 | 707629b5-57c0-41ba-8967-a2771b4d08f3 | br0    | em1       | e4:43:4b:06:84:88 | true      |
+--------------------------------------+--------------------------------------+--------+-----------+-------------------+-----------+
```

## Step 1: Delete Host's Layer 2 Network Connection Record

```bash
climc host-remove-netif <host_id> '0c:c4:7a:0e:fa:f5'
```

## Step 2: Delete Corresponding IP Subnet

At this time, the IP subnet connected by the host is also configured on the wrong layer 2 network. Currently, changing the layer 2 network of an IP subnet is not supported. Therefore, you need to first delete the corresponding IP subnet, then rebuild this IP subnet on the new layer 2 network.

Delete the old host IP subnet

```bash
climc network-delete adm4
```

Rebuild the host IP subnet on the new layer 2 network

```bash
climc network-create --gateway 10.2.53.254 --server-type baremetal <name_of_new_wire> adm4 10.2.53.55 10.2.53.55 24
```

## Step 3: Rebuild Host's Network Connection Record

```bash
climc host-add-netif --ip-addr 192.168.3.201 --bridge br0 --interface bond0 --type admin <host_id> 73710abe-a0cf-48de-8fcd0-0b7b0492f4ef '0c:c4:7a:0e:fa:f4' 0
```

