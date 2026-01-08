---
sidebar_position: 4
---

# OpenStack Integration Common Questions

## When connecting to OpenStack backend using ceph storage, cloud account management often fails to synchronize related ceph disk configurations

We need to specify the related ceph type when creating disks. First, check if volume_backend_name is specified.

1. Check the ceph specified name in the cinder configuration file, add it if it doesn't exist:

```
[ceph]
volume_driver = cinder.volume.drivers.rbd.RBDDriver
rbd_pool = volumes
rbd_ceph_conf = /etc/ceph/ceph.conf
rbd_flatten_volume_from_snapshot = false
rbd_max_clone_depth = 5
rbd_store_chunk_size = 4
rados_connect_timeout = -1
glance_api_version = 2
rbd_user = cinder
rbd_secret_uuid = f4f03912-7ec7-42e9-b9ea-8735217d8cc9
volume_backend_name = ceph
```

2. Add ceph type association to volume_backend_name:

```bash
[root@cinder1 cinder]# cinder extra-specs-list
[root@cinder1 cinder]# cinder type-create ceph
+--------------------------------------+------+-------------+-----------+
| ID                                   | Name | Description | Is_Public |
+--------------------------------------+------+-------------+-----------+
| 00103a9a-bcf6-4c25-afb4-fd2a211cc706 | ceph | -           | True      |
+--------------------------------------+------+-------------+-----------+
[root@cinder1 cinder]# cinder type-key ceph set volume_backend_name=ceph
[root@cinder1 cinder]# cinder extra-specs-list
+--------------------------------------+------+---------------------------------+
| ID                                   | Name | extra_specs                     |
+--------------------------------------+------+---------------------------------+
| 00103a9a-bcf6-4c25-afb4-fd2a211cc706 | ceph | {'volume_backend_name': 'ceph'} |
+--------------------------------------+------+---------------------------------+
```

3. Re-add volume; specify the type as ceph.

4. You can resynchronize, and you can see that the disks have been synchronized.


## No Resources Synchronized After Managing OpenStack

1. Check if the account managing OpenStack is added to the project with an admin role (non-admin roles may have permission issues).

2. After excluding account permissions, check if the platform can access the OpenStack control node. Execute the following command. If the content in the screenshot appears, it is indeed a domain name resolution issue

```bash
[root@test-69-onecloud01 ~]# kubectl get pods -n onecloud |grep climc
default-climc-6fccbbfd8d-l59gg                       1/1     Running            0          4d13h
[root@test-69-onecloud01 ~]# kubectl exec -it  -n onecloud default-climc-6fccbbfd8d-l59gg bash
Welcome to Cloud Shell :-) You may execute climc and other command tools in this shell.
Please exec 'climc' to get started

bash-5.1# source <(climc cloud-provider-list --provider OpenStack | awk 'NR==4 {print $2}' | xargs climc cloud-provider-clirc)
bash-5.1# openstackcli host-list
```
![a19f70a99ed18986ac2edd60ea86be3](https://user-images.githubusercontent.com/32036395/157816747-cb7466dd-679e-4e89-bacc-c58446950bfa.png)

<!-- Solution reference [Create OpenStack Account](../../../../web_ui/multiplecloud/cloudaccount/cloudaccount/#新建openstack账号) -->

