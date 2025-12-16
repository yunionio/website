---
sidebar_position: 1
---

# DNS Design Introduction

Introduction to synchronization logic related to DNS resources.

## Old Version Design

Before version 3.10.4, due to the one-to-many mode, local DNS domains would correspond to multiple cloud platform DNS domains, resulting in the following two problems:

1. If DNS resolution records from different cloud platforms are inconsistent, synchronizing to local will continuously overwrite local resolution records
2. If synchronization from cloud platforms to local is not timely, pushing resolution records from local to cloud again will cause records not yet synchronized to local to be deleted on cloud

## New Version Design

Versions after 3.10.4 adopt a one-to-one mode, where cloud DNS domains and resolution records correspond to one piece of local data

Therefore, adding, deleting, or modifying a local DNS resolution will only affect one specific record on cloud. Even if some records have not been synchronized to local, they will not be affected

The new version uses a new table to store DNS resolutions. Therefore, after updating to the new version, public cloud DNS resolutions will be temporarily cleared and need to wait for cloud account synchronization to complete before being restored

## region-dns Service

Before version 3.10.4, region-dns used one table to store DNS resolutions, similar to the following:

`dnsrecord_tbl:`

| Name              | Records    |
| ----------------- | ---------- |
| hello.example.com | A: 1.1.1.1 |
| world.example.com | A: 2.2.2.2 |

The new version uniformly adopts a design similar to public clouds, using one table to store DNS zones and one table to store resolution records, similar to the following:

`dnszones_tbl:`

| Name        | ZoneType    | Id              |
| ----------- | ----------- | --------------- |
| example.com | PrivateZone | 1111-xxxx-xxxxx |
| cloud.org   | PublicZone  | 2222-xxxx-xxxxx |

`dnsrecords_tbl:`

| DnsZoneId       | Name  | DnsType | DnsValue          |
| --------------- | ----- | ------- | ----------------- |
| 1111-xxxx-xxxxx | *     | A       | 1.1.1.1           |
| 1111-xxxx-xxxxx | hello | CNAME   | world.example.com |
| 2222-xxxx-xxxxx | iso   | A       | 2.2.2.2           |

Therefore, creating local Cloudpods DNS resolutions in the new version will be consistent with public clouds.

