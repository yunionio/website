---
sidebar_position: 1
---

# Enable/Disable Host

Control the host's enabled status. Hosts in enabled status are used to create virtual machines.

## Climc Operation

### Enable


```bash
# Find disabled hosts
$ climc host-list --disabled

# Enable host
$ climc host-enable <host_id>
```

### Disable

```bash
# Disable host
$ climc host-disable <host_id>
```


