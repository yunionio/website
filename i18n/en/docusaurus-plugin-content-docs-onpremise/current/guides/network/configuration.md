---
sidebar_position: 8
---

# Network Parameter Configuration

This section introduces private cloud virtual machine network settings, including DHCP, DNS, NTP and other settings.

## DHCP

Virtual machines enable DHCP by default, obtaining IP addresses, static routes, domain names, NTP and other settings through DHCP. Physical machines obtain these configurations through static writing to configuration files by default.

## DNS Configuration

### Global Configuration

Global host DNS server needs to be configured in two places:

1. region configuration

climc service-config-edit region2

Modify configuration: dns_server

```yaml
default:
  ...
  dns_domain: office.yunion.io
  dns_server: 172.16.22.11
  ...
```

2. endpoint configuration

First register dns service

```bash
climc service-create dns dns
```

Second, register DNS service addresses. You can register multiple. Each corresponds to an endpoint record.

```bash
climc endpoint-create dns region0 public <dns_ip>
```

### IP Subnet Configuration

For each IP subnet, you can modify this IP subnet's guest_dns configuration. You can set multiple, separated by commas.

```bash
climc network-update --dns '172.16.22.11,172.16.22.12' <network>
```

If both global DNS configuration and IP subnet DNS configuration are configured, IP subnet DNS configuration takes priority.


## NTP Configuration

Starting from v3.8, support configuring virtual machine NTP servers through the platform and automatically issuing them to virtual machines through DHCP.

### Global Configuration

Same as DNS configuration, configure the platform's NTP server information by registering ntp endpoints.

First register ntp service

```bash
climc service-create ntp ntp
```

Second, register NTP service addresses. You can register multiple. Each corresponds to an endpoint record.

```bash
climc endpoint-create ntp region0 public <dns_ip>
```

### IP Subnet Configuration

For each IP subnet, you can modify this IP subnet's guest_ntp configuration. You can set multiple, separated by commas.

```bash
climc network-update --ntp '172.16.22.11,172.16.22.12' <network>
```

If both global NTP configuration and IP subnet NTP configuration are configured, IP subnet NTP configuration takes priority.

In addition, different from DNS configuration, DNS server addresses must use IPs, while NTP server addresses can use domain names.


