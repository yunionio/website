---
edition: ce
sidebar_position: 23
---

# Clean Unused Security Groups

Security groups in version 3.11 and later no longer use one-to-many design. Therefore, after upgrading to version 3.11, there will be some useless kvm security groups remaining in the system. At this time, you need to clean up these unused security groups.

```bash
# This command only deletes kvm security group records in the local database that are not referenced by other instances
$ climc secgroup-clean
```


