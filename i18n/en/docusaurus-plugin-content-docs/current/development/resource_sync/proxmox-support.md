---
sidebar_position: 5
---

# Managing Proxmox Resources

Some development-related notes on managing Proxmox virtual machines, networks, and storage resources into the cloudpods platform

## Resource IDs and Corresponding Relationships with Proxmox


| Name         | Abstract Resource                 | Proxmox Corresponding Relationship, Description | ID Format    | Example
|--------------|------------------------- | ----------------------|------------------------------------------|-------------------------|
| host         | Server                   | node                  | node/\{node name\}                         | node/abc                |
| zone         | Cloud Platform Data Center           | cluster               |                                          |                         |
| storage      | Storage                     | storage               | storage/\{node name\}/\{storage name\}       | storage/abc/local       |
| disk         | Cloud Disk                   | disk                  | \{storage name\}:vm-\{vm id\}-disk-\{slot id\} | local:vm-100-disk-0     |
| network      | Network                     | network               | network/abc/\{network name\}               | network/abc/vmbr1       |
| instance     | Virtual Machine                   | qemu(vm)              | vmid                                     | 100                     |

## Function Description

1. Proxmox's API often requires node names, so when calling the API, you need to first analyze the resource's ID to know which node it's on from the ID.
2. Image functionality is currently not implemented. Images display Proxmox qemu templates.
3. Currently only supports single-machine mode Proxmox. Does not support managing multi-node Proxmox clusters. In multi-node situations, the storage resource model is complex.

cluster: Provides searching for vm, node, and storage resources across the entire Proxmox cluster, because network and disk don't have global IDs in Proxmox clusters. cluster helps find which vm or storage a network or disk is under on a node.
disk: disk-list and disk-show will only find disks related to vms.
instance: Creating vms will only create empty system disks.

## Related URLs
1. Proxmox VE API Documentation https://pve.proxmox.com/pve-docs/api-viewer/index.html
2. Network Configuration - Proxmox VE https://pve.proxmox.com/wiki/Network_Configuration
3. Proxmox VE Documentation Index https://pve.proxmox.com/pve-docs/index.html
4. Storage - Proxmox VE https://pve.proxmox.com/wiki/Storage

