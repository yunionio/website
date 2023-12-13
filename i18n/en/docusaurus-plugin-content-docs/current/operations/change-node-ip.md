---
sidebar_position: 24
---

# Changing Node IP

This article introduces the method to change the IP of the control node and compute node in the environment deployed with ocboot.

Since Kubernetes node IP cannot be changed dynamically, the Kubelet service must be re-deployed after the IP is changed. Therefore, after changing the node IP, the Kubelet instance on the node needs to be reset, and the node needs to be re-deployed.

It is discussed below in a few scenarios.

## AllInOne Node IP Replacement

### 1. Resetting Kubelet

```bash
$ ocadm reset -f
$ kubeadm reset -f
```

### 2. Modify the old `config.yml`

:::warning
- If the first deployment is directly run in the form of `./run.py $ip`, the configuration file generated is the `config-allinone-current.yml` file in the `ocboot` directory.
- If a custom configuration file was used for the first deployment, use the relevant configuration file.
:::

Assuming the command that was run for the first deployment was `./run.py <full|cmp|virt>`, the generated configuration file is the `config-allinone-current.yml` file in the `ocboot` directory.

When running for the first time, `config-allinone-current.yml` was saved in the `ocboot` directory, which was used for deployment. Back up the yaml file and modify the file to replace the old IP address with the new IP address.

```bash
$ cp ./config-allinone-current.yml config.yml
$ vim config.yml
# Modify the IP address in the file, including the hostname under primary_master_node, controlplane_host
# If mariadb was also on the node at the time of deployment, the hostname in mariadb_node and db_host in primary_master_node should also be modified
```


### 3. Redeploy

Redeploy AllInOne node using ocboot

```
$ ./ocboot.py install config.yml
```

## Replace Node IP for Private Cloud Compute

The process of replacing the IP of a compute node is the same as that of AllInOne, but the information of the node needs to be deleted and cleaned up on the control node, including the k8s node information and the cloud platform host information. After deletion, run the above command to reset the node's Kubenetes. The process is as follows:

### 1. Resetting Kubelet

The following command is run on the compute node to clear the kubelet on the node.

```bash
$ ocadm reset -f
$ kubeadm reset -f
```

### 2. Delete the node information

Run the following command on the control node:

```bash
# Assuming the node to be deleted is node1
$ nodename=node1
$ kubectl delete node $nodename
```

### 3. Rejoin the node using ocboot

```bash
$ ./ocboot.py add-node $primary_master_ip $target_node_ip
```

## FAQ

### 1. If the host service on the compute node runs abnormally or the status of the corresponding host in the platform is unknown, how can I view the log of the host service on the compute node?

```bash
# First, determine the name of the node where the problematic compute node is located within the current Kubernetes cluster.
$ kubectl get nodes
NAME                       STATUS   ROLES    AGE    VERSION          INTERNAL-IP       EXTERNAL-IP
ceph-01                    Ready    <none>   127d   v1.15.12         192.168.222.111   <none>
ceph-02                    Ready    <none>   127d   v1.15.12         192.168.222.112   <none>

# For example, if you want to view the host service log on ceph-02, use the following command
$ kubectl logs -n onecloud $(kubectl get pods -n onecloud -o wide | grep host | egrep -v 'image|deployer' | grep ceph-02 | awk '{print $1}') -c host
# Then check the corresponding error log in the host service
```

- If the error message in the log contains "register failed: try create network: find_matched == false", it means that the IP subnet containing the host machine was not successfully created, resulting in the host machine registration failure. Please create an IP subnet that includes the host machine network segment.
- If the error message in the log contains "name starts with letter, and contains letter, number and - only", it means that the hostname of the host machine is not compliant and should be changed to a hostname starting with a letter.
