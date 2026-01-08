---
sidebar_position: 1
---

# Common Pod Operations Commands

Introduction to how to restart component services, view component logs, etc.

## View Component Pod Running Status

System components all run in the form of k8s pods. Use the following commands to view platform system components and their running status, etc.

-n means namespace. Currently our services are all deployed in the onecloud namespace. View running status of all component pods:

```bash
$ kubectl get pods -n onecloud 
```

-o wide to view more detailed information about pods, such as which node they are running on

```bash
$ kubectl get pods -n onecloud -o wide
```

View detailed information of specified pod resources, such as viewing detailed information of the region component's pod

```bash
$ kubectl describe pods -n onecloud default-region-759b4bff4c-hpmdd
```

View all pod information running on a specified host

```bash
$ kubectl get pods -n onecloud -o wide --field-selector=spec.nodeName=<host-name>
```
### Restart Component Services

```bash
# Restart host service, such as deleting all host pods
$ kubectl -n onecloud delete pods default-host-xxxxx

$ kubectl rollout restart daemonset -n onecloud default-host

# Restart web service
$ kubectl rollout restart deployment -n onecloud default-web

# Restart all pods in onecloud namespace
$ kubectl get pods -n onecloud | awk '{print $1}' | xargs kubectl delete pods -n onecloud

# Restart all services, platform services all start with default
$ kubectl get deployment -n onecloud |grep default | awk '{print $1}' | xargs kubectl rollout restart deployment -n onecloud

# Restart all pods in onecloud namespace
$ kubectl get deployment -n onecloud | awk '{print $1}' | xargs kubectl rollout restart deployment -n onecloud

```

### Update Service Configuration and Restart Service

All platform component services have corresponding Configmaps files to save service configuration. When configuration information needs to be changed, you can update service configuration and make it take effect through the following steps.

```bash
# Take region service as an example to update its configmaps configuration information
$ kubectl edit configmaps default-region -n onecloud
```
```bash
# After modification is complete, restart the service
$ kubectl -n onecloud rollout restart deployment default-region

```
### View Service Logs

For viewing persistent service logs, please refer to: [View Service Logs via Grafana and Loki](../log/backendlogs).

Take the region component as an example to introduce how to view region component log information.
```bash
# First need to find the pod where the region service is located
$ kubectl get pods -n onecloud |grep region
```
```bash
# View region service container logs, where -f means follow, i.e., continuously output logs, similar to journalctl's -f; --since 5m means view log information from the last 5 minutes. Press CTRL+C to exit log output
$ kubectl logs -n onecloud $region_pod_name -f --since 5m
```
```bash
# View region container logs, save all logs from the last 5 minutes to region.log
$ kubectl logs -n onecloud $region_pod_name --since 5m > region.log
```
```bash
# If some services have two containers, such as host service has containers named host and host-image, when viewing container logs, you need to add '-c' to specify which container's logs to view
$ kubectl logs -n onecloud $host_pod_name -c host-image -f
```


### View Platform Version Information
```bash
# Where onecloudcluster can be abbreviated as oc; default is the name of OneCloudCluster; -o yaml means output the API object of onecloudcluster type resource in yaml format.
$ kubectl get onecloudcluster -n onecloud default -o yaml | grep version
```
### View MySQL Account Password Information

Using the default database deployment method, after platform deployment is complete, you need to obtain the username and password to connect to MySql through the following command.

```bash
# View MySQL configuration connection information, where oc is onecloudcluster; default is the name of oc; grep -A 4 means output 4 lines of data after matching.
$ kubectl get oc -n onecloud default -o yaml | grep -A 4 mysql
```
### View OC API Object Information

```bash
# View OC running status
$ kubectl get onecloudcluster -n onecloud
```
```bash
# View OC API object information in yaml file format, this information contains all configuration information of the cluster.
$ kubeclt get oc -n onecloud -o yaml

```

### Other Common Management Commands

For more kubectl commands, please refer to kubectl official documentation.
https://kubernetes.io/zh/docs/reference/kubectl/



