---
sidebar_position: 3
---

# Delete Virtual Machine

## Frontend Operations

### Set Delete Protection

This function is used to set delete protection for virtual machines. When delete protection is enabled for a virtual machine, the virtual machine cannot be deleted; when delete protection is disabled for a virtual machine, the virtual machine can be deleted.

1. Disable delete protection:
    - When the virtual machine name has a![](/img/docs/getting-started/delprotect1.png) icon on the right, click the **_"More"_** button in the operation column on the right side of the virtual machine, select the **_"Delete-Set Delete Protection"_** menu item from the dropdown menu to pop up the set delete protection dialog.
    - Select "Disable" delete protection, click the **_"OK"_** button.
2. Enable delete protection:
    - When the virtual machine name does not have a![](/img/docs/getting-started/delprotect1.png) icon on the right, click the **_"More"_** button in the operation column on the right side of the virtual machine, select the **_"Delete-Set Delete Protection"_** menu item from the dropdown menu to pop up the set delete protection dialog.
    - Select "Enable" delete protection, click the **_"OK"_** button.


### Delete

This function is used to delete virtual machines. When there is a![](/img/docs/getting-started/delprotect1.png) icon on the right side of the virtual machine name item, it means this virtual machine has delete protection enabled and cannot be deleted. If you need to delete the virtual machine, you need to disable delete protection first, then delete the virtual machine.

:::tip
- Deleted virtual machines will be placed in the recycle bin. If you want to completely delete the virtual machine, you need to delete it again in the recycle bin.
- If the host where the virtual machine is located has an abnormal status, even if delete protection is disabled, the virtual machine cannot be deleted.
- If the host has gone offline and cannot be recovered, administrators need to use the climc server-purge command on the control node to delete the virtual machine record. Refer to [Clear Virtual Machine Record](./purge).
:::

1. On the virtual machine page, click the **_"More"_** button in the operation column on the right side of the virtual machine, select the **_"Delete-Delete"_** menu item from the dropdown menu to pop up the operation confirmation dialog.
2. Support checking "Delete snapshots at the same time", "Delete attached data disks at the same time", "Delete EIP at the same time", etc.
3. Click the **_"OK"_** button to complete the operation.

## climc Operations

### Remove Delete Protection

```bash
$ climc server-update --delete enable <server_id>
```

### Delete

```bash
# Delete to recycle bin
$ climc server-delete <server_id>

# Do not go to recycle bin, delete directly
$ climc server-delete -f <server_id>
```

