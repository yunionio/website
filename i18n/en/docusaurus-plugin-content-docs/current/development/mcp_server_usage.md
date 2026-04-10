---
sidebar_position: 6.7
---

# MCP Server Usage

This guide explains how to connect **Cloudpods mcp-server** from MCP-capable clients such as Cursor and Cline using the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/), and drive cloud resource queries and operations in natural language.

For deployment and build steps, see **MCP service (mcp-server) setup** in [Manual Deployment of Development Cluster](./single_service_dev).

## Prerequisites

- mcp-server is running and reachable from the client (`127.0.0.1` locally, or `0.0.0.0` with network access allowed).
- **Access Key / Secret Key** have been created for a platform user (see below), or you only use redacted test credentials in chat.

## Connecting the client

The server defaults to **SSE** (typically at `/sse`). If the client supports a **stdio** subprocess, you can launch the `mcp-server` binary directly.

### SSE (recommended, local or remote)

Replace `url` with your real host and port (must match `address` and `port` in `mcp-server.conf`).

```json
{
  "mcpServers": {
    "cloudpods-sse": {
      "url": "http://127.0.0.1:12001/sse"
    }
  }
}
```

- **Cursor**: Add a server under MCP settings and paste the URL (location may be *Settings → MCP* or project-level `.cursor/mcp.json`, depending on version).
- **Cline**: Add the same entry in MCP configuration.

If mcp-server sits behind an HTTPS reverse proxy, use `https://.../sse` and a trusted certificate in the runtime environment.

### stdio (local subprocess)

The IDE starts `mcp-server`; use this when you do not run a long-lived daemon. Adjust paths to your binary and config.

```json
{
  "mcpServers": {
    "cloudpods-stdio": {
      "type": "stdio",
      "command": "/root/cloudpods/_output/bin/mcp-server",
      "args": [
        "--log-level",
        "info",
        "--conf",
        "/etc/yunion/mcp-server/mcp-server.conf"
      ]
    }
  }
}
```

Field names for `type`, `command`, and `args` may vary by client; follow that client’s documentation. After connecting, you should see tools with the `cloudpods_` prefix.

## Authentication: Access Key and Secret Key

Most tool calls must include **AK / SK** in parameters, same as the HTTP API.

1. Sign in with a user that may create keys (console, or a `climc` session after `source` on an rc file).
2. Create credentials:

```sh
$ source /etc/yunion/rc_admin   # or the business user rc
$ climc credential-create-aksk
```

Save **access_key** and **secret**. Pass them when the model invokes tools (or inject them securely from your client).

**Security notes**

- Do not commit real AK/SK to repos, screenshots, or long-lived docs; prefer least-privilege users in production.
- Avoid pasting production secrets into untrusted models or public chats; use disposable users and keys for tests.

## Tool catalog

mcp-server exposes **15** tools: read-only queries and write operations.

| Tool | Description |
|------|-------------|
| `cloudpods_list_images` | List images |
| `cloudpods_list_networks` | List networks |
| `cloudpods_list_regions` | List regions |
| `cloudpods_list_servers` | List VM instances |
| `cloudpods_list_serverskus` | List instance types (SKUs) |
| `cloudpods_list_storages` | List storages |
| `cloudpods_list_vpcs` | List VPCs |
| `cloudpods_create_server` | Create a VM |
| `cloudpods_delete_server` | Delete a VM |
| `cloudpods_start_server` | Start a VM |
| `cloudpods_stop_server` | Stop a VM |
| `cloudpods_restart_server` | Restart a VM |
| `cloudpods_reset_server_password` | Reset VM login password |
| `cloudpods_get_server_monitor` | Query VM monitoring time series |
| `cloudpods_get_server_stats` | Query VM live stats |

Parameters and responses follow the platform API. **Replace `ak` and `sk` in the JSON samples below with your own keys** (placeholders are used in this document).

## Common parameters

