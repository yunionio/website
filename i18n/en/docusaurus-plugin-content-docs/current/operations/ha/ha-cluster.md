---
sidebar_position: 1
---

# High Availability Cluster

Introduction to maintaining high availability clusters

## Active Switching of High Availability VIP

High availability clusters use Keepalived to maintain master-slave node switching. Normally, the VIP is on the master node, and the master node provides services. When the master node goes down, it will automatically switch to the standby node, and the standby node provides services.

In daily operations, there are situations where active master-slave node switching is needed, such as when performing shutdown maintenance tasks on the master node.

You can actively implement master-slave switching by modifying and lowering the master node's keepalived priority and restarting the keepalived instance.

The keepalived configuration file for control service VIP switching is located at /etc/kubernetes/manifests/keepalived.yaml

The keepalived configuration file for database service VIP switching is located at /etc/keepalived/keepalived.conf

The keepalived configuration file for EIP gateway VIP switching is located at /etc/keepalived/eipgw.conf

## High Availability Node Offline Maintenance Steps

1. If there is a VIP, actively switch the VIP to the standby node
2. If there are virtual machines, migrate virtual machines to other hosts
3. Evict containers from this node

```bash
kubectl cordon <node>
```

4. Set kubelet, docker and other services to not start automatically

```bash
systemctl disable kubelet docker keepalived maraidb
```

5. Stop containers

```bash
docker stop
```

6. Stop all services

```bash
systemctl stop kubelet docker keepalived maraidb
```

7. Maintain the node

## High Availability Node Recovery Online Steps

1. If there is a database, start the database first

```bash
systemctl start mariadb
```

2. Check database master-slave sync status

```bash
show slave status\G
```

If there are problems, you need to prioritize solving database master-slave sync issues.

3. Start docker

```bash
systemctl start docker
```

4. Start kubelet

```bash
systemctl start kubelet
```

5. If keepalived priority was modified, restore keepalived priority. Start keepalived

```bash
systemctl start keepalived
```

6. Restore Kubernetes scheduling

```bash
kubectl uncordon <node>
```

7. Restore automatic startup for the above services

```bash
systemctl enable kubelet docker keepalived maraidb
```

