---
sidebar_position: 14
---

# Daemon Virtual Machine

This section introduces how to set virtual machines to start automatically with the host operating system. Virtual machine auto-start is achieved by setting the virtual machine as a daemon virtual machine. If a virtual machine is set as a daemon virtual machine, every time host-agent starts, it will ensure that this virtual machine is in running state.


## Set Daemon Virtual Machine

### Set Daemon Virtual Machine When Creating Virtual Machine

```bash
$ climc server-create --is-daemon ...

# View whether virtual machine is set as daemon virtual machine
$ climc server-show <ID> | grep is_daemon
| is_daemon                  | true
```

### Set Existing Virtual Machine Daemon Mode

```bash
# [--is-daemon/--no-daemon]
$ climc server-update --is-daemon <ID>
```

## Set New Virtual Machines Default as Daemon Virtual Machines

```bash
# Modify region configuration, add set_kvm_server_as_daemon_on_create: true
$ climc service-config-edit region2

# After adding configuration, restart region
$ kubectl rollout restart deploy -n onecloud default-region
```

After completion, newly created virtual machines will be set as daemon virtual machines by default.

