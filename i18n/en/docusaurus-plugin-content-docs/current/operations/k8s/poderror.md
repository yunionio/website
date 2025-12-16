---
sidebar_position: 2
---

# Troubleshoot Pod Abnormalities

Troubleshoot errors based on pod status.

## Confirm Pod Status

```bash
# Set default namespace, subsequent related commands can omit "-n onecloud"
$ kubectl config set-context --current --namespace=onecloud

# View pod status
$ kubectl get pod
```

## Check Pod Related Events

When you see pod status is not running, you can view more information through the describe command.

```bash
# Example is to view event information of host service's pod
$ kubectl describe pod default-host-z8j5r
```

## View Logs

You can check logs to see if the application is running normally.

```bash
# View host service log information
$ kubectl logs default-host-z8j5r -c host -f 
```

## Common Pod Errors and Handling Methods

### CrashLoopBackOff Status

CrashLoopBackOff status indicates the container once started but exited abnormally. At this time, you can first check the container logs. Through kubectl logs command, you can find some reasons for container exit:

- Found through viewing logs that it was caused by dirty data
```bash
[root@test ~]#kubectl get pod | grep region
default-region-75bc7d474f-rjpkm 0/1
CrashLoopBackOff 12 2d20h
default-region-dns-88s7z 1/1 Running
0 2d20h
[root@test ~]# kubectl logs default-region-75bc7d474f-rjpkm | less
[I 200618 16:13:32
appsrv.(*Application).ServeHTTP(appsrv.go:237)]
hlgxXm4i2qF10tkBXu3rAVrCC-w= 200 b5e0b2 GET
/networks?admin=true&delete=all&details=true&filter.0=updated_at.
ge%28%272020-06-
03+07%3A56%3A04%27%29&filter.1=manager_id.isnullorempty%28%29&fil
ter.2=external_id.isnullorempty%28%29&limit=1024&offset=0&order=a
sc&order_by.0=updated_at&pending_delete=all (10.105.232.12:55236)
34.50ms
[F 200618 16:13:32 models.(*SGuest).GetDriver(guests.go:557)]
Unsupported hypervisor Aliyun
```

- Format error in corresponding configuration file in pod

![](./images/configmaperror.png)

### Evicted Status

This situation mostly occurs when system memory or disk resources are insufficient. View abnormal pod through "kubectl describe command".

```bash
[root@test-interface ~]# kubectl describe -n onecloud pod default-ovn-north-7689f47894-tqp2g
Name:           default-ovn-north-7689f47894-tqp2g
Namespace:      onecloud
Priority:       0
Node:           test-interface/
Start Time:     Fri, 20 Mar 2020 18:38:27 +0800
Labels:         app=ovn-north
                app.kubernetes.io/component=ovn-north
                app.kubernetes.io/instance=onecloud-cluster-8p2p
                app.kubernetes.io/managed-by=onecloud-operator
                app.kubernetes.io/name=onecloud-cluster
                pod-template-hash=7689f47894
Annotations:    cni.projectcalico.org/podIP: 10.40.180.212/32
                onecloud.yunion.io/last-applied-configuration:
                  {"volumes":[{"name":"certs","secret":{"secretName":"default-certs","items":[{"key":"ca.crt","path":"ca.crt"},{"key":"service.crt","path":"...
Status:         Failed
Reason:         Evicted
Message:        The node was low on resource: ephemeral-storage. Container ovn-north was using 109956Ki, which exceeds its request of 0.
```
### ImagePullBackOff Status

Usually caused by incorrect image name configuration or incorrect private image key configuration. View abnormal pod through "kubectl describe command".

```bash
Events:
  Type     Reason     Age                From                Message
  ----     ------     ----               ----                -------
  Normal   Scheduled  35s                default-scheduler   Successfully assigned onecloud/default-region-85ff9dcd5-mh8cl to yunion320
  Normal   Pulling    34s                kubelet, yunion320  Pulling image "registry.cn-beijing.aliyuncs.com/yunionio/region:v3.2.1"
  Normal   Pulled     33s                kubelet, yunion320  Successfully pulled image "registry.cn-beijing.aliyuncs.com/yunionio/region:v3.2.1"
  Normal   Created    33s                kubelet, yunion320  Created container init
  Normal   Started    33s                kubelet, yunion320  Started container init
  Normal   Pulling    15s (x2 over 28s)  kubelet, yunion320  Pulling image "registry.cn-beijing.aliyuncs.com/yunionio/region:v3.2.2"
  Warning  Failed     15s (x2 over 28s)  kubelet, yunion320  Failed to pull image "registry.cn-beijing.aliyuncs.com/yunionio/region:v3.2.2": rpc error: code = Unknown desc = Error response from daemon: manifest for registry.cn-beijing.aliyuncs.com/yunionio/region:v3.2.2 not found: manifest unknown: manifest unknown
  Warning  Failed     15s (x2 over 28s)  kubelet, yunion320  Error: ErrImagePull
  Normal   BackOff    3s                 kubelet, yunion320  Back-off pulling image "registry.cn-beijing.aliyuncs.com/yunionio/region:v3.2.2"
  Warning  Failed     3s                 kubelet, yunion320  Error: ImagePullBackOff
```

### Pending Status

Pending status means the Pod's yaml file has been submitted to Kubernetes, and the API object has been created and saved in Etcd. However, some containers in this Pod cannot be successfully created for some reason.

- Scheduling unsuccessful (you can view current Pod events through kubectl describe pod command, then determine why it was not scheduled).
- Possible reasons: Insufficient resources (all Nodes in the cluster do not meet the CPU, memory, GPU and other resources requested by this Pod);
- HostPort is already occupied (usually recommended to use Service to expose service ports).

### Error Status

Usually Error status indicates an error occurred during Pod startup. Common reasons include:

- Dependent ConfigMap, Secret or PV, etc. do not exist;
- Requested resources exceed limits set by administrators, such as exceeding LimitRange, etc.;
- Violate cluster security policies, such as violating PodSecurityPolicy, etc.;
- Container does not have permission to operate resources within the cluster, such as after enabling RBAC, need to configure role bindings for ServiceAccount;



