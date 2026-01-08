---
sidebar_position: 0.2
---

# Multi-Cloud Management Permission Table

Permission requirements for various functions of the cloud platform.

:::tip
If using precise permissions, please ensure object storage permissions are added,
This table will be continuously updated according to cloud platform management functions.
:::

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem'

<Tabs>
<TabItem value="AWS" label="AWS">
| Function                                              | Read-Only Permission                                          | Read-Write Permission                                 |
| :----------                                       | :--------                                         | :----------                                  |
| All Functions                                      | ReadOnlyAccess                                    | AdministratorAccess                          |
| Virtual Machine, Disk, Security Group, Image, Snapshot, Disk, Image      | AmazonEC2ReadOnlyAccess                           | AmazonEC2FullAccess                          |
| Project                                              | -                                                 | -                                            |
| Vpc, Vpc Peering Connection, Route Table, NAT, Elastic NIC, EIP, NAT  | AmazonVPCReadOnlyAccess                           | AmazonVPCFullAccess                          |
| Object Storage                                          | AmazonS3ReadOnlyAccess                            | AmazonS3FullAccess                           |
| Load Balancer                                          | ElasticLoadBalancingReadOnly                      | ElasticLoadBalancingFullAccess               |
| RDS                                               | AmazonRDSReadOnlyAccess                           | AmazonRDSFullAccess                          |
| Elastic Cache                                          | AmazonElastiCacheReadOnlyAccess                   | AmazonElastiCacheFullAccess                  |
| Operation Logs                                          | AWSCloudTrailReadOnlyAccess                       | AWSCloudTrail_FullAccess                     |
| NAS                                               | AmazonElasticFileSystemReadOnlyAccess             | AmazonElasticFileSystemFullAccess            |
| WAF                                               | AWSWAFReadOnlyAccess                              | AWSWAFFullAccess                             |
| IAM                                               | IAMReadOnlyAccess                                 | IAMFullAccess                                |
| DNS                                               | AmazonRoute53DomainsReadOnlyAccess                | AmazonRoute53DomainsFullAccess               |
| Billing, Costs                                         | AWSBillingReadOnlyAccess                          | Billing                                      |
| Monitoring                                              | CloudWatchReadOnlyAccess                          | CloudWatchFullAccess                         |
</TabItem>

<TabItem value="Azure" label="Azure">

| Function                                                      | Read-Only Permission                                              | Read-Write Permission                                                      |
| :----------                                               | :--------                                             | :----------                                                       |
| All Functions                                              | Reader                                                | Owner                                                             |
| Virtual Machine, Disk, Security Group, Image, Snapshot, Disk, Image, Load Balancer    | -                                                     | Virtual Machine Contributor<br/>Classic Virtual Machine Contributor|
| Project                                                      | -                                                     | -                                                                 |
| Vpc, Vpc Peering Connection, Route Table, NAT, Elastic NIC, EIP, NAT, WAF     | -                                                     | Network Contributor,<br/>Classic Network Contributor               |
| Object Storage                                                  | Storage Blob Data Reader                              | Storage Blob Data Owner                                           |
| RDS                                                       | Cloud SQL Viewer                                      | Cloud SQL Admin                                                   |
| Elastic Cache                                                  | Redis Enterprise Cloud Viewer                         | Redis Enterprise Cloud Admin                                      |
| NAS                                                       | Storage File Data SMB Share Reader                    | Storage File Data SMB Share Contributor                           |
| WAF                                                       | -                                                     | -                                                                 |
| IAM                                                       | -                                                     | Graph Owner<br/>Resource Policy Contributor                        |
| DNS                                                       | -                                                     | DNS Zone Contributor<br/>Private DNS Zone Contributor              |
| Billing, Costs                                                 | Billing Reader<br/>Cost Management Reader              | Cost Management Contributor                                       |
| Monitoring, Operation Logs                                             | Monitoring Reader                                     | Monitoring Contributor                                            |

</TabItem>

