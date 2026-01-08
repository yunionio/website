---
sidebar_position: 1
---

# Import libvirt Virtual Machine

Built-in private cloud platform supports importing virtual machines managed by libvirt.

## Considerations

:::tip
- First need to install our compute node on the host managed by libvirt
- After installing the compute node, need to add the virtual machine's network to the control node
- Ensure libvirt service is closed
:::

## Related Operations

1. Prepare the information file `servers.yaml` for virtual machines that need to be imported. Format is as follows:

    - `host_ip` is the IP of the host to be imported
    - `xml_file_path` is the path where libvirt stores virtual machine xml files,
    - `monitor_path` is the path where libvirt stores virtual machine monitor socket files,
    - `servers` are virtual machines that need to be imported, describing the correspondence between virtual machine IPs and MACs

```yaml
hosts:
  - host_ip: 10.168.222.137
    xml_file_path: /etc/libvirt/qemu
    monitor_path: /var/lib/libvirt/qemu
    servers:
      - mac: 52:54:00:4A:19:AF
        ip: 10.168.222.53
      - mac: 52:54:00:4A:19:CC
        ip: 10.168.222.54
  - host_ip: 10.168.222.130
    xml_file_path: /etc/libvirt/qemu
    monitor_path: /var/lib/libvirt/qemu
    servers:
      - mac: 53:54:00:4A:19:EC
        ip: 11.168.222.50
      - mac: 53:54:00:4A:19:EE
        ip: 11.168.222.51
```

2. Execute climc servers-import-from-libvirt to start importing

```bash
# Confirm libvirt service is closed before importing
$ climc servers-import-from-libvirt servers.yaml
```

