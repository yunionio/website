---
sidebar_position: 6
---

# Pause Cluster Services

During cluster maintenance operations, such as maintaining cluster databases, etc., it is necessary to pause cluster services. This article introduces methods to pause platform services without affecting normal virtual machine operation.

## Stop Services

Platform services are managed by operator. You can stop most control services by adding the '-stop-services' startup parameter to operator. In order not to affect normal virtual machine operation, some control services should continue running, such as: default-ovn-north, default-influxdb and default-host.

```bash
$ kubectl edit deployment -n onecloud onecloud-operator
  template:
    metadata:
      creationTimestamp: null
      labels:
        k8s-app: onecloud-operator
    spec:
      containers:
      - command:
        - /bin/onecloud-controller-manager
        - -stop-services # Change this place, add '-stop-services' parameter
```

Then operator will rebuild and start deleting control services. The pods that are finally retained are as follows:

```bash
$ kubectl get pods -n onecloud
NAME                                 READY   STATUS    RESTARTS   AGE
default-etcd-swbzmncg2x              1/1     Running   0          16d
default-host-xqwr6                   3/3     Running   0          19h
default-influxdb-7476dbb84c-6qhqm    1/1     Running   0          10d
default-ovn-north-67b97ffcfd-54lvp   1/1     Running   0          10d
onecloud-operator-6967685b4-6p2qx    1/1     Running   0          80s
```


## Restore Services

Delete the '-stop-services' startup parameter in the onecloud-operator deployment command, and operator will rebuild the previously deleted services.

```bash
$ kubectl edit deployment -n onecloud onecloud-operator
```



