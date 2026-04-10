---
sidebar_position: 6.7
---

# MCP Server 使用说明

本文说明如何在 Cursor、Cline 等支持 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 的客户端中连接 **Cloudpods mcp-server**，通过自然语言驱动查询与操作云资源。

部署与编译请参考 [手动部署开发集群](./single_service_dev) 中的 **MCP 服务（mcp-server）初始化**。

## 前置条件

- mcp-server 已启动，且客户端能访问其监听地址（本机 `127.0.0.1` 或改为 `0.0.0.0` 后经由网络访问）。
- 已在平台侧为用户创建 **Access Key / Secret Key**（见下文），或在对话中仅使用已脱敏的测试环境凭据。

## 客户端连接方式

源码默认以 **SSE** 方式对外提供服务（路径一般为 `/sse`）。若客户端支持 **stdio** 本地子进程方式，也可直接拉起 `mcp-server` 二进制。

### SSE（推荐，远程或本机均可）

将 `url` 换成实际地址与端口（与 `mcp-server.conf` 中 `address`、`port` 一致）。

```json
{
  "mcpServers": {
    "cloudpods-sse": {
      "url": "http://127.0.0.1:12001/sse"
    }
  }
}
```

- **Cursor**：在 MCP 设置中新增服务器，填入上述 URL（具体菜单位置随版本可能为 *Settings → MCP* 或项目级 `.cursor/mcp.json`）。
- **Cline**：在 MCP 配置中追加同名条目即可。

若 mcp-server 暴露在 HTTPS 反向代理之后，请将 `url` 改为 `https://.../sse`，并确保证书在运行环境可信。

### stdio（本机直连子进程）

由客户端启动 `mcp-server`，适用于不单独常驻进程、仅在 IDE 使用时拉起的场景。请将路径换成本机编译产物与配置文件路径。

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

各客户端对 `type`、`command`、`args` 字段名可能略有差异，请以对应文档为准。连接成功后，在工具列表中应能看到以 `cloudpods_` 为前缀的能力。

## 认证：Access Key 与 Secret Key

大模型通过 MCP 调用工具时，多数接口需在参数中携带平台 **AK / SK**，与使用 API 一致。

1. 使用具备建钥权限的用户登录（如控制台，或已 `source` 的 `climc` 环境）。
2. 创建访问密钥：

```sh
$ source /etc/yunion/rc_admin   # 或业务用户的 rc
$ climc credential-create-aksk
```

按提示保存 **access_key** 与 **secret**。在对话中让模型调用工具时传入这两项（或先在客户端安全存储，由编排层注入），即完成鉴权。

**安全建议**：

- 勿将真实 AK/SK 写入仓库、截图或长期贴在文档中；生产环境优先使用权限最小化的子用户密钥。
- 在不可信模型或公共会话中，避免粘贴生产凭据；测试可使用临时用户与可随时作废的密钥。

## 工具一览

当前 mcp-server 提供 **15** 个工具，可分为只读查询与写操作。

| 工具名 | 说明 |
|--------|------|
| `cloudpods_list_images` | 查询镜像列表 |
| `cloudpods_list_networks` | 查询网络列表 |
| `cloudpods_list_regions` | 查询区域列表 |
| `cloudpods_list_servers` | 查询虚拟机列表 |
| `cloudpods_list_serverskus` | 查询套餐（规格）列表 |
| `cloudpods_list_storages` | 查询存储列表 |
| `cloudpods_list_vpcs` | 查询 VPC 列表 |
| `cloudpods_create_server` | 创建虚拟机 |
| `cloudpods_delete_server` | 删除虚拟机 |
| `cloudpods_start_server` | 启动虚拟机 |
| `cloudpods_stop_server` | 停止虚拟机 |
| `cloudpods_restart_server` | 重启虚拟机 |
| `cloudpods_reset_server_password` | 重置虚拟机登录密码 |
| `cloudpods_get_server_monitor` | 查询虚拟机监控时序 |
| `cloudpods_get_server_stats` | 查询虚拟机实时统计 |

下文参数与返回结构继承平台 API 语义；**下列 JSON 示例中的 `ak` / `sk` 请替换为你自己的密钥**（文中用占位符表示）。

## 通用参数说明

- **`ak` / `sk`**：访问密钥，绝大多数工具必填。
- **列表类查询**：常支持 **`limit`**、**`offset`**、**`search`** 等；部分支持按资源类型过滤（如 `os_types`、`vpc_id`、`cloudregion_id`、`status` 等），具体见各工具。
- **时间类**（监控）：`start_time` / `end_time` 等一般为 Unix 时间戳（秒），请以实际接口说明为准。

---

## 查询类示例

### cloudpods_list_images

**提示语示例**

- 「查询镜像列表，前 10 条，从第 1 条开始，操作系统类型 Linux 或 Windows，名称包含 centos。」
- 「列出可用镜像，最多 5 条，跳过前 3 条，只要 Ubuntu。」

**典型入参**

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

**返回片段**（字段随环境变化）

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

**提示语示例**

- 「查询 VPC（ID: vpc-default）下网络列表，前 5 条，名称含『生产』。」

**典型入参**

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

**提示语示例**

- 「查询提供商 OneCloud 的区域，名称包含『华北』，前 10 条。」

**典型入参**

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

**提示语示例**

- 「查状态为运行中、名称含 web-server 的虚拟机，前 5 条。」

**典型入参**

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

**提示语示例**

- 「默认区域 default 下，x86、CPU 1/2/4/8 核、内存 1024–8192 MB 的套餐，前 10 条。」

**典型入参**

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

**提示语示例**

- 「默认区域下类型为 local 的存储，名称含 system，前 10 条。」

**典型入参**

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

**提示语示例**

- 「默认区域 default 下 VPC 列表，名称含『生产』，前 10 条。」

**典型入参**

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

## 操作类示例

### cloudpods_create_server

**提示语示例**

- 「创建名为 web-server-01 的虚拟机：2 核 4G，镜像 ID、网络 ID 如下，自动启动，密码与备注……」

**典型入参**（请按环境替换 `image_id`、`network_id` 等）

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

**典型入参**

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

用于按时间范围查询 CPU、内存、磁盘、网络等监控指标（`metrics` 为逗号分隔指标名；时间字段以服务端约定为准，多为 Unix 秒级时间戳）。

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

查询虚拟机当前统计快照（CPU、内存、磁盘、网络等）。

```json
{
  "ak": "<YOUR_ACCESS_KEY>",
  "sk": "<YOUR_SECRET_KEY>",
  "server_id": "<SERVER_ID>"
}
```

## 常见问题

- **连接 `/sse` 失败**：确认 mcp-server 已启动、端口与防火墙、以及 `url` 是否用了正确协议（`http`/`https`）。
- **工具报鉴权错误**：检查 AK/SK 是否属于当前域/项目、是否过期、用户是否具备对应资源权限。
- **列表为空**：多为过滤条件过严或区域/项目不一致，可先缩小 `search` 与过滤项复现。

版本迭代可能增减工具或字段，以当前 mcp-server 二进制及平台版本为准。
