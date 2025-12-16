---
sidebar_position: 1
---

# dns_domain Causes Virtual Machine Domain Resolution Failure

Due to historical legacy issues, versions deployed before v3.11.8 will default to setting the configuration in the virtual machine's `/etc/resolve.conf` to `search cloud.onecloud.io`.

This setting may cause domain resolution failures inside virtual machines. If this problem occurs, you can cancel the global dns_domain configuration through the following steps, so that newly created virtual machines' DNS configuration will not add the `search` configuration by default.


## Cancel Default Configuration

### 1. Cancel dns_domain Configuration in configmap

```bash
kubectl edit configmap -n onecloud default-region

# Find the configuration line dns_domain: cloud.yunion.io
...
    dns_domain: cloud.yunion.io
...
# Delete this line, save and exit directly
```

### 2. Cancel Current region Service Configuration

```bash
climc service-config-edit region2

default:
  ...
  # Also delete the dns_domain: cloud.yunion.io item
  dns_domain: cloud.yunion.io
  ...
```


### 3. Restart region Service

```bash
kubectl -n onecloud rollout restart deployment default-region
```

Then wait for the default-region pod to become Running. Create a new virtual machine and check the `/etc/resolv.conf` file. If there is no search setting inside, the configuration has taken effect.


## Impact on Existing Virtual Machines

- If the virtual machine is assigned an ip through dhcp from the platform, then making another dhcp request will modify the DNS configuration
- If the virtual machine has statically configured networking (such as managed vmware virtual machines or bare metal), manual modification is required

