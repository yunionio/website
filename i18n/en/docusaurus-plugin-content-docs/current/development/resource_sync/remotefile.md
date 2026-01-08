---
sidebar_position: 3
---

# Import External Data

Introduces how to import external data and external data structure definitions.

:::tip
- External data is used as a special cloud account. You need to define external data files yourself and import them into platform data by reading data files
- This article mainly explains the format for generating external data, relationships between data, and data synchronization
:::

Next, we first introduce relationships between data.

## Data Relationships

The data association diagram is roughly as follows (except for annotated fields, data associations are all through id):

![](./images/resource.png)

## Corresponding Data Structures


```bash
# 1、regions.json Regions
[
  {
    "id": "region-test-1",
    "name": "region-test-1"
  },
  {
    "id": "region-test-2",
    "name": "region-test-2"
  },
]

# 2、zones.json Availability Zones
[
  {
    "id": "zone-test-1",
    "name": "zone-test-1",
    "region_id": "region-test-1",
    "status": "enable" # Status, enable\disable\init\soldout
  },
  {
    "id": "zone-test-2",
    "name": "zone-test-2",
    "region_id": "region-test-2",
    "status": "enable"
  }
]
# 3、host.json 
[
  {
    "cpu_count": 0,
    "cpu_mbz": 0,
    "emulated": true, # Indicates virtual resource
    "enabled": false,
    "id": "host-test-1",
    "mem_size_mb": 0,
    "name": "host-test-1",
    "node_count": 0,
    "storage_size_mb": 0,
    "zone_id": "zone-test-1"
  },
]
# 4、loadbalancers.json
[
  {
    "address": "41.38.13.61",
    "address_type": "intranet", # intranet\internet
    "bandwidth": 10,
    "created_at": "2022-05-17 09:38:07",
    "emulated": false,
    "id": "loadbalancer-test",
    "name": "loadbalancer-test",
    "network_type": "vpc", # classic\vpc
    "region_id": "region.edge_prov_zj_vmware.wz",
    "status": "enabled",
    "tags":{}, # Resource tags
    "vpc_id": "vpc-test",
    "zone_id": "zone-test-1"
  }
]

# 5、vpcs.json
[
  {
    "cidr_block": "192.16.0.0/12", 
    "emulated": false,
    "id": "vpc-test",
    "is_default": false,
    "name": "vpc-test",
    "region_id": "region-test-1",
    "tags":{},
    "status": "available", # pending\available\unavailable\failed\deleting\unknown
  }
]

# 6、dbinstances.json
[
  {
    "category": "Standalone",
    "connection_str": "10.56.53.4",
    "created_at": "2022-05-12T06:05:01.000000Z",
    "disk_size_gb": 0,
    "disk_size_used_gb": 0,
    "emulated": false,
    "engine": "MySQL",
    "engine_version": "5.7",
    "id": "dbinstance-test",
    "instance_type": "mysql.c1.model.large.2",
    "internal_connection_str": "10.56.53.4",
    "iops": 0,
    "name": "dbinstance-test",
    "port": 13307,
    "region_id": "region-test-1",
    "status": "running",
    "storage_type": "default",
    "tags":{}
    "vcpu_count": 4,
    "vmem_size_mb": 2048,
    "vpc_id": "58d06612a78242feb10f420583537fe6"
  }
]

# 7、buckets.json
[
  {
    "created_at": "2022-05-12 14:05:20",
    "emulated": false,
    "id": "bucket-test",
    "limit":
      {
        "object_count": 500,  #
        "size_bytes": 536870912000
      },
    "max_part": 0,
    "max_part_bytes": 0,
    "name": "bucket-wgstyjs",
    "region_id": "region.edge_prov_zj_vmware.paas.wz",
    "stats":
      {
        "object_count": 500,
        "size_bytes": 536870912000
      },
    "status": "available",
  }
]

# 8、secgroups.json
[
  {
    "emulated": false,
    "id": "0790144420404bd0a7a71fa4d74e9dec",
    "name": "secgroup-test",
    "tags":{},
    "vpc_id": "vpc-test",
  }
]

# 9、eips.json
[
  {
    "bandwidth": 0,
    "emulated": false,
    "id": "eip-test",
    "ip_addr": "",
    "mode": "elastic_ip", # public_ip\elastic_ip
    "name": "eip-test",
    "region_id": "region-test-1",
    "status": "running",
    "tags":{}
  }
]

# 10、disks.json
[
  {
    "disk_format": "raw", # Format, raw\vhd
    "disk_size_mb": 512000,
    "disk_type": "data", # Disk type, data\sys
    "emulated": false,
    "id": "disk-test",
    "name":"disk-test",
    "iops": 0,
    "is_auto_delete": false,
    "status": "ready",
    "storage_id": "storage-test",
    "tags":{},
    "zone_id": "region.edge_prov_zj_vmware.wz"
  }
]

# 11、storages.json
[
  {
    "id": "storage-test",
    "storage_type": "cloud_efficiency", #Storage type
    "zone_id": "zone-test-1"
  }
]

# 12、hosts.json
[
  {
    "cpu_count": 0,
    "cpu_mbz": 0,
    "emulated": true,
    "enabled": false,
    "id": "host-test-1",
    "mem_size_mb": 0,
    "name": "host-test-1",
    "node_count": 0,
    "storage_size_mb": 0,
    "zone_id": "zone-test-1"
    "wires":[
  {
    "bandwidth": 0,
    "emulated": false,
    "id": "wire-test",
    "vpc_id": "vpc-test",
    "wire_id": "wire-test",
    "zone_id": "zone-test-1"
  }
]
  }
]

# 13、wires.json
[
  {
    "bandwidth": 0,
    "emulated": false,
    "id": "wire-test",
    "vpc_id": "vpc-test",
    "wire_id": "wire-test",
    "zone_id": "zone-test-1"
  }
]

# 14、networks.json
[
  {
    "emulated": false,
    "id": "network-test",
    "ip_end": "10.156.153.160",
    "ip_mask": 0,
    "ip_start": "10.156.153.27",
    "name": "network-test",
    "status": "available",
    "tags":{},
    "wire_id": "wire-test"
  }
]

# 15、instances.json
[
 {
    "band_width": 0,
    "created_at": "2022-08-22 10:08:44",
    "disks":
      [
        {
          "created_at": "2022-08-22 10:08:44",
          "disk_format": "raw",
          "disk_size_mb": 40960,
          "disk_type": "sys",
          "emulated": false,
          "id": "disk-test-40",
          "instance_id": "instance-test",
          "iops": 0,
          "is_auto_delete": false,
          "name": "disk-test-40",
          "status": "ready",
          "storage_id": "storage-test",
          "zone_id": "zone-test"
        }
      ],
    "eip_id": "eip-test",
    "emulated": false,
    "host_id": "host-test",
    "id": "instance-test",
    "name": "instance-test",
    "nics":
      [
        {
          "classic": false,
          "emulated": false,
          "id": "nics-test",
          "ip": "10.56.53.74"
        }
      ],
    "os_name": "sc-centos7.2.1511_vmtools-40g-zj",
    "status": "running",
    "tags":{},
    "throughput": 0,
    "vcpu_count": 2,
    "vmem_size_mb": 8192
  }
]

# 16、misc.json
[
  {
    "config":
      {
        "size": 4
      },
    "resource_type": "DBAudit",
    "status": "running",
    "tags":{},
    "created_at": "2021-02-01 08:00:00",
    "emulated": false,
    "id": "misc-test",
    "name": "misc-test",
    "project_id": "project-test",
    "project_name": "project-test",
    "resource_type": "DBAudit", # Resource type
    "status": "running",
  }
]

# 17、metrics.json
[
  {
    "vm_cpu.usage_active":
      {
        "id": "vm-test-1",
        "metric_type": "vm_cpu.usage_active", # rds_cpu.usage_active
        "values":
          [
            {
              "timestamp": 1669781095664, # Millisecond timestamp
              "value": 0
            }
          ]
      }
  },
  {
    "vm_mem.used_percent":
      {
        "id": "vm-test-2",
        "metric_type": "vm_mem.used_percent", # rds_mem.used_percent
        "values":
          [
            {
              "timestamp": "2022-11-30T04:04:55.664954Z",
              "value": 10.97
            }
          ]
      }
  },
  {
    "vm_disk.used_percent":
      {
        "id": "vm-test-3",
        "metric_type": "vm_disk.used_percent", # rds_mem.used_percent
        "values":
          [
            {
              "timestamp": 1669781095664,
              "value": 0.00011391910658488601
            }
          ]
      }
  }
]

# 18、projects.json
[
  {
    "emulated": false,
    "id": "project-test",
    "name": "project-test",
    "status": "available",
    "tags":{}
  }
]
```
## Notes on Import Files

1. Under the same resource type, resource ids must be unique.

2. Associations between resources must be associated in the specified way

3. Currently, external data monitoring only supports ECS and RDS mem, disk, and cpu usage rates.

4. For resources at lower levels that associate with upper levels, upper level ids must exist. For example, regionId in zones.json must exist in regions.json.

