---
sidebar_position: 13
---

# Ceph Integration

Introduction to integrating non-standard ceph rbd storage (Venustech, SandStone and other storage vendors).

# Description

- Versions release/3.8 and later will use ceph and rbd commands to directly operate ceph clusters
- The rbd and ceph commands used on compute nodes must be consistent with the ceph cluster version in use, otherwise incompatibility will occur, causing resource creation and deletion failures
- If using non-open source ceph, please install the ceph and rbd commands provided by the storage vendor on compute nodes, and ensure that ceph and rbd commands are soft-linked or directly placed in any of the following paths
    - /usr/local/sbin
    - /usr/local/bin
    - /sbin
    - /bin
    - /usr/sbin
    - /usr/bin
- If multiple storage vendors are integrated, and the rbd commands provided by each vendor are incompatible with each other, you need to consider the relationship between rbd commands and host mounts to avoid mounting multiple incompatible storage systems to the same host