- **`ak` / `sk`**: Required on almost all tools.
- **List queries**: Often support **`limit`**, **`offset`**, **`search`**, plus filters such as `os_types`, `vpc_id`, `cloudregion_id`, `status` depending on the tool.
- **Monitoring**: `start_time` / `end_time` are usually Unix timestamps in seconds; confirm against the live API for your version.

---

## Query examples

### cloudpods_list_images

**Example prompts**

- “List images, first 10 rows, OS type Linux or Windows, name contains centos.”
- “List up to 5 images, skip the first 3, Ubuntu only.”

**Typical input**

```json
{
  "ak": "<YOUR_ACCESS_KEY>",
  "sk": "<YOUR_SECRET_KEY>",
  "limit": "10",
  "offset": "0",
  "search": "",
  "os_types": "Linux,Windows"
}
```

**Sample response** (fields vary by environment)

```json
{
  "images": [],
  "query_info": {
    "count": 0,
    "limit": 10,
    "offset": 0,
    "total": 0
  },
  "summary": {
    "has_more": false,
    "returned_count": 0,
    "total_images": 0
  }
}
```

### cloudpods_list_networks

**Example prompts**

- “Under VPC (ID: vpc-default), list networks, first 5, name contains ‘prod’.”

**Typical input**

```json
{
  "ak": "<YOUR_ACCESS_KEY>",
  "sk": "<YOUR_SECRET_KEY>",
  "limit": "10",
  "offset": "0",
  "search": "",
  "vpc_id": "default"
}
```

### cloudpods_list_regions

**Example prompts**

- “List OneCloud regions whose names contain ‘North’, first 10.”

**Typical input**

```json
{
  "ak": "<YOUR_ACCESS_KEY>",
  "sk": "<YOUR_SECRET_KEY>",
  "limit": "10",
  "offset": "0",
  "search": "",
  "provider": "OneCloud"
}
```

### cloudpods_list_servers

**Example prompts**

- “List running VMs whose names contain web-server, first 5.”

**Typical input**

```json
{
  "ak": "<YOUR_ACCESS_KEY>",
  "sk": "<YOUR_SECRET_KEY>",
  "limit": "5",
  "offset": "0",
  "search": "",
  "status": ""
}
```

### cloudpods_list_serverskus

**Example prompts**

- “In region default, x86 SKUs with 1/2/4/8 vCPU and 1024–8192 MB RAM, first 10.”

**Typical input**

```json
{
  "ak": "<YOUR_ACCESS_KEY>",
  "sk": "<YOUR_SECRET_KEY>",
  "limit": "10",
  "offset": "0",
  "search": "",
  "cloudregion_ids": "default",
  "zone_ids": "",
  "cpu_core_count": "1,2,4,8",
  "memory_size_mb": "1024,2048,4096,8192",
  "providers": "OneCloud",
  "cpu_arch": "x86"
}
```

### cloudpods_list_storages

**Example prompts**

- “In default region, storages of type local, name contains system, first 10.”

**Typical input**

```json
{
  "ak": "<YOUR_ACCESS_KEY>",
  "sk": "<YOUR_SECRET_KEY>",
  "limit": "10",
  "offset": "0",
  "search": "",
  "cloudregion_ids": "default",
  "zone_ids": "",
  "providers": "OneCloud",
  "storage_types": "local",
  "host_id": ""
}
```

### cloudpods_list_vpcs

**Example prompts**

- “In region default, list VPCs, name contains ‘prod’, first 10.”

**Typical input**

```json
{
  "ak": "<YOUR_ACCESS_KEY>",
  "sk": "<YOUR_SECRET_KEY>",
  "limit": "10",
  "offset": "0",
  "search": "",
  "cloudregion_id": "default"
}
```

---

## Operation examples

### cloudpods_create_server

**Example prompts**

- “Create VM web-server-01: 2 vCPU 4G RAM, image ID and network ID below, auto-start, password and notes …”

