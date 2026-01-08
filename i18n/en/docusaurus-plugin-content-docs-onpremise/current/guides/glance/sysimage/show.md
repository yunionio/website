---
sidebar_position: 5
---

# Query Image

## Climc Operation

You can obtain the image list based on image-list. Columns 1 and 2 contain the image's id and name. You can obtain image details through id or name.

```bash
# Query images with names containing CentOS
$ climc image-list --search centos
+--------------------------------------+-----------------------------------------+-------------+-----------+-----------+-----------+-------------+----------+---------+--------+----------------------------------+----------------------------------+--------+----------------+
|                  ID                  |                  Name                   | Disk_format |   Size    | Is_public | Protected | Is_Standard | Min_disk | Min_ram | Status |             Checksum             |            Tenant_Id             | Tenant | is_guest_image |
+--------------------------------------+-----------------------------------------+-------------+-----------+-----------+-----------+-------------+----------+---------+--------+----------------------------------+----------------------------------+--------+----------------+
| abf0fd6e-ec40-44ef-8fa2-cfb7187ea656 | CentOS-7-x86_64-GenericCloud-1711.qcow2 | qcow2       | 876740608 | false     | true      | true        | 8192     | 0       | active | 317ecf7d1128e0e53cb285b8704dc3d3 | d53ea650bfe144da8ee8f3fba417b904 | system | false          |
+--------------------------------------+-----------------------------------------+-------------+-----------+-----------+-----------+-------------+----------+---------+--------+----------------------------------+----------------------------------+--------+----------------+
***  Total: 1 Pages: 1 Limit: 20 Offset: 0 Page: 1  ***

# View details of CentOS-7-x86_64-GenericCloud-1711.qcow2
$ climc image-show CentOS-7-x86_64-GenericCloud-1711.qcow2
+--------------------+-------------------------------------------------------------------------------------------------------------------+
|       Field        |                                                       Value                                                       |
+--------------------+-------------------------------------------------------------------------------------------------------------------+
| can_delete         | false                                                                                                             |
| can_update         | true                                                                                                              |
| checksum           | 317ecf7d1128e0e53cb285b8704dc3d3                                                                                  |
| created_at         | 2020-06-16T09:17:57.000000Z                                                                                       |
| delete_fail_reason | {"error":{"class":"ForbiddenError","code":403,"data":{"id":"image is protected"},"details":"image is protected"}} |
| disk_format        | qcow2                                                                                                             |
| domain_id          | default                                                                                                           |
| fast_hash          | 4c53ba2c464213ddc2a77c9b4c5ad3b7                                                                                  |
| id                 | abf0fd6e-ec40-44ef-8fa2-cfb7187ea656                                                                              |
| is_data            | false                                                                                                             |
| is_emulated        | false                                                                                                             |
| is_guest_image     | false                                                                                                             |
| is_public          | false                                                                                                             |
| is_standard        | true                                                                                                              |
| is_system          | false                                                                                                             |
| min_disk           | 8192                                                                                                              |
| min_ram            | 0                                                                                                                 |
| name               | CentOS-7-x86_64-GenericCloud-1711.qcow2                                                                           |
| oss_checksum       | 317ecf7d1128e0e53cb285b8704dc3d3                                                                                  |
| owner              | d53ea650bfe144da8ee8f3fba417b904                                                                                  |
| pending_deleted    | false                                                                                                             |
| project_domain     | Default                                                                                                           |
| project_src        | local                                                                                                             |
| properties         | {"os_arch":"x86_64","os_type":"Linux"}                                                                            |
| protected          | true                                                                                                              |
| public_scope       | system                                                                                                            |
| size               | 876740608                                                                                                         |
| status             | active                                                                                                            |
| tenant             | system                                                                                                            |
| tenant_id          | d53ea650bfe144da8ee8f3fba417b904                                                                                  |
| update_version     | 8                                                                                                                 |
| updated_at         | 2020-06-16T09:19:24.000000Z                                                                                       |
+--------------------+-------------------------------------------------------------------------------------------------------------------+
```

Other usage examples:

```bash
# Query all image lists
$ climc image-list

# Query all cached image lists
$ climc cached-image-list

# Query images containing ubuntu keyword
$ climc image-list --search ubuntu

# Query caches containing centos keyword from public cloud
$ climc cached-image-list --search centos --public-cloud

# Query conditions supported by image-list
$ climc image-list --help

# Query conditions supported by cached-image-list
$ climc cached-image-list --help
```


