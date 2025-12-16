---
sidebar_position: 5
---

# Adjust Kubernetes Node Eviction Threshold

Kubernetes has a node eviction mechanism. For example, when the node's root partition usage exceeds 85%, it will change the node to NotReady status and then evict Pods on it. The following introduces how to adjust the node's related configuration thresholds, which can be appropriately adjusted according to your environment.

## Adjust kubelet Threshold Configuration

All kubelet configuration parameters are written in the file `/var/lib/kubelet/config.yaml`. Threshold-related parameters are as follows:

```diff
@@ -34,10 +34,10 @@ enforceNodeAllocatable:
 eventBurst: 10
 eventRecordQPS: 5
 # Eviction related parameters
 evictionHard:
-  imagefs.available: 15%
-  memory.available: 1024Mi
-  nodefs.available: 15%
-  nodefs.inodesFree: 15%
+  imagefs.available: 5%  # Trigger when free capacity of container image directory is less than 5%, imagefs is docker directory, configured as `/opt/docker`
+  memory.available: 100Mi # Trigger when memory is less than 100Mi
+  nodefs.available: 5% # Trigger when root partition available capacity is less than 5%
+  nodefs.inodesFree: 5% # Trigger when root partition inodes is less than 5%
 evictionPressureTransitionPeriod: 5m0s
 failSwapOn: true
 fileCheckFrequency: 20s
@@ -45,8 +45,8 @@ hairpinMode: promiscuous-bridge
 healthzBindAddress: 127.0.0.1
 healthzPort: 10248
 httpCheckFrequency: 20s
-imageGCHighThresholdPercent: 85
-imageGCLowThresholdPercent: 80
+imageGCHighThresholdPercent: 95 # When disk storage usage exceeds imageGCHighThresholdPercent, Image GC will be triggered until disk storage usage is below imageGCLowThresholdPercent
+imageGCLowThresholdPercent: 90
 imageMinimumGCAge: 2m0s
 iptablesDropBit: 15
 iptablesMasqueradeBit: 14
```

After adjusting `/var/lib/kubelet/config.yaml`, restart kubelet:

```bash
$ systemctl restart kubelet
```



