---
sidebar_position: 4
---

# Host Down Automatic Migration

## Introduction

When a host down is detected, running virtual machines on the host automatically migrate to other hosts.

### Principle Introduction

Down detection relies on etcd watch mechanism. When host-agent starts, it registers a key with etcd. When region watches that the host key disappears for a period of time (60s), it initiates down migration, migrating virtual machines on shared storage on the host to other hosts.

So automatic down migration depends on etcd deployed by onecloud operator.
```bash
# View status of etcd deployed by onecloud operator
kubectl get pods -n onecloud | grep default-etcd
```

When host-agent starts, it registers a key with etcd. When automatic down migration is enabled, after the host is disconnected from the network for a period of time, host-agent will shut down virtual machines on the host to prevent disk double-write after network recovery.

## Usage Introduction

```bash
# climc command

# Modify region service configuration
$ climc service-config --config '{"default":{"enable_host_health_check":true}}' region2

$ climc host-auto-migrate-on-host-down --help
Usage: climc host-auto-migrate-on-host-down [--auto-migrate-on-host-shutdown {enable,disable}] [--help] [--auto-migrate-on-host-down {enable,disable}] <ID> ...

# Enable automatic down migration
$ climc host-auto-migrate-on-host-down --auto-migrate-on-host-down enable <ID>

# Enable automatic down migration and enable automatic shutdown migration at the same time
$ climc host-auto-migrate-on-host-down --auto-migrate-on-host-down enable --auto-migrate-on-host-shutdown enable <ID>

# Cancel automatic down migration
$ climc host-auto-migrate-on-host-down <ID>

# Restart region service
kubectl -n onecloud rollout restart deployment default-region
```


