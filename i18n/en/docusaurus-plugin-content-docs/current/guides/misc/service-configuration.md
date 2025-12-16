---
sidebar_position: 1
---

# Service Configuration Management

This article introduces the management principles of platform service configuration.

Most service configurations have three sources:

* Command line parameters
* Configuration files, configuration file paths are generally in /etc/yunion/\<service_name\>.conf
* Service configuration stored in Keystone

If a parameter is set in all three sources, the configuration source ranked later has the highest priority.

## Command Line Parameters

Service configuration is first set through command line parameters. If there is a --config configuration, the content of the configuration file specified by --config will be loaded, and parameters will be set according to the content of the configuration file.

The following configuration items are parameters that can only be specified through the command line:

| Configuration Item | Type   | Description              |
|-------------------|--------|--------------------------|
| config            | string | Specify configuration file path |
| help              | bool   | Display help information and exit |
| version           | bool   | Display version information and exit |
| pid_file          | string | PID file path |

## Configuration Files

Configuration files can be in Key=Value format or YAML format. Configuration items in configuration files are read once by the service program from the configuration file when the server starts. Modifications to the configuration file after the program starts will not be dynamically loaded.

Some services will further load configuration information from Keystone's service configuration and monitor changes in Keystone's service configuration to dynamically update service configuration.

Not all configuration items can be dynamically loaded from Keystone's service configuration. The following configuration items are parameters that can only be specified through command line parameters or file configuration. These configuration items mainly include service authentication information, database configuration information, etc.

| Configuration Item                       | Type      | Description                                                                 |
|------------------------------------------|-----------|-----------------------------------------------------------------------------|
| region                                   | string    | Name of the region to which the service instance belongs, generally region0 |
| application_id                          | string    | Application name of the service |
| log_level                                | string    | Log level for output, default is info, i.e., only output info\|warning\|error logs, can be set to debug |
| log_verbose_level                        | int       | Log redundancy (deprecated) |
| temp_path                                | string    | Directory for storing local temporary files |
| address                                  | string    | Service API listening address |
| port                                     | string    | Service API listening port |
| port_v2                                  | string    | v2 port (deprecated) |
| admin_port                               | string    | Management port (deprecated) |
| session_endpoint_type                    | string    | Endpoint type for accessing other services, default is internal |
| admin_password                           | string    | Keystone service account password |
| admin_project                            | string    | Project to which the Keystone service account belongs |
| admin_project_domain                     | string    | Domain name of the project to which the Keystone service account belongs, default is Default |
| admin_user                               | string    | Keystone service account username |
| admin_domain                             | string    | Domain name to which the Keystone service account user belongs, default is Default |
| auth_url                                 | string    | Keystone authentication URL, generally https://\<keystone\>:30500/v3 |
| enable_ssl                                | string    | Whether to enable TLS (https) |
| ssl_certfile                             | string    | Certificate file path for TLS certificate |
| ssl_keyfile                              | string    | Private key path for TLS certificate |
| ssl_ca_certs                             | string    | CA certificate path for TLS certificate, optional. If certfile is a certificate containing a full chain, this option can be empty |
| is_slave_node                            | bool      | Whether this running instance is in SLAVE state. Scheduled tasks for each service only run on MASTER instances |
| config_sync_period_seconds               | int       | Time interval for passively syncing configuration from keystone, default is 1800 seconds |
| sql_connection                           | string    | Define common database SQL connection string, default is empty |
| clickhouse                               | string    | Define ClickHouse SQL connection string, default is empty |
| ops_log_with_clickhouse                  | bool      | Whether to use ClickHouse to record operation logs (opslog), default is false. When clickhouse is set and ops_log_with_clickhouse is true, opslog records are saved in ClickHouse |
| db_checksum_skip_init                    | bool      | After enabling database integrity check, whether to skip database initialization. If not skipped, need to wait for a long time for database checksum recalculation |
| db_checksum_tables                       | bool      | Whether to enable database integrity check. If enabled, integrity check is performed on tables in enable_db_checksum_tables |
| enable_db_checksum_tables                | []string  | Specify database table names for database integrity check |
| auto_sync_table                          | bool      | Automatically sync database schema, default is false |
| exit_after_db_init                       | bool      | Service automatically exits after initializing the database. If auto_sync_table=true and exit_after_db_init=true, the service automatically exits after database schema synchronization |
| global_virtual_resource_namespace        | bool      | Whether resources use global namespace, default is true, meaning resource names in different projects cannot be duplicated |
| debug_sqlchemy                           | bool      | Whether to enable sqlchemy debug mode, default is false, i.e., do not output sqlchemy logs |
| lockman_method                           | string    | Resource lock implementation mechanism, optional values are inmemory and etcd, default is inmemory. If the service enables multiple instances, it should be set to etcd to implement distributed locks |
| etcd_lock_prefix                         | string    | Prefix of etcd distributed lock key |
| etcd_lock_ttl                            | string    | etcd lock expiration time, default is 5 seconds |
| etcd_endpoints                           | string    | List of etcd service addresses |
| etcd_username                            | string    | etcd authentication username |
| etcd_password                            | string    | etcd authentication user password |
| etcd_use_tls                             | string    | Whether etcd uses TLS |
| etcd_skip_tls_verify                     | string    | If etcd enables TLS, whether to verify certificate validity |
| etcd_cacert                              | string    | If etcd enables TLS, path to CA certificate file |
| etcd_cert                                | string    | If etcd enables TLS, path to certificate file |
| etcd_key                                 | string    | If etcd enables TLS, path to private key file |
| splitable_max_duration_hours             | string    | If log enables automatic table splitting, time interval for each table to save, default is one month 30*24=720 hours |
| ops_log_max_keep_months                  | string    | If log enables automatic table splitting, default retention time interval, default is 6 months |