**Typical input** (replace `image_id`, `network_id`, etc.)

```json
{
  "ak": "<YOUR_ACCESS_KEY>",
  "sk": "<YOUR_SECRET_KEY>",
  "name": "test-vm",
  "vcpu_count": "2",
  "vmem_size": "4096",
  "image_id": "<IMAGE_ID>",
  "network_id": "<NETWORK_ID>",
  "count": "1",
  "auto_start": "true",
  "password": "<INITIAL_PASSWORD>",
  "billing_type": "postpaid",
  "duration": "",
  "description": "Test VM via MCP",
  "hostname": "test-vm",
  "hypervisor": "kvm",
  "user_data": "",
  "keypair_id": "",
  "project_id": "",
  "zone_id": "",
  "region_id": "default",
  "disable_delete": "false",
  "boot_order": "cdn",
  "metadata": "{\"environment\": \"test\"}",
  "data_disks": "[{\"size\": 50, \"disk_type\": \"data\"}]",
  "secgroup_id": "",
  "secgroups": "",
  "serversku_id": ""
}
```

### cloudpods_delete_server

**Typical input**

```json
{
  "ak": "<YOUR_ACCESS_KEY>",
  "sk": "<YOUR_SECRET_KEY>",
  "server_id": "<SERVER_ID>",
  "delete_disks": "false",
  "delete_eip": "false",
  "delete_snapshots": "false",
  "override_pending_delete": "false",
  "purge": "false"
}
```

### cloudpods_start_server

```json
{
  "ak": "<YOUR_ACCESS_KEY>",
  "sk": "<YOUR_SECRET_KEY>",
  "server_id": "<SERVER_ID>",
  "auto_prepaid": "false",
  "qemu_version": ""
}
```

### cloudpods_stop_server

```json
{
  "ak": "<YOUR_ACCESS_KEY>",
  "sk": "<YOUR_SECRET_KEY>",
  "server_id": "<SERVER_ID>",
  "is_force": "false",
  "stop_charging": "false",
  "timeout_secs": "30"
}
```

### cloudpods_restart_server

```json
{
  "ak": "<YOUR_ACCESS_KEY>",
  "sk": "<YOUR_SECRET_KEY>",
  "server_id": "<SERVER_ID>",
  "is_force": "false"
}
```

### cloudpods_reset_server_password

```json
{
  "ak": "<YOUR_ACCESS_KEY>",
  "sk": "<YOUR_SECRET_KEY>",
  "server_id": "<SERVER_ID>",
  "password": "<NEW_PASSWORD>",
  "reset_password": "true",
  "auto_start": "true",
  "username": ""
}
```

### cloudpods_get_server_monitor

Time-bounded metrics (`metrics` is comma-separated; timestamps are usually Unix seconds per server convention).

```json
{
  "ak": "<YOUR_ACCESS_KEY>",
  "sk": "<YOUR_SECRET_KEY>",
  "server_id": "<SERVER_ID>",
  "metrics": "cpu_usage,mem_usage,disk_usage,net_bps_rx,net_bps_tx",
  "start_time": "1724760000",
  "end_time": "1724763600"
}
```

### cloudpods_get_server_stats

Current stats snapshot (CPU, memory, disk, network).

```json
{
  "ak": "<YOUR_ACCESS_KEY>",
  "sk": "<YOUR_SECRET_KEY>",
  "server_id": "<SERVER_ID>"
}
```

## Troubleshooting

- **`/sse` connection fails**: Confirm mcp-server is up, port and firewall, and `url` uses the right scheme (`http`/`https`).
- **Auth errors on tools**: Check AK/SK domain/project, expiry, and RBAC on resources.
- **Empty lists**: Filters may be too strict or region/project mismatch; relax `search` and filters to reproduce.

Tools and fields may change with mcp-server and platform versions; rely on your deployed binaries and APIs.