<TabItem value="阿里云" label="Alibaba Cloud">
| Function                               | Read-Only Permission                                          | Read-Write Permission                                 |
| :----------                        | :--------                                         | :----------                                  |
| All Functions                       | ReadOnlyAccess                                    | AdministratorAccess                          |
| Virtual Machine, Security Group, Image, Disk, Snapshot   | AliyunECSReadOnlyAccess                           | AliyunECSFullAccess                          |
| Vpc, Vpc Peering Connection, Route Table           | AliyunVPCReadOnlyAccess                           | AliyunVPCFullAccess                          |
| Eip                                | AliyunEIPReadOnlyAccess                           | AliyunEIPFullAccess                          |
| Elastic NIC                           | AliyunVPCNetworkIntelligenceReadOnlyAccess        | AliyunECSNetworkInterfaceManagementAccess    |
| Object Storage                           | AliyunOSSReadOnlyAccess                           | AliyunOSSFullAccess                          |
| NAT                                | AliyunNATGatewayReadOnlyAccess                    | AliyunNATGatewayFullAccess                   |
| Load Balancer                           | AliyunSLBReadOnlyAccess<br/>AliyunALBFullAccess    | AliyunSLBFullAccess<br/>AliyunALBFullAccess   |
| RDS                                | AliyunRDSReadOnlyAccess                           | AliyunRDSFullAccess                          |
| Elastic Cache                           | AliyunKvstoreReadOnlyAccess                       | AliyunKvstoreFullAccess                      |
| Operation Logs                           | AliyunActionTrailFullAccess                       | AliyunActionTrailFullAccess                  |
| NAS                                | AliyunNASReadOnlyAccess                           | AliyunNASFullAccess                          |
| WAF                                | AliyunYundunWAFReadOnlyAccess                     | AliyunYundunWAFFullAccess                    |
| IAM                                | AliyunRAMReadOnlyAccess                           | AliyunRAMFullAccess                          |
| DNS                                | AliyunDNSReadOnlyAccess<br/>AliyunPubDNSFullAccess | AliyunDNSFullAccess<br/>AliyunPubDNSFullAccess|
| Billing, Balance, Costs                     | AliyunFinanceConsoleReadOnlyAccess                | AliyunFinanceConsoleFullAccess               |
| Monitoring                               | AliyunCloudMonitorReadOnlyAccess                  | AliyunCloudMonitorFullAccess                 |

</TabItem>

<TabItem value="腾讯云" label="Tencent Cloud">
| Function                                          | Read-Only Permission                                                                                                          | Read-Write Permission                                                                                      |
| :----------                                   | :--------                                                                                                         | :----------                                                                                       |
| All Functions                                  | ReadOnlyAccess                                                                                                    | AdministratorAccess                                                                               |
| Virtual Machine, Security Group, Image, Disk, Snapshot              | QcloudCVMReadOnlyAccess                                                                                           | QcloudCVMFullAccess                                                                               |
| Vpc, Vpc Peering Connection, Route Table, NAT, Elastic NIC       | QcloudVPCReadOnlyAccess                                                                                           | QcloudVPCFullAccess                                                                               |
| Eip                                           | -                                                                                                                 | QcloudEIPFullAccess                                                                               |
| Object Storage                                      | QcloudCOSReadOnlyAccess                                                                                           | QcloudCOSFullAccess                                                                               |
| Load Balancer                                      | QcloudCLBReadOnlyAccess                                                                                           | QcloudCLBFullAccess                                                                               |
| RDS                                           | QcloudMariaDBReadOnlyAccess<br/>QcloudCDBReadOnlyAccess<br/>QcloudSQLServerReadOnlyAccess<br/>QcloudPostgreSQLReadOnlyAccess  | QcloudMariaDBFullAccess<br/>QcloudCDBFullAccess<br/>QcloudSQLServerFullAccess<br/>QcloudPostgreSQLFullAccess  |
| Elastic Cache                                      | QcloudRedisReadOnlyAccess                                                                                         | QcloudRedisFullAccess                                                                             |
| Operation Logs                                      | QcloudAuditReadOnlyAccess                                                                                         | QcloudAuditFullAccess                                                                             |
| NAS                                           | -                                                                                                                 | -                                                                                                 |
| WAF                                           | -                                                                                                                 | -                                                                                                 |
| IAM                                           | QcloudCamReadOnlyAccess                                                                                           | QcloudCamFullAccess                                                                               |
| DNS                                           | QcloudDNSPodReadOnlyAccess<br/>QcloudPrivateDNSReadOnlyAccess                                                         | QcloudPrivateDNSFullAccess<br/>QcloudDNSPodFullAccess                                                 |
| Billing, Balance, Costs                                | -                                                                                                                 | QCloudFinanceFullAccess                                                                           |
| Monitoring                                          | QcloudMonitorReadOnlyAccess                                                                                       | QcloudMonitorFullAccess                                                                           |
| Kafka                                         | QcloudCkafkaReadOnlyAccess                                                                                        | QcloudCKafkaFullAccess                                                                           |
| MongoDB                                       | QcloudMongoDBReadOnlyAccess                                                                                       | QcloudMongoDBFullAccess                                                                           |
| CDN                                           | QcloudCDNReadOnlyAccess                                                                                           | QcloudCDNFullAccess                                                                           |
| Container                                          | QcloudTKEReadOnlyAccess                                                                                           | QcloudTKEFullAccess                                                                           |
</TabItem>