If the service runs in Kubernetes, configuration information is saved in YAML format in the configmap under the onecloud namespace. For example, the configuration of the region service is saved in the default-region configmap. When the service starts, the content of this configmap is mounted to the container's /etc/yunion/\<service\>.conf file path and loaded by the service as a file configuration. Therefore, to modify the configuration file content, you need to modify the corresponding configmap content.

Modify configmap configuration through the following command:

```
kubectl -n onecloud edit configmap default-region
```

After modifying the configmap, you need to restart the service for the configuration to take effect.

## Keystone Service Configuration

Some services implement the ability to dynamically load configuration parameters from Keystone's service configuration. These services include: notify, log, baremetal-agent, scheduler, keystone, glance, cloudid, region, webconsole, apigateway, meter, report.

After these services start, they first load configuration parameters from command line parameters and configuration files, then load service configuration stored in Keystone and maintain near real-time synchronization. After external service configuration updates, Keystone pushes configuration updates to each service through etcd.

The configuration stored in Keystone for each service is divided into two parts: public configuration and personalized configuration. If a configuration item is valid in both public configuration and personalized configuration, the configuration item in public configuration has higher priority.

### Public Configuration

Public configuration is shared by all services and stored in a service configuration called "common". You can access common service configuration through the following climc commands.

```bash
# View public configuration in JSON format
climc service-config-show common
# Edit public service configuration in YAML format
climc service-config-edit common
```

Supported public configuration parameters are as follows:

