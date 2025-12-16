---
sidebar_position: 7
---

# Service Configuration Management

Keystone provides infrastructure for service configuration management to facilitate managing configurations for each service.

## Service Configuration

Each service's configuration information includes several parts:

| Configuration Parameter Location                      | Priority |
|-----------------------------------|--------|
| Default parameter configuration                      | 0      |
| Command line parameters                        | 100    |
| Parameters defined in configuration file              | 200    |
| Parameters stored in keystone configuration database  | 300    |


If a parameter is defined in all three places above, the one with higher priority takes effect.

Example: The keystone service configuration parameter password_error_lock_count defines the maximum number of times a local user can be locked after entering the wrong password consecutively. The default value is 0. If this parameter is not set anywhere, the parameter value is 0. If the administrator sets the startup parameter --password-error-lock-count=6 when starting the keystone service, the parameter value is 6. If the administrator configures this parameter in the keystone configuration file /etc/yunion/keystone.conf, the configuration file value takes precedence. Furthermore, if the administrator sets this parameter in the configuration stored in the keystone service database, the database setting value takes precedence.

## Access Configuration Stored in Database

Configuration stored in the keystone database needs to be accessed through API. Keystone provides operations to view and modify configuration, and provides corresponding climc commands.

### View Configuration

View configuration for a specified service:

```bash
# View keystone service configuration
climc service-config-show keystone
# View region service configuration
climc service-config-show region2
# View glance service configuration
climc service-config-show glance
```

### Modify Configuration

Modify specified configuration items for a specified service

```bash
# Modify in key=value form, can only modify default section configuration
climc service-config keystone --config 'password_error_lock_count=5'
# Modify in JSON form
climc service-config keystone --config '{"default":{"password_error_lock_count":5}}'
```

### Delete Configuration

Still use the service-config subcommand, but add the --remove parameter to delete specified configuration items. The configuration value can be arbitrary

```bash
climc service-config keystone --config 'password_error_lock_count=0' --remove
```

### Interactive Modification

You can also call the service-config-edit subcommand. This subcommand will call vim, allowing users to interactively modify configurations in batches

```bash
climc service-config-edit keystone
```

### Configuration That Cannot Be Stored in Database

To avoid circular dependencies and avoid the risk of misconfiguration causing services to fail to start, some configuration items cannot be stored in the database, such as configuration items that define database configuration, configuration items that enable debug logs locally, etc. For details, see pkg/apis/identity/consts.go#ServiceBlacklistOptionMap

### Common Configuration

Some configuration items are shared by all services or several services. These common configuration items can be accessed through a special virtual service common:

```
# View common configuration items
climc service-config-show common
# Modify common configuration items
climc service-config-edit common
```

The following are some common configuration items and their meanings:


## Get Service Final Effective Configuration

From the above introduction, it can be seen that a service's configuration items can be configured in multiple places. How to confirm the final effective configuration value of a parameter? Here is a climc command to view the final effective configuration parameters for each service.

```
climc app-options-show <service>
# View keystone service configuration
climc app-options-show keystone
```

## Configuration Change Effectiveness

After the administrator updates configuration items in the database, these configuration items can be automatically delivered to services and take effect. The principle is: After all services start, they will listen to etcd's configuration change channel. When the administrator requests keystone's API to update configuration items for a specified service, keystone will notify the corresponding service through etcd, and the corresponding service will pull and update its configuration. If the configuration requires a service restart to take effect, the service will automatically restart when there are no API requests, achieving configuration effectiveness.