<TabItem value="华为云" label="Huawei Cloud">
| Function                                          | Read-Only Permission                                          | Read-Write Permission                                     |
| :----------                                   | :--------                                         | :----------                                      |
| All Functions                                  | Tenant Guest<br/>IAM ReadOnlyAccess                | Tenant Administrator<br/>Security Administrator   |
| Virtual Machine                                        | ECS ReadOnlyAccess                                | ECS FullAccess                                   |
| Disk, Snapshot                                    | EVS ReadOnlyAccess                                | EVS FullAccess                                   |
| Project                                          | EPS ReadOnlyAccess                                | EPS FullAccess                                   |
| Image                                          | IMS ReadOnlyAccess                                | IMS FullAccess                                   |
| Vpc, Vpc Peering Connection, Route Table, Elastic NIC, EIP, Security Group | VPC ReadOnlyAccess                                | VPC FullAccess                                   |
| NAT                                           | NAT ReadOnlyAccess                                | NAT FullAccess                                   |
| Object Storage                                      | OBS ReadOnlyAccess                                | OBS Administrator                                |
| Load Balancer                                      | ELB ReadOnlyAccess                                | ELB FullAccess                                   |
| RDS                                           | RDS ReadOnlyAccess                                | RDS FullAccess                                   |
| Elastic Cache                                      | DCS ReadOnlyAccess                                | DCS FullAccess                                   |
| Operation Logs                                      | CTS ReadOnlyAccess                                | CTS FullAccess                                   |
| NAS                                           | SFS ReadOnlyAccess<br/>SFS Turbo ReadOnlyAccess    | SFS FullAccess<br/>SFS Turbo FullAccess           |
| WAF                                           | WAF ReadOnlyAccess                                | WAF FullAccess                                   |
| IAM                                           | IAM ReadOnlyAccess                                | Security Administrator                           |
| DNS                                           | DNS ReadOnlyAccess                                | DNS FullAccess                                   |
| Billing, Balance, Costs                                | BSS Operator                                      | BSS Administrator                                |
| Monitoring                                          | CES ReadOnlyAccess                                | CES FullAccess                                   |

</TabItem>


<TabItem value="Google GCP" label="Google GCP">
| Function                                                      | Read-Only Permission                                              | Read-Write Permission                     |
| :----------                                               | :--------                                             | :----------                      |
| All Functions                                              | Viewer                                                | Editor                           |
| Virtual Machine, Disk, Security Group, Image, Snapshot, Disk, Image, Load Balancer    | Compute Viewer                                        | Compute Editor                   |
| Project                                                      | -                                                     | -                                |
| Vpc, Vpc Peering Connection, Route Table, NAT, Elastic NIC, EIP, NAT          | Compute Network Viewer                                | Compute Network Admin            |
| Object Storage                                                  | Storage Legacy Bucket Reader<br/>Storage Object Viewer | Storage Admin                    |
| RDS                                                       | Cloud SQL Viewer                                      | Cloud SQL Admin                  |
| Elastic Cache                                                  | Redis Enterprise Cloud Viewer                         | Redis Enterprise Cloud Admin     |
| Operation Logs                                                  | Logs Viewer                                           | Logging Admin                    |
| NAS                                                       | Cloud Filestore Viewer                                | Cloud Filestore Editor           |
| WAF                                                       | -                                                     | -                                |
| IAM                                                       | Role Viewer                                           | Role Administrator               |
| DNS                                                       | DNS Reader                                            | DNS Administrator                |
| Billing, Costs                                                 | Billing Account Viewer                                | Billing Account Administrator    |
| Monitoring                                                      | Monitoring Viewer                                     | Monitoring Admin                 |

</TabItem>

</Tabs>

