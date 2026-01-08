---
sidebar_position: 12
---

# Network Card Subordinate IPs (SubIPs)

By default, a virtual machine's virtual network card can only be allocated one IP, but you can allocate several subordinate IPs to a network card through the following method. The platform checks the source IP of virtual machine network card traffic by default. Through subordinate IPs, you can allow using multiple IPs within the virtual machine.

The API for applying for subordinate IPs is:

```
POST /servers/<sid>/add-sub-ips

{
    "mac": "aa:bb:cc:dd:ee:ff",
    "count": 10,
    "sub_ips": ["192.168.20.2", "192.168.20.3"],
}
```

You can also apply for subordinate IPs for a specified network card of a virtual machine through climc:

```
climc server-add-sub-ips <sid> --mac "aa:bb:cc:dd:ee:ff" --count 10 --sub-ips 192.168.20.2 --sub-ips 192.168.20.3
```

View subordinate IPs:

```
climc server-network-show <sid> <nid> --mac <mac>
```

Delete subordinate IPs:

```
DELETE /networkaddress/<id>
```

```
climc networkaddress-delete <id1> <id2> ...
```

Generally, allocated subordinate IPs are used for container IPs in virtual machines, allowing containers to directly use IPs on the same plane as the virtual machine network, avoiding performance overhead from additional container network virtualization.

