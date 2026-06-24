---
sidebar_position: 27
edition: ce
---

# Renew k3s Cluster Certificates

This guide explains how to renew internal certificates for a k3s cluster deployed with ocboot.

:::tip
This document covers **internal k3s cluster certificates** (API Server, kubelet, and inter-component TLS). It is different from the browser HTTPS certificates described in [Replace Frontend Certificates](../fe/config-ssl-certs).
:::

## When to Use

- k3s cluster deployed with an **older version of ocboot**, where internal certificates are about to expire or have already expired
- You need to extend certificate validity to 10 years (`CATTLE_NEW_SIGNED_CERT_EXPIRATION_DAYS=3650`)

## Background

Current ocboot automatically sets `CATTLE_NEW_SIGNED_CERT_EXPIRATION_DAYS=3650` in `/etc/systemd/system/k3s.service.env` when deploying a k3s cluster, so internal certificates are valid for **10 years** and usually require no manual action.

Clusters deployed with older ocboot versions may encounter internal certificate expiration issues. Follow this guide to rotate certificates and extend validity to 10 years.

## Notes

- Run during a **maintenance window**; control plane nodes will be briefly unavailable during rotation
- Order of operations: **update all control plane (server) nodes first, then worker (agent) nodes**
- In HA clusters, run the server certificate script on **every** control plane node
- Scripts must be run from a management machine that can SSH to all nodes; see manual steps below if remote SSH is not available

## Using ocboot Scripts (Recommended)

ocboot provides two helper scripts in the `scripts/` directory (since v4.0.3):

| Script | Target Nodes | Description |
|--------|--------------|-------------|
| [`renew-k3s-server-certs.sh`](https://github.com/yunionio/ocboot/blob/master/scripts/renew-k3s-server-certs.sh) | control plane | Sets certificate expiration env var, runs `k3s certificate rotate`, and restarts k3s |
| [`renew-k3s-agent-certs.sh`](https://github.com/yunionio/ocboot/blob/master/scripts/renew-k3s-agent-certs.sh) | worker | Restarts k3s-agent so it picks up new certificates from the server |

### 1. Renew Control Plane Certificates

On a management machine, go to the `scripts` directory in the ocboot repo and run against all control plane nodes:

```bash
$ cd ocboot/scripts

# Single node
$ ./renew-k3s-server-certs.sh 10.0.0.1

# Specify SSH user and port
$ ./renew-k3s-server-certs.sh 10.0.0.1 root 22

# HA cluster: pass multiple control plane nodes at once
$ ./renew-k3s-server-certs.sh "10.0.0.1 10.0.0.2 10.0.0.3"
```

On each node, the script will:

1. Verify the `k3s` service exists
2. Set `CATTLE_NEW_SIGNED_CERT_EXPIRATION_DAYS=3650` in `/etc/systemd/system/k3s.service.env`
3. Stop the `k3s` service
4. Run `k3s certificate rotate`
5. Reload systemd and start the `k3s` service

### 2. Update Worker Nodes

After all control plane nodes are updated and verified, run on all worker nodes:

```bash
$ ./renew-k3s-agent-certs.sh 10.0.0.10

# Multiple worker nodes
$ ./renew-k3s-agent-certs.sh "10.0.0.10 10.0.0.11 10.0.0.12"
```

On each worker node, the script stops and restarts the `k3s-agent` service so the agent fetches the rotated certificates from the control plane.

:::info
`renew-k3s-agent-certs.sh` currently only restarts the `k3s-agent` service; it does not run `k3s certificate rotate` on agent nodes. Agent certificates are updated automatically after server rotation when the agent is restarted.
:::

## Manual Steps

If you cannot SSH to nodes from a management machine, log in to each node and run the commands manually.

### Control Plane Nodes

```bash
# 1. Set certificate expiration environment variable
$ K3S_SERVICE_ENV="/etc/systemd/system/k3s.service.env"
$ if [ -f "${K3S_SERVICE_ENV}" ]; then
    if grep -q "^CATTLE_NEW_SIGNED_CERT_EXPIRATION_DAYS=" "${K3S_SERVICE_ENV}"; then
      sed -i 's/^CATTLE_NEW_SIGNED_CERT_EXPIRATION_DAYS=.*/CATTLE_NEW_SIGNED_CERT_EXPIRATION_DAYS=3650/' "${K3S_SERVICE_ENV}"
    else
      echo "CATTLE_NEW_SIGNED_CERT_EXPIRATION_DAYS=3650" >> "${K3S_SERVICE_ENV}"
    fi
  else
    echo "CATTLE_NEW_SIGNED_CERT_EXPIRATION_DAYS=3650" > "${K3S_SERVICE_ENV}"
  fi

# 2. Stop k3s and rotate certificates
$ systemctl stop k3s
$ k3s certificate rotate

# 3. Restart k3s
$ systemctl daemon-reload
$ systemctl start k3s
```

### Worker Nodes

```bash
$ systemctl stop k3s-agent
$ systemctl start k3s-agent
```

## Verification

Confirm services are running on each node:

```bash
# Control plane nodes
$ systemctl is-active k3s
active

# Worker nodes
$ systemctl is-active k3s-agent
active
```

Confirm all cluster nodes are Ready:

```bash
$ kubectl get nodes
NAME                 STATUS   ROLES                  AGE   VERSION
control-plane-1      Ready    control-plane,master   1y    v1.28.5+k3s1
worker-1             Ready    <none>                 1y    v1.28.5+k3s1
```

Optional: check API Server certificate expiration:

```bash
$ openssl x509 -in /var/lib/rancher/k3s/server/tls/serving-kube-apiserver.crt -noout -dates
notBefore=Jun 24 00:00:00 2025 GMT
notAfter=Jun 22 00:00:00 2035 GMT
```

## Troubleshooting

If a service fails to start, check the logs:

```bash
# Control plane nodes
$ journalctl -u k3s -n 50

# Worker nodes
$ journalctl -u k3s-agent -n 50
```
