---
sidebar_position: 4
---

# Ceph Storage

Ceph is a famous open source distributed storage. A storage cluster can simultaneously provide three storage interfaces: block storage (RBD), object storage (RadosGw) and file storage (CephFs). This article introduces the configuration and usage methods for virtual machines to use Ceph RBD block storage.

## Supported Ceph Versions

The platform accesses Ceph storage by calling ceph commands deployed on hosts.

When the platform deploys a host, it will install the open source version of ceph-common by default, which includes Ceph clients.

Ceph-common versions installed by various Linux distributions are as follows:

* CentOS 7: 10.2.5
* CentOS 8: 12.2.8
* Kylin V10: 12.2.8
* Debian 10: 12.2.11
* Debian 11: 14.2.21
* OpenEuler 22.03 SP1: 16.2.7

If users need other versions of ceph-common, or users want to use commercial ceph, they need to manually install the corresponding version of ceph-common on the host.

Due to this mechanism, the following limitations exist:

* The same host can only connect to Ceph storage of specific version ranges or specific vendors.
* For open source ceph, there are version compatibility issues: lower version ceph-common may not be able to access higher version ceph service clusters. For example, CentOS 7's built-in 10.2.5 ceph-common cannot access ceph service clusters of >=16.x versions.

## Ceph Connection Configuration

### Network Requirements

Hosts that mount and use Ceph storage need to be able to directly network access the Ceph cluster.

### Configuration Parameters

The following configuration parameters need to be prepared:

| Parameter                   | Optional | Description                                     |
|-----------------------|---------|-----------------------------------------|
| RbdMonHost            | Required     | Ceph cluster's monitor service IP addresses, multiple separated by commas | 
| RbdPool               | Required     | Ceph Pool name, one Pool corresponds to one Ceph storage instance  |
| RbdKey                | Optional     | Ceph authentication key                              |
| RbdRadosMonOpTimeout  | Optional     | Timeout for accessing Ceph Monitor (seconds)            |
| RbdRadosOsdOpTimeout  | Optional     | Timeout for accessing Ceph OSD (seconds)                |
| RbdClientMountTimeout | Optional     | Timeout for client mounting Ceph RBD devices (seconds)        |

## Ceph Access Credentials

Each time a ceph command is executed on the host, if the storage has configured the rbd_key parameter, it will use the rbd_key secret to generate a temporary ceph credential file for accessing ceph storage. It will not use credential files saved in the host's /etc/ceph.

## Ceph Capacity Identification

After the platform connects to a Ceph RBD storage, it will periodically pull storage capacity information from Ceph.

Ceph storage capacity information is obtained through the ceph df command:

```bash
# ceph df
RAW STORAGE:
    CLASS     SIZE       AVAIL      USED       RAW USED     %RAW USED
    hdd       31 TiB     21 TiB     10 TiB       10 TiB         32.72
    TOTAL     31 TiB     21 TiB     10 TiB       10 TiB         32.72

POOLS:
    POOL               ID     PGS     STORED      OBJECTS     USED       %USED     MAX AVAIL
    cloudpods-test      1     128     5.0 TiB       1.54M     10 TiB     31.62        11 TiB
```

Storage total capacity is STORED + MAX AVAIL of the corresponding Pool, usage is STORED of the corresponding Pool


