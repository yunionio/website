---
edition: ce
sidebar_position: 22
---

# Fault Recovery

This document describes recovery methods for common abnormal faults in the platform.

## Recover admin Password

admin is the default user created after platform deployment. If the admin password is lost, you can log in to the control node shell and execute the following climc command to reset the admin password:

```bash
climc user-update admin --password "new_password_of_admin"
```

## Recover sysadmin Password

sysadmin is the platform's default system user, and the climc user on the control node shell is sysadmin. The platform may lose the sysadmin password in the following situations:
* Restoring the platform database to a previous version
* Modified the sysadmin password but accidentally forgot it

You can recover the sysadmin password through the following process:

First, modify keystone's configmaps:

```bash
kubectl -n onecloud edit configmaps default-keystone
```

Modify the following two items:

```
bootstrap_admin_user_password: initial_sysadmin_password
reset_admin_user_password: true
```

Restart the default-keystone container, and the sysadmin password will be reset to initial_sysadmin_password

Note: After the above operation succeeds, reset_admin_user_password should be restored to false, otherwise the sysadmin password will be reset every time keystone restarts.

## Recover Host Directory on Host

The directory of specific hosts or all hosts under /opt/cloud/workspace/servers on the host may be lost. At this time, the platform can see that the virtual machine's status changes to not_found or unknown, and the status cannot be recovered.

You can recover the virtual machine directory using the following method:

Assume the virtual machine ID is: 89b69a7d-cc0b-428f-81dc-06fe1f283594

First, create a directory 89b69a7d-cc0b-428f-81dc-06fe1f283594 under /opt/cloud/workspace/servers on the host, and create a desc file in this directory with the following content:

If it's a virtual machine:

```json
{"uuid":"89b69a7d-cc0b-428f-81dc-06fe1f283594","hypervisor":"kvm"}
```

If it's a container host:
```json
{"uuid":"89b69a7d-cc0b-428f-81dc-06fe1f283594","hypervisor":"pod"}
```

Finally, restart the host service on this host. After the restart is complete, the virtual machine's status will change to ready.

