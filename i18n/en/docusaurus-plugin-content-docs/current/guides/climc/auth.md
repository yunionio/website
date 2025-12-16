---
sidebar_position: 1
---

# Climc Authentication

Introduction to Climc command line tool authentication configuration.

## Authentication Configuration

The process of climc requesting cloud platform backend services is as follows:

1. Use username and password to obtain token from keystone through configuration information
2. Token contains endpoint addresses of backend services
3. climc sends corresponding resource CRUD requests to the corresponding backend services

So before operating resources, we can tell climc which cloud platform and authentication information to operate through environment variables.

Currently climc supports three authentication methods:

- Username/password authentication
- Token authentication (currently cloudshell uses this authentication method)
- [Access Key/Secret authentication](../../development/apisdk/api)


:::warning
1. Since cloudshell has injected token environment variables at startup, the token generation process cannot be seen. If you need to view the token generation process, you need to use the other two authentication methods
2. AccessKey authentication method is similar to public cloud authentication signatures. Currently only python and go SDKs support it. If using other languages, you need to implement the [signature algorithm](https://github.com/yunionio/cloudpods/blob/10b1d9bdd35776cf8cb597d918fa571fbc356238/pkg/mcclient/aksk.go#L80) yourself
:::

## Username/Password Authentication

### Control Node Authentication Configuration

On control nodes, you can directly configure authentication through the following commands.

```bash
# Get environment variables
$ cat /root/.onecloud_rcadmin
export OS_AUTH_URL=https://192.168.0.246:5000/v3
export OS_USERNAME=sysadmin
export OS_PASSWORD=3hV3***84srk
export OS_PROJECT_NAME=system
export YUNION_INSECURE=true
export OS_REGION_NAME=region0
export OS_ENDPOINT_TYPE=publicURL

# Authenticate environment variables
$ source /root/.onecloud_rcadmin
```
Note: If you see *Error: Missing OS_AUTH_URL* when executing climc, please re-execute the `source /root/.onecloud_rcadmin` command.

### Non-Control Node Authentication Configuration

To configure authentication on non-control nodes, first execute on the corresponding control node: `cat /root/.onecloud_rcadmin`;
Save the output authentication information to a local file, and configure authentication through the source command.

The following is a template for username/password authentication configuration file, specifying user information and project information through fields such as OS_USERNAME, OS_DOMAIN_NAME, OS_PASSWORD, OS_PROJECT_NAME, OS_PROJECT_DOMAIN.

```bash
# Get configuration information required for authentication on control nodes.
$ cat /root/.onecloud_rcadmin
export OS_AUTH_URL=https://192.168.0.246:5000/v3
export OS_USERNAME=sysadmin
export OS_PASSWORD=3hV3***84srk
export OS_PROJECT_NAME=system
export YUNION_INSECURE=true
export OS_REGION_NAME=region0
export OS_ENDPOINT_TYPE=publicURL

# Save the above authentication information to a file for convenient source use
$ cat <<EOF > ~/test_rc_admin
# keystone authentication address
export OS_AUTH_URL=https://192.168.0.246:5000/v3
# Username
export OS_USERNAME=sysadmin
# User password
export OS_PASSWORD=3hV3***84srk
# User's project name
export OS_PROJECT_NAME=system
# Allow insecure https connections
export YUNION_INSECURE=true
# Corresponding region
export OS_REGION_NAME=region0
# endpoint type is public
export OS_ENDPOINT_TYPE=publicURL
EOF
```

## Token Authentication

You can use temporarily obtained tokens for authentication. The configuration file template is as follows.
```bash
# Temporary TOKEN
export OS_AUTH_TOKEN=gAAAAABlG_bcoWRX6BV0B5Sb3jN0Maoi......UOyDVGCy4-6_AglLh
# Project name
export OS_PROJECT_NAME=system
# Project domain name
export OS_PROJECT_DOMAIN=Default
# Authentication interface
export OS_AUTH_URL=https://192.168.0.246:5000/v3
# Service Endpoint type to use
export OS_ENDPOINT_TYPE=public
# Whether to cache token
export YUNION_USE_CACHED_TOKEN=false
# Whether to not verify TLS certificate
export YUNION_INSECURE=true
```

Temporary tokens can be obtained through the following climc command:

```bash
$ climc session-show
+-------------------+---------------------------------------------------------------------------------------------------------------------------+
||       Field       |                                                           Value                                                           |
+-------------------+---------------------------------------------------------------------------------------------------------------------------+
|| context           | {"ip":"192.168.0.246","source":"cli"}                                                                                     |
|| domain            | Yunion                                                                                                                    |
|| domain_id         | a0fc05a5ac5...c8d612c9631a1c                                                                                              |
|| domain_policies   | ["domain-admin"]                                                                                                          |
|| endpoint_type     | public                                                                                                                    |
|| expires           | 2023-10-04T13:35:25.485534Z                                                                                               |
|| project_domain    | Default                                                                                                                   |
|| project_domain_id | default                                                                                                                   |
|| project_policies  | []                                                                                                                        |
|| region            | YunionHQ                                                                                                                  |
|| role_ids          | 5fc1e5c088984e2....cb,e40d785012...682e3a0c647f340b5                                                                      |
|| roles             | admin,domainadmin                                                                                                         |
|| system_policies   | ["sysadmin"]                                                                                                              |
|| tenant            | system                                                                                                                    |
|| tenant_id         | a7f2e2a81a1e4850a41eae5f140ceb14                                                                                          |
|| token             | gAAAAABlHBidVk6AT58hAHjN3E6tYtliGE061xRSVARWtdW7Z.................................fIeJY3ToKLz-A19rSYql8RKzzG4EkrnKuYD_4NY |
|| user              | qiujian                                                                                                                   |
|| user_id           | 0d48cd5032970fe....c0d9022f9c2346fd                                                                                       |
+-------------------+---------------------------------------------------------------------------------------------------------------------------+
```

## Access Key/Secret Authentication

The following is a template for Access Key/Secret authentication configuration file, specifying user's Access Key/secret through two fields: OS_ACCESS_KEY, OS_SECRET_KEY.

```bash
# Get user's Access Key/Secret in a project on control nodes

# Generate Secret Key
$ climc credential-create-aksk
+--------+----------------------------------------------+
|| Field  |                    Value                     |
+--------+----------------------------------------------+
|| expire | 0                                            |
|| secret | VGFxZkE3QTd2MmhCbmZkVkJDcFZFaGJYdUQ2c05mUXM= |
+--------+----------------------------------------------+

# ID is Access Key
$ climc credential-list
+-----------------------+------------+------------+-----------------------+---------+---------+-----------+---------+-----------------------+-------------+--------------+-----------------------+------+-----------------------+----------------------+----------+----------------------+
||         blob          | can_delete | can_update |      created_at       | deleted | domain  | domain_id | enabled |          id           | is_emulated |     name     |      project_id       | type |    update_version     |      updated_at      |   user   |       user_id        |
+-----------------------+------------+------------+-----------------------+---------+---------+-----------+---------+-----------------------+-------------+--------------+-----------------------+------+-----------------------+----------------------+----------+----------------------+
|| {"expire":0,"secret": | true       | true       | 2020-06-15T11:43:32.0 | false   | Default | default   | true    | 0d184a3c9c484e4c892f4 | false       | --1592221412 | d53ea650bfe144da8ee8f | aksk | 0                     | 2020-06-15T11:43:32. | sysadmin | a063d8e2cd584cc48194 |
|| "VGFxZkE3QTd2MmhCbmZk |            |            | 00000Z                |         |         |           |         | 855935e37e7           |             |              | 3fba417b904           |      |                       | 000000Z              |          | 5e7169280435         |
|| VkJDcFZFaGJYdUQ2c05mU |            |            |                       |         |         |           |         |                       |             |              |                       |      |                       |                      |          |                      |
|| XM="}                 |            |            |                       |         |         |           |         |                       |             |              |                       |      |                       |                      |          |                      |
+-----------------------+------------+------------+-----------------------+---------+---------+-----------+---------+-----------------------+-------------+--------------+-----------------------+------+-----------------------+----------------------+----------+----------------------+
***  Total: 1 Pages: 1 Limit: 2048 Offset: 0 Page: 1  ***

# Save authentication information to a file for convenient source use
$ cat <<EOF > ~/test_rc_aksk
# Access Key
export OS_ACCESS_KEY=0d184a3c9c484e4c892f4855935e37e7  
# Secret, note there's an '=' at the end, don't miss copying it
export OS_SECRET_KEY=VG***5mUXM=
# Allow insecure https connections
export YUNION_INSECURE=true
# keystone authentication address
export OS_AUTH_URL=https://192.168.0.246:5000/v3
# Corresponding region
export OS_REGION_NAME=region0
EOF
```

## Verification

After template configuration is complete, verify that authentication environment variable configuration is successful through the following method.

```bash
# source authentication environment variables
$ source ~/test_rc_admin
# Or if you want to use Access Key/Secret login
$ source ~/test_rc_aksk

# Execute climc. For example, view VM list
$ climc server-list --scope system
```

Note: If you see *Error: Missing OS_AUTH_URL* when executing climc, please source or set authentication cloud platform environment variables.

You can view climc version number to get build information.

```bash
$ climc --version
Yunion API client version:
 {
  "major": "0",
  "minor": "0",
  "gitVersion": "v3.1.9-20200609.1",
  "gitBranch": "tags/v3.1.8^0",
  "gitCommit": "5591bbec4",
  "gitTreeState": "clean",
  "buildDate": "2020-06-09T12:00:48Z",
  "goVersion": "go1.13.9",
  "compiler": "gc",
  "platform": "linux/amd64"
}
```
