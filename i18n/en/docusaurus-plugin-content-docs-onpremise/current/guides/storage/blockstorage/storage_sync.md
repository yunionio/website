---
sidebar_position: 6
---

# Storage Information Collection

Introduction to storage information synchronization.

After a storage is managed by the platform, the platform periodically collects storage information.

## Working Principle

Block storage information collection is handled by the host's host service.

After configuring a storage, the platform will select a master host (MasterHost) from associated hosts according to consistent hash algorithm for this storage's information collection.

MasterHost is responsible for periodically calling the GetStorageInfo interface to obtain storage capacity information

## Collection Frequency

The frequency of host service collecting storage information is controlled by the host's configuration item sync_storage_info_duration_second, default is every 120 seconds.


