---
sidebar_position: 04
---

# Users and Groups

## Users

Users are platform users and operators with the following attributes:

| Attribute              | Description                                                                                  |
|-------------------|---------------------------------------------------------------------------------------|
| id                | User ID                                                                                |
| name              | User name, can only be letters and numbers                                                            |
| displayname       | Display name, can be Chinese                                                                  |
| mobile            | User mobile number                                                                            |
| email             | User email address                                                                          |
| description       | Description                                                                                  |
| enabled           | Whether enabled, disabled users cannot authenticate                                                            |
| domain_id         | Domain ID                                                                                  |
| project_domain    | Domain name                                                                                |
| is_system_account | Whether it is a system account. If it is a system account, users cannot be seen in user-list, only visible when the system attribute is specified |
| enable_mfa        | Whether to enable two-factor authentication for web console                                                           |
| allow_web_console | Whether to allow login to console                                                                    |


### User Resource Restrictions

* Users can only join groups under the same domain
* Group member attributes of LDAP users cannot be changed. LDAP users cannot join or leave LDAP groups
* sysadmin user cannot be deleted or modified

### User Namespace

The user namespace is the domain. Users under different domains can have the same name. User names under one domain cannot conflict.

### Preset Users

After system initialization, the default domain has a preset user sysadmin, who joins the system project with the admin role as the system's root user. Each service has a preset user, such as regionadmin, meteradmin, etc.

## Groups

Groups are collections of users. Nested groups are currently not supported. Group members can only be users.

### Group Restrictions

* Users in a group must belong to the same domain as the group
* Group member attributes of LDAP users cannot be changed. LDAP users cannot join or leave LDAP groups

### Group Namespace

The group namespace is the domain. Groups under different domains can have the same name.