| Configuration Item                | Type              | Description                                                                 |
|-----------------------------------|-------------------|-----------------------------------------------------------------------------|
| enable_quota_check                 | bool              | Whether to enable quota, default is false. After enabling, creating new resources requires checking the quota of the corresponding project or domain |
| default_quota_value                | string            | After enabling quota, default initial quota for new domains or projects. There are three values: unlimit (default unlimited), zero (default 0 quota), default (default initial value, customized by each service for default quota of each resource), default is default |
| non_default_domain_projects        | bool              | Whether to allow non-Default domains to have projects, i.e., whether to allow three-level permissions. If true, resources are organized at three levels: global, domain, project |
| time_zone                          | string            | Time zone of platform deployment, default is China time zone, i.e., "Asia/Shanghai" |
| domainized_namespace                | bool              | Whether each tenant is an independent namespace, default is false |
| api_server                         | string            | Platform's external service address, URL address for browsers to open the platform web console |
| customized_private_prefixes        | []string          | Custom private IP address segments. If not set, defaults to RFC1918 (https://datatracker.ietf.org/doc/html/rfc1918) defined private cloud IP address space |
| global_http_proxy                  | string            | Global http proxy address |
| global_https_proxy                 | string            | Global https proxy address |
| ignore_nonrunning_guests           | bool              | Whether to ignore memory allocation of non-running VMs, default is true, i.e., after a VM shuts down, its memory is not reserved and can be occupied by other VMs. When resources are tight, after a VM shuts down, there is no guarantee that there is enough memory to allow it to start again |
| platform_name                      | string            | Platform's default name |
| platform_names                     | map[string]string | Platform name in each language, e.g., map[string]string\{"zh_CN": "云", "en_US": "Cloud"\} |


### Service Personalized Configuration

In addition to public configuration, each service has its own personalized configuration. You can use the following climc commands to access configuration information stored in Keystone for the specified service:

```bash
# View configuration in JSON format
climc service-config-show <service_name>
# Edit configuration information in YAML format
climc service-config-edit <service_name>
```




## Host Agent Service Configuration

Compared with other services' service configuration, Host Agent's service configuration has some special features. First, Host Agent's service configuration does not implement the function of obtaining service configuration from Keystone, only supports loading configuration items from command line parameters and configuration files. Second, Host Agent's file configuration is divided into three parts:

* Default host configuration file, specified through --config parameter, default location is /etc/yunion/host.conf. This configuration is loaded by default by the host service, located at /etc/yunion/host.conf on each compute node. Configuration items in this file are loaded first.
* Public host configuration file, specified through --common-config-file parameter, default location is /etc/yunion/common/common.conf. When deployed in Kubernetes, common.conf content is implemented by mounting configmap default-host. Therefore, by modifying the content of configmaps default-host, you can uniformly modify the host service configuration of all compute nodes. Configuration in this file will override host.conf configuration.
* Personalized configuration file for public host configuration, specified through --local-config-file parameter, default location is /etc/yunion/host_local.conf. This configuration is used to personalize configuration items defined in common.conf. Configuration in this file will override common.conf configuration.

For HostAgent services deployed in Kubernetes, public configuration is stored in the configmap named default-host under the onecloud namespace. Personalized configuration is stored in the configuration file /etc/yunion/host.conf on each host machine. Localized public configuration is stored in the configuration file /etc/yunion/host_local.conf on each host machine.

Common HostAgent public configuration items are as follows:

| Configuration Item          | Type   | Description                                                                 |
|-----------------------------|--------|-----------------------------------------------------------------------------|
| ExecutorSocketPath          | string | Listening socket address of this host's yunion-executor service, default is /var/run/onecloud/exec.sock |
| DeployServerSocketPath      | string | Listening socket address of this host's host-deployer service, default is /var/run/onecloud/deploy.sock |
| EnableRemoteExecutor        | bool   | Whether to use yunion-executor to execute commands, default is false. If host runs in a container, must be true |
| ManageNtpConfiguration      | bool   | Whether HostAgent manages the host machine's ntp configuration, default is true |
| DisableSecurityGroup        | bool   | Whether to disable security group function on this host machine, default is false |
| HostCpuPassthrough          | bool   | Whether to passthrough host machine's CPU model to VMs. If not passthrough, VM's CPU model is qemu64. Default is true, i.e., passthrough host CPU to VM |
| DefaultQemuVersion          | string | Default qemu version. After 3.9, default version is 4.2.0. Before 3.9, default version is 2.12.1 |


## View Service's Current Configuration Parameters

Starting from 3.9, some services have added an app-options API that can obtain the service's currently effective configuration parameters.

You can read the configuration parameters of the specified service through the following climc command. Supported services include: identity, compute, image, baremetal, meter

```bash
climc app-options-show <service-type>
```

You can obtain the configuration parameters of the host service for the specified host machine through the following climc command:

```bash
climc host-app-options <host-id>
```
