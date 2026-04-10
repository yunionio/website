---
sidebar_position: 6.5
---

# Manual Deployment of MCP Server

This article explains how to manually build, configure, and run **mcp-server** on top of an existing Cloudpods control plane (or a cluster set up via [Manual Deployment of Development Cluster](./single_service_dev)). mcp-server exposes capabilities via the MCP protocol for clients such as Cursor.

## When to Use This Guide

- You already run Cloudpods on a VM or bare metal and want to run mcp-server alone for integration or intranet use
- You run from source with `make cmd/mcp-server` instead of a container image

## Prerequisites

- [Cloudpods](https://github.com/yunionio/cloudpods) backend source cloned; below we assume **/root/cloudpods** (change as needed)
- A working cluster: `climc` works and you know Keystone / API gateway URLs
- A platform account with API access (below we use a dedicated user `mcp-server-admin`)

## Environment

Same as *Manual Deployment of Development Cluster*:

- Linux or macOS
- git, make, Go (version per your branch)

## Create a Dedicated mcp-server User

mcp-server authenticates as a normal user. That user must have the **admin** role in the **system** project, consistent with upstream install docs.

```sh
# Configure climc and rc first if needed (see Manual Deployment of Development Cluster)
$ source /etc/yunion/rc_admin

$ climc user-create --enabled --password 'replace-with-strong-password' mcp-server-admin
$ climc user-join-project --role admin --project system mcp-server-admin
```

## Build mcp-server

```sh
$ cd /root/cloudpods && make cmd/mcp-server
```

The binary is usually at `/root/cloudpods/_output/bin/mcp-server`.

## Configuration

1) Create the config directory and write `mcp-server.conf`. Adjust **`auth_url`**, listen address/port, and admin credentials for your environment.

- **auth_url**: Must match how clients reach the identity API.  
  - Typical Kubernetes install: `https://<apigateway-host>:30500/v3`  
  - Manual dev cluster: often align with `OS_AUTH_URL` in `rc_admin`, e.g. `http://127.0.0.1:35357/v3` (use your actual Keystone public/admin endpoint)
- **admin_user / admin_password**: The `mcp-server-admin` user and password from the previous step
- **admin_domain / admin_project_domain**: Usually `Default`
- **admin_project**: Usually `system`
- **session_endpoint_type**: Usually `public`

```sh
$ mkdir -p /etc/yunion/mcp-server

$ cat<<'EOF' >/etc/yunion/mcp-server/mcp-server.conf
address = '127.0.0.1'
port = 12001
admin_domain = 'Default'
admin_password = 'replace-with-strong-password'
admin_project = 'system'
admin_project_domain = 'Default'
admin_user = 'mcp-server-admin'
auth_url = 'https://<apigateway-host>:30500/v3'
session_endpoint_type = 'public'

mcp_server_name = 'cloudpods-mcp-server'
mcp_server_version = '1.0.0'
mcp_server_description = 'Cloudpods MCP Server'
EOF
```

If default search paths differ from this filename, always pass **`--conf`** to this file at startup so `.yaml` vs `.conf` is unambiguous.

## Start mcp-server

```sh
$ /root/cloudpods/_output/bin/mcp-server --log-level debug --conf /etc/yunion/mcp-server/mcp-server.conf
```

For production, use **systemd** on Linux or **launchctl** on macOS as suggested at the end of *Manual Deployment of Development Cluster*.

## Verify

When healthy, the server listens on the configured `address:port` and serves MCP SSE routes. Example:

```sh
$ curl http://127.0.0.1:12001/sse
```

Change host/port if your config differs. For remote access, set `address` to `0.0.0.0` and open the port in firewall/security policy.

## Notes

- mcp-server depends on working auth and APIs; wrong `auth_url` or insufficient RBAC will prevent normal MCP operation
- If the site uses HTTPS everywhere, use an HTTPS `auth_url` and trusted certificates, same as other services
