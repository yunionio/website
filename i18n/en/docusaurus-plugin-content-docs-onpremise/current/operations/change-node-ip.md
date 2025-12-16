---
sidebar_position: 24
---

# Change Node IP

Introduction to methods and steps for changing control node and compute node IPs in environments deployed using ocboot.

Since Kubernetes node IPs cannot be changed dynamically, after changing, the Kubelet service must be redeployed. Therefore, after changing the node IP, you need to reset the Kubelet instance on the node and redeploy the node.

The following discusses several cases:

## AllInOne Node Change IP

### 1. Clean Node Environment

import OcbootUninstall from '@site/src/components/OcbootUninstall'

<OcbootUninstall />

### 2. Modify Old config.yml

:::warning
- If the first deployment was directly running `ocboot.sh run.py <full|cmp|virt> ` this way, the generated configuration file is the config-allinone-current.yml file in the ocboot directory
- If the first deployment used a custom configuration file, please use the relevant configuration file
:::


The following assumes the first deployment command was in the form `ocboot.sh run.py $ip`, so the generated configuration file is the config-allinone-current.yml file in the ocboot directory.

The config-allinone-current.yml configuration file used during deployment is saved in the ocboot directory when first run. Backup this yaml file and modify it, replacing the old IP address with the new IP address.

```bash
$ cp ./config-allinone-current.yml config.yml
$ vim config.yml
# Modify the node ip addresses inside, including hostname and controlplane_host under primary_master_node
# If mariadb was deployed on this node at that time, also modify hostname in mariadb_node and db_host in primary_master_node
```


### 3. Redeploy

Use ocboot to redeploy AllInOne node

```
$ ./ocboot.sh install config.yml
```

## Private Cloud Compute Node Change IP

The process for compute node IP change is the same as AllInOne, but you need to delete and clean the node information on the control node, including k8s node information and cloud platform host information. After deletion is clean, run the above command to reset the compute node's Kubernetes. The process is as follows:

### 1. Clean Kubelet

The following command runs on the compute node to clean the K3s or K8s runtime environment on the node.

<OcbootUninstall />

### 2. Delete node Information

The following command runs on the control node

```bash
# Assuming the node to delete is node1
$ nodename=node1
$ kubectl delete node $nodename
```

### 3. Use ocboot to Rejoin Node

```bash
$ ./ocboot.sh add-node $primary_master_ip $target_node_ip
```

## FAQ

### 1. Compute node host service runs abnormally or the platform's corresponding host record status is unknown. How to view the compute node's host service logs?

```bash
# First determine the node name of the problematic compute node in the current k8s
$ kubectl get nodes
NAME                       STATUS   ROLES    AGE    VERSION          INTERNAL-IP       EXTERNAL-IP
ceph-01                    Ready    <none>   127d   v1.15.12         192.168.222.111   <none>
ceph-02                    Ready    <none>   127d   v1.15.12         192.168.222.112   <none>


# For example, now to view host service logs on ceph-02, the command is as follows
$ kubectl logs -n onecloud $(kubectl get pods -n onecloud -o wide | grep host | egrep -v 'image|deployer' | grep ceph-02 | awk '{print $1}') -c host
# Then view the corresponding error logs in the host service
```

- If log error information contains "register failed: try create network: find_matched == false", it means the IP subnet containing the host was not successfully created, causing host registration to fail. Please create an IP subnet containing the host network segment.
- If log error information contains "name starts with letter, and contains letter, number and - only", it means the host's hostname is non-compliant and should be changed to a hostname starting with a letter


