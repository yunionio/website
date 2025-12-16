---
sidebar_position: 5
---

# Metrics

| kind      | metric                                         | Description                 |
|-----------|------------------------------------------------|-----------------------------|
| usage     | all.bucket_bytes                               | Object storage capacity                |
| usage     | all.bucket_objects                             | Object storage file count              |
| usage     | all.buckets                                    | Storage bucket count                 |
| usage     | all.cpu_commit_rate.running                    | CPU overcommit ratio for running VMs        |
| usage     | all.disks                                      | Total disk capacity                 |
| usage     | all.disks.mounted                              | Total mounted disk capacity              |
| usage     | all.disks.unmounted                            | Total unmounted disk capacity             |
| usage     | all.disks.unready                              | Disk capacity in abnormal state             |
| usage     | all.eip                                        | Total EIP and public IP count         |
| usage     | all.eip.floating_ip                            | Total EIP capacity              |
| usage     | all.eip.floating_ip.used                       | Used EIP count          |
| usage     | all.eip.public_ip                              | Total public IP capacity                |
| usage     | all.eip.used                                   | Used EIP and public IP count     |
| usage     | all.memory_commit_rate.running                 | Memory overcommit ratio for running VMs         |
| usage     | all.nics                                       | Total allocated IP capacity               |
| usage     | all.nics.guest                                 | VM allocated IP count             |
| usage     | all.nics.host                                  | Host allocated IP count             |
| usage     | all.nics.lb                                    | Load balancer allocated IP count            |
| usage     | all.nics.reserve                               | Reserved IP count                |
| usage     | all.nics.guest.pending_delete                  | VM allocated IP count in recycle bin         |
| usage     | all.nics.netif                                 | Virtual NIC allocated IP count            |
| usage     | all.nics.eip                                   | Allocated EIP count              |
| usage     | all.nics.db                                    | RDS instance allocated IP count           |
| usage     | domain.nics                                    | Current domain total allocated IP capacity            |
| usage     | domain.nics.guest                              | Current domain VM allocated IP count          |
| usage     | domain.nics.host                               | Current domain host allocated IP count          |
| usage     | domain.nics.lb                                 | Current domain load balancer allocated IP count         |
| usage     | domain.nics.reserve                            | Current domain reserved IP count             |
| usage     | domain.nics.guest.pending_delete               | Current domain VM allocated IP count in recycle bin      |
| usage     | domain.nics.netif                              | Current domain virtual NIC allocated IP count         |
| usage     | domain.nics.eip                                | Current domain allocated EIP count           |
| usage     | domain.nics.db                                 | Current domain RDS instance allocated IP count        |
| usage     | all.pending_delete_servers                     | Recycle bin VM count             |
| usage     | all.pending_delete_servers.cpu                 | Recycle bin VM CPU count          |
| usage     | all.pending_delete_servers.disk                | Recycle bin VM disk capacity            |
| usage     | all.pending_delete_servers.ha                  | Recycle bin HA VM count           |
| usage     | all.pending_delete_servers.ha.cpu              | Recycle bin HA VM CPU count       |
| usage     | all.pending_delete_servers.ha.disk             | Recycle bin HA VM disk capacity         |
| usage     | all.pending_delete_servers.ha.memory           | Recycle bin HA VM memory capacity         |
| usage     | all.pending_delete_servers.isolated_devices    | Recycle bin VM GPU card count          |
| usage     | all.pending_delete_servers.memory              | Recycle bin VM memory capacity            |
| usage     | all.ports                                      | Total IP capacity                  |
| usage     | all.ports.eip                                  | EIP type IP total capacity             |
| usage     | all.ports_exit                                 | External IP total capacity                |
| usage     | all.ports_exit.eip                             | EIP type external IP total capacity           |
| usage     | all.ready_servers                              | Shutdown state VM count             |
| usage     | all.ready_servers.cpu                          | Shutdown state VM CPU count          |
| usage     | all.ready_servers.disk                         | Shutdown state VM disk capacity           |
| usage     | all.ready_servers.ha                           | Shutdown state HA VM count          |
| usage     | all.ready_servers.ha.cpu                       | Shutdown state HA VM CPU count      |
| usage     | all.ready_servers.ha.disk                      | Shutdown state HA VM disk capacity        |
| usage     | all.ready_servers.ha.memory                    | Shutdown state HA VM memory capacity        |
| usage     | all.ready_servers.isolated_devices             | Shutdown state VM GPU card count        |
| usage     | all.ready_servers.memory                       | Shutdown state VM memory capacity          |
| usage     | all.running_servers                            | Running state VM count            |
| usage     | all.running_servers.cpu                        | Running state VM CPU count         |
| usage     | all.running_servers.disk                       | Running state VM disk capacity          |
| usage     | all.running_servers.ha                         | Running state HA VM count         |
| usage     | all.running_servers.ha.cpu                     | Running state HA VM CPU count     |
| usage     | all.running_servers.ha.disk                    | Running state HA VM disk capacity       |
| usage     | all.running_servers.ha.memory                  | Running state HA VM memory capacity       |
| usage     | all.running_servers.isolated_devices          | Running state VM GPU card count        |
| usage     | all.running_servers.memory                     | Running state VM memory capacity          |
| usage     | all.servers                                    | VM count                 |
| usage     | all.servers.cpu                                | VM CPU count              |
| usage     | all.servers.disk                               | VM disk capacity               |
| usage     | all.servers.ha                                 | HA VM count              |
| usage     | all.servers.ha.cpu                             | HA VM CPU count           |
| usage     | all.servers.ha.disk                            | HA VM disk capacity            |
| usage     | all.servers.ha.memory                          | HA VM memory capacity            |
| usage     | all.servers.isolated_devices                   | VM GPU card count             |
| usage     | all.servers.memory                             | VM memory capacity               |
| usage     | all.snapshot                                   | Snapshot count                  |
| usage     | baremetals                                    | Bare metal server count              |
| usage     | baremetals.cpu                                 | Bare metal server CPU count           |
| usage     | baremetals.memory                              | Bare metal server memory capacity            |
| usage     | bucket_bytes                                   | Current project object storage capacity            |
| usage     | bucket_objects                                 | Current project object storage file count          |
| usage     | buckets                                        | Current project storage bucket count             |
| usage     | disks                                          | Current project disk capacity              |
| usage     | disks.mounted                                  | Current project mounted disk capacity          |
| usage     | disks.unmounted                                | Current project unmounted disk capacity          |
| usage     | disks.unready                                  | Current project disk capacity in abnormal state         |
| usage     | eip                                            | Current project total EIP and public IP count     |
| usage     | eip.floating_ip                                | Current project total EIP capacity          |
| usage     | eip.floating_ip.used                           | Current project used EIP count      |
| usage     | eip.public_ip                                  | Current project total public IP capacity            |
| usage     | eip.used                                       | Current project used EIP and public IP count |
| usage     | enabled_hosts                                  | Enabled host count              |
| usage     | enabled_hosts.cpu                              | Enabled host CPU count           |
| usage     | enabled_hosts.cpu.virtual                      | Enabled host CPU virtual count         |
| usage     | enabled_hosts.memory                           | Enabled host memory capacity            |
| usage     | enabled_hosts.memory.virtual                   | Enabled host memory virtual capacity          |
| usage     | hosts                                          | Total host count                 |
| usage     | hosts.cpu                                      | Total host CPU core count (excluding reserved CPU cores) |
| usage     | hosts.cpu.virtual                              | Total host CPU core virtual capacity          |
| usage     | hosts.cpu.total                                | Total host CPU core count            |
| usage     | hosts.memory                                   | Host memory capacity (excluding reserved memory capacity)     |
| usage     | hosts.memory.virtual                           | Host memory virtual capacity             |
| usage     | hosts.memory.total                             | Total host memory capacity              |
| usage     | isolated_devices                               | Total GPU card capacity                |
| usage     | networks                                       | Total IP subnet capacity                |
| usage     | nics                                           | Current project total allocated IP capacity           |
| usage     | nics.guest                                     | Current project VM allocated IP count         |
| usage     | nics.lb                                        | Current project load balancer allocated IP count        |
| usage     | nics.reserve                                   | Current project reserved IP count            |
| usage     | nics.guest.pending_delete                      | Current project VM allocated IP count in recycle bin     |
| usage     | nics.eip                                       | Current project allocated EIP count          |
| usage     | nics.db                                        | Current project RDS instance allocated IP count       |
| usage     | pending_delete_servers                          | Current project recycle bin VM count          |
| usage     | pending_delete_servers.cpu                     | Current project recycle bin VM CPU count      |
| usage     | pending_delete_servers.disk                    | Current project recycle bin VM disk capacity        |
| usage     | pending_delete_servers.ha                      | Current project recycle bin HA VM count       |
| usage     | pending_delete_servers.ha.cpu                  | Current project recycle bin HA VM CPU count   |
| usage     | pending_delete_servers.ha.disk                 | Current project recycle bin HA VM disk capacity     |
| usage     | pending_delete_servers.ha.memory               | Current project recycle bin HA VM memory capacity     |
| usage     | pending_delete_servers.isolated_devices        | Current project recycle bin VM GPU card count      |
| usage     | pending_delete_servers.memory                  | Current project recycle bin VM memory capacity        |
| usage     | ports                                          | Current project total IP capacity              |
| usage     | ports.eip                                      | Current project EIP type IP total capacity         |
| usage     | ports_exit                                     | Current project external IP total capacity            |
| usage     | ports_exit.eip                                 | Current project EIP type external IP total capacity       |
| usage     | ready_servers                                  | Current project shutdown state VM count         |
| usage     | ready_servers.cpu                              | Current project shutdown state VM CPU count      |
| usage     | ready_servers.disk                             | Current project shutdown state VM disk capacity       |
| usage     | ready_servers.ha                               | Current project shutdown state HA VM count      |
| usage     | ready_servers.ha.cpu                           | Current project shutdown state HA VM CPU count  |
| usage     | ready_servers.ha.disk                          | Current project shutdown state HA VM disk capacity    |
| usage     | ready_servers.ha.memory                        | Current project shutdown state HA VM memory capacity    |
| usage     | ready_servers.isolated_devices                 | Current project shutdown state VM GPU card count    |
| usage     | ready_servers.memory                           | Current project shutdown state VM memory capacity      |
| usage     | regions                                        | Total region count                 |
| usage     | running_servers                                | Current project running state VM count        |
| usage     | running_servers.cpu                            | Current project running state VM CPU count     |
| usage     | running_servers.disk                           | Current project running state VM disk capacity      |
| usage     | running_servers.ha                             | Current project running state HA VM count     |
| usage     | running_servers.ha.cpu                         | Current project running state HA VM CPU count |
| usage     | running_servers.ha.disk                        | Current project running state HA VM disk capacity   |
| usage     | running_servers.ha.memory                      | Current project running state HA VM memory capacity   |
| usage     | running_servers.isolated_devices               | Current project running state VM GPU card count    |
| usage     | running_servers.memory                         | Current project running state VM memory capacity      |
| usage     | servers                                        | Current project VM count             |
| usage     | servers.cpu                                    | Current project VM CPU count          |
| usage     | servers.disk                                   | Current project VM disk capacity           |
| usage     | servers.ha                                     | Current project HA VM count          |
| usage     | servers.ha.cpu                                 | Current project HA VM CPU count       |
| usage     | servers.ha.disk                                | Current project HA VM disk capacity        |
| usage     | servers.ha.memory                              | Current project HA VM memory capacity        |
| usage     | servers.isolated_devices                       | Current project VM GPU card count         |
| usage     | servers.memory                                 | Current project VM memory capacity           |
| usage     | snapshot                                       | Current project snapshot count              |
| usage     | storages                                       | Total storage capacity                 |
| usage     | storages.commit_rate                           | Storage overcommit ratio                 |
| usage     | storages.virtual                               | Total storage virtual capacity               |
| usage     | vpcs                                           | VPC count             |
| usage     | wires                                          | Layer 2 network count                |
| usage     | zones                                          | Availability zone count                |
| usage     | all.disks.count                                | Disk count                  |
| usage     | all.disks.mounted.count                        | Mounted disk count               |
| usage     | all.disks.unmounted.count                      | Unmounted disk count               |
| usage     | all.disks.unready.count                        | Abnormal state disk count              |
| usage     | all.loadbalancer                               | Load balancer count                |
| usage     | all.cache                                      | Redis instance count             |
| usage     | all.rds                                        | RDS instance count               |
| usage     | all.servers.system                             | System VM count             |
| usage     | all.disks.system                               | System storage usage               |
| usage     | all.servers.system.cpu                         | System VM CPU usage           |
| usage     | all.servers.system.memory                      | System VM memory usage            |
| usage     | cache                                          | Current project Redis count          |
| usage     | disks.count                                    | Current project disk count             |
| usage     | disks.mounted.count                            | Current project mounted disk count          |
| usage     | disks.unmounted.count                          | Current project unmounted disk count          |
| usage     | disks.unready.count                            | Current project abnormal state disk count         |
| usage     | loadbalancer                                   | Current project load balancer count           |
| usage     | rds                                            | Current project RDS instance count          |
| usage     | domain.baremetals                              | Current domain bare metal server count           |
| usage     | domain.baremetals.cpu                          | Current domain bare metal server CPU count        |
| usage     | domain.baremetals.memory                       | Current domain bare metal server memory capacity         |
| usage     | domain.bucket_bytes                            | Current domain object storage capacity             |
| usage     | domain.bucket_objects                          | Current domain object storage file count           |
| usage     | domain.buckets                                 | Current domain storage bucket count              |
| usage     | domain.cache                                   | Current domain Redis instance count          |
| usage     | domain.cpu_commit_rate.running                 | Current domain running VM CPU overcommit ratio     |
| usage     | domain.disks                                   | Current domain total disk capacity              |
| usage     | domain.disks.mounted                           | Current domain total mounted disk capacity           |
| usage     | domain.disks.mounted.count                     | Current domain mounted disk count            |
| usage     | domain.disks.count                             | Current domain total disk count              |
| usage     | domain.disks.unmounted                         | Current domain total unmounted disk capacity          |
| usage     | domain.disks.unmounted.count                   | Current domain total unmounted disk count          |
| usage     | domain.disks.unready                           | Current domain disk capacity in abnormal state          |
| usage     | domain.disks.unready.count                     | Current domain disk count in abnormal state          |
| usage     | domain.eip                                     | Current domain total EIP and public IP count      |
| usage     | domain.eip.floating_ip                         | Current domain total EIP capacity           |
| usage     | domain.eip.floating_ip.used                    | Current domain used EIP count       |
| usage     | domain.eip.public_ip                           | Current domain total public IP capacity             |
| usage     | domain.eip.used                                | Current domain used EIP and public IP count  |
| usage     | domain.enabled_hosts                           | Current domain enabled host count           |
| usage     | domain.enabled_hosts.cpu                       | Current domain enabled host CPU count        |
| usage     | domain.enabled_hosts.cpu.virtual               | Current domain enabled host CPU virtual count      |
| usage     | domain.enabled_hosts.memory                    | Current domain enabled host memory capacity         |
| usage     | domain.enabled_hosts.memory.virtual            | Current domain enabled host memory virtual capacity       |
| usage     | domain.hosts                                   | Current domain total host capacity              |
| usage     | domain.hosts.cpu                               | Current domain total host CPU capacity           |
| usage     | domain.hosts.cpu.virtual                       | Current domain total host CPU virtual capacity         |
| usage     | domain.hosts.memory                            | Current domain total host memory capacity            |
| usage     | domain.hosts.memory.virtual                    | Current domain total host memory virtual capacity          |
| usage     | domain.loadbalancer                            | Current domain load balancer instance count           |
| usage     | domain.memory_commit_rate.running              | Current domain running VM memory overcommit ratio      |
| usage     | domain.pending_delete_servers                  | Current domain recycle bin VM count          |
| usage     | domain.pending_delete_servers.cpu              | Current domain recycle bin VM CPU count       |
| usage     | domain.pending_delete_servers.disk             | Current domain recycle bin VM disk capacity         |
| usage     | domain.pending_delete_servers.ha               | Current domain recycle bin HA VM count        |
| usage     | domain.pending_delete_servers.ha.cpu           | Current domain recycle bin HA VM CPU count    |
| usage     | domain.pending_delete_servers.ha.disk          | Current domain recycle bin HA VM disk capacity      |
| usage     | domain.pending_delete_servers.ha.memory        | Current domain recycle bin HA VM memory capacity      |
| usage     | domain.pending_delete_servers.isolated_devices | Current domain recycle bin VM GPU card count       |
| usage     | domain.pending_delete_servers.memory           | Current domain recycle bin VM memory capacity         |
| usage     | domain.ports                                   | Current domain total IP capacity               |
| usage     | domain.ports.eip                               | Current domain EIP type IP total capacity          |
| usage     | domain.ports_exit                              | Current domain external IP total capacity             |
| usage     | domain.ports_exit.eip                          | Current domain EIP type external IP total capacity        |
| usage     | domain.rds                                     | Current domain RDS instance count            |
| usage     | domain.ready_servers                           | Current domain shutdown state VM count          |
| usage     | domain.ready_servers.cpu                       | Current domain shutdown state VM CPU count       |
| usage     | domain.ready_servers.disk                      | Current domain shutdown state VM disk capacity        |
| usage     | domain.ready_servers.ha                        | Current domain shutdown state HA VM count       |
| usage     | domain.ready_servers.ha.cpu                    | Current domain shutdown state HA VM CPU count   |
| usage     | domain.ready_servers.ha.disk                   | Current domain shutdown state HA VM disk capacity     |
| usage     | domain.ready_servers.ha.memory                 | Current domain shutdown state HA VM memory capacity     |
| usage     | domain.ready_servers.isolated_devices          | Current domain shutdown state VM GPU card count     |
| usage     | domain.ready_servers.memory                    | Current domain shutdown state VM memory capacity       |
| usage     | domain.running_servers                         | Current domain running state VM count         |
| usage     | domain.running_servers.cpu                     | Current domain running state VM CPU count      |
| usage     | domain.running_servers.disk                    | Current domain running state VM disk capacity       |
| usage     | domain.running_servers.ha                      | Current domain running state HA VM count      |
| usage     | domain.running_servers.ha.cpu                  | Current domain running state HA VM CPU count  |
| usage     | domain.running_servers.ha.disk                 | Current domain running state HA VM disk capacity    |
| usage     | domain.running_servers.ha.memory               | Current domain running state HA VM memory capacity    |
| usage     | domain.running_servers.isolated_devices        | Current domain running state VM GPU card count     |
| usage     | domain.running_servers.memory                  | Current domain running state VM memory capacity       |
| usage     | domain.servers                                 | Current domain VM count              |
| usage     | domain.servers.cpu                             | Current domain VM CPU count           |
| usage     | domain.servers.disk                            | Current domain VM disk capacity            |
| usage     | domain.servers.ha                              | Current domain HA VM count           |
| usage     | domain.servers.ha.cpu                          | Current domain HA VM CPU count        |
| usage     | domain.servers.ha.disk                         | Current domain HA VM disk capacity         |
| usage     | domain.servers.ha.memory                       | Current domain HA VM memory capacity         |
| usage     | domain.servers.isolated_devices                | Current domain VM GPU card count          |
| usage     | domain.servers.memory                          | Current domain VM memory capacity            |
| usage     | domain.snapshot                                | Current domain snapshot count               |
| usage     | domain.storages                                | Current domain total storage capacity              |
| usage     | domain.storages.commit_rate                    | Current domain storage overcommit ratio              |
| usage     | domain.storages.virtual                        | Current domain total storage virtual capacity            |
| usage     | domain.vpcs                                    | Current domain VPC count          |
| usage     | all.img.total.size                             | Total size of all VM images           |
| usage     | domain.img.total.size                          | Total size of current domain VM images         |
| usage     | img.total.size                                 | Total size of current project VM images        |
| usage     | all.iso.total.size                             | Total size of all ISOs             |
| usage     | domain.iso.total.size                          | Total size of current domain ISOs           |
| usage     | iso.total.size                                 | Total size of current project ISOs          |
| usage     | all.imgiso.total.size                          | Total size of all VM images and ISOs       |
| usage     | domain.imgiso.total.size                       | Total size of current domain VM images and ISOs     |
| usage     | imgiso.total.size                              | Total size of current project VM images and ISOs    |
| usage     | all.pending_delete_servers.last_week           | VM count deleted in the past 1 week           |
| usage     | domain.pending_delete_servers.last_week        | Current domain VM count added in the past 1 week        |
| usage     | pending_delete_servers.last_week               | Current project VM count added in the past 1 week       |
| usage     | all.servers.last_week                          | VM count added in the past 1 week           |
| usage     | domain.servers.last_week                       | Current domain VM count added in the past 1 week        |
| usage     | servers.last_week                              | Current project VM count added in the past 1 week       |
| k8s_usage | all.cluster.count                              | Cluster count                  |
| k8s_usage | all.cluster.node.count                         | Node count                  |
| k8s_usage | all.cluster.node.not_ready_count               | Unhealthy node count               |
| k8s_usage | all.cluster.node.ready_count                   | Healthy node count                |
| k8s_usage | all.cluster.node.pod.capacity                  | Pod capacity limit                |
| k8s_usage | all.cluster.node.pod.count                     | Pod count                 |
| k8s_usage | all.cluster.node.cpu.capacity                  | Total CPU capacity                 |
| k8s_usage | all.cluster.node.cpu.limit                     | CPU limit capacity                |
| k8s_usage | all.cluster.node.cpu.request                   | CPU usage                |
| k8s_usage | all.cluster.node.memory.capacity               | Total memory capacity                  |
| k8s_usage | all.cluster.node.memory.limit                  | Memory limit capacity                 |
| k8s_usage | all.cluster.node.memory.request                | Memory usage                 |
| k8s_usage | domain.cluster.count                           | Current domain cluster count               |
| k8s_usage | domain.cluster.node.count                      | Current domain node count               |
| k8s_usage | domain.cluster.node.not_ready_count            | Current domain unhealthy node count            |
| k8s_usage | domain.cluster.node.ready_count                | Current domain healthy node count             |
| k8s_usage | domain.cluster.node.pod.capacity               | Current domain pod capacity limit             |
| k8s_usage | domain.cluster.node.pod.count                  | Current domain pod count              |
| k8s_usage | domain.cluster.node.cpu.capacity               | Current domain total CPU capacity              |
| k8s_usage | domain.cluster.node.cpu.limit                  | Current domain CPU limit capacity             |
| k8s_usage | domain.cluster.node.cpu.request                | Current domain CPU usage             |
| k8s_usage | domain.cluster.node.memory.capacity            | Current domain total memory capacity               |
| k8s_usage | domain.cluster.node.memory.limit               | Current domain memory limit capacity              |
| k8s_usage | domain.cluster.node.memory.request            | Current domain memory usage              |
| k8s_usage | project.cluster.count                          | Current project cluster count              |
| k8s_usage | project.cluster.node.count                     | Current project node count              |
| k8s_usage | project.cluster.node.not_ready_count           | Current project unhealthy node count           |
| k8s_usage | project.cluster.node.ready_count               | Current project healthy node count            |
| k8s_usage | project.cluster.node.pod.capacity              | Current project pod capacity limit            |
| k8s_usage | project.cluster.node.pod.count                 | Current project pod count             |
| k8s_usage | project.cluster.node.cpu.capacity              | Current project total CPU capacity             |
| k8s_usage | project.cluster.node.cpu.limit                 | Current project CPU limit capacity            |
| k8s_usage | project.cluster.node.cpu.request               | Current project CPU usage            |
| k8s_usage | project.cluster.node.memory.capacity           | Current project total memory capacity              |
| k8s_usage | project.cluster.node.memory.limit              | Current project memory limit capacity             |
| k8s_usage | project.cluster.node.memory.request            | Current project memory usage             |
