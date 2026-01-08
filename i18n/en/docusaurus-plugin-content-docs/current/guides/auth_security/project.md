---
sidebar_position: 5
---

# Resource and Permission System

Keystone's resource and permission system is defined by three types of resources: *projects*, *roles*, and *permissions*. Projects are the ownership of resources. To use resources, users must join corresponding projects with specific roles. Roles are associated with policies, defining user permissions.

## Projects

Projects are resource owners. All virtual resources must belong to a project. After users or user groups join a project, they can be authorized to access resources after obtaining permissions.

Projects are generally referred to as *Project*, but for compatibility with Keystone v2 API, they are occasionally referred to as *Tenant*.

### Attributes

Field           | Description
---------------|----------------------------
id	           | Project ID
name           | Project name	
domain_id      | Domain ID to which the project belongs	
project_domain | Name of the domain to which the project belongs	

### Restrictions

Before v3.7, users or groups could only join projects under the same domain or projects under the default domain. Projects under the default domain can join users or groups from any domain. Projects under non-default domains can only join users or groups from the same domain. After v3.7, this restriction was removed. Users or groups from any domain can join projects under any domain.

Projects with external resources in other services cannot be deleted. Resources from other services are pulled every 15 minutes by default, configured through the parameter: fetch_project_resource_count_interval_seconds.

Projects containing users and groups cannot be deleted

The system project cannot be deleted or modified

### Project Namespace

The project namespace is global, meaning project names are globally unique

### Preset Projects

When the system is initialized, a system project is preset as the project for sysadmin


## Roles

Roles are the roles users have when joining projects. User roles determine user permissions.

### Attributes

Role attributes are as follows:

Field           | Description
---------------|-----------------------------
id	           | ID, cannot be modified	
name	       | Name, can be modified	
public_scope   | Sharing scope, optional values are system (global sharing), domain (domain sharing)
policies       | List of permission names at various levels corresponding to this role
match_policies | List of all permission names corresponding to this role

### Restrictions

Users under a domain can only use roles from the project's domain or shared roles to join projects

A role used by users or groups cannot be deleted

Shared roles cannot be deleted

The admin role cannot be deleted

### Role Namespace

The role namespace is global, meaning role names are globally unique

### Preset Roles

When the system is initialized, an admin role is preset as the default role for system user sysadmin to join the system project

At the same time, after system initialization is complete, the installer will automatically create the following shared projects for user convenience:

Role Name       | Shared | Meaning         | Use Case
---------------|----------|--------------|--------------------
admin          | Yes       | Global Administrator   | System administrator role, highest permission role
sa             | Yes       | Operations Administrator   | Generally assigned to operations personnel
fa	           | Yes       | Finance Administrator   | Generally assigned to finance personnel
domainfa       | Yes       | Domain Finance Administrator | Generally assigned to finance personnel within the domain
projectfa      | Yes       | Project Finance Administrator | Generally assigned to finance personnel within the project
project_owner  | Yes       | Project Manager     | Generally assigned to project administrators
project_editor | Yes       | Project Operator   | Generally assigned to administrators within the project, but lacks permissions to create and delete resources
project_viwer  | Yes       | Project Read-Only Personnel | Generally assigned to ordinary members of the project, can only view, cannot operate, create, or delete resources
domainadmin    | Yes       | Domain Administrator     | Generally assigned to domain administrators
domaineditor   | Yes       | Domain Administrator     | Generally assigned to domain administrators
domainviewer   | Yes       | Domain Administrator     | Generally assigned to domain administrators

## Permission Policies

Permissions define permission matching rules, permission scope, and permission definitions

### Attributes

Permission policy attributes are as follows:

Attribute           | Type       | Description
---------------|------------|---------------
id             | String     | ID
name           | String     | Name
policy         | JSONObject | Policy definition, stored in JSON format, can be presented in yaml or json format
scope          | String     | Permission definition scope of the policy, project (project scope permissions), domain (domain scope permissions), or system (system/global permissions)
public_scope   | String     | Sharing scope of the policy, none (not shared), domain (shared to specified domain), system (globally shared)
Domain_id      | String     | Domain ID to which it belongs
Project_Domain | String     | Name of the domain to which it belongs
Is_System      | boolean    | Whether it is a system-defined permission policy
enabled        | boolean    | Whether this policy is enabled

### Permission Policy Definition

The Policy field of permission policies stores the definition. Each permission policy contains the following fields:

Permission Definition   | Type   | Specific permission definition, i.e., whether there is permission for specific operations on specific resources of specific services
-----------|--------|-------------------------------------------------------------
Service	   | string | Applicable service, for example: compute, identity
Resource   | string | Applicable resource type, for example: servers
Operation  | string	| Applicable operation. Supported operations are
Result	   | string	| Policy result, only two values: Allow and Deny

Supported operations for Operation are as follows:

Operation    | Description
--------|----------------------
list    | List all resources
get     | Get details of specified resource
create  | Create new resource
update  | Update
delete  | Delete
perform	| Perform operation, for example, power on/off operations on hosts

### Permission Policy Examples

* Administrator permissions
```yaml
scope: system
policy:
  '*': allow
```

* Read-only for compute service within project
```yaml
scope: project
policy:
  compute:
    get: allow
    list: allow
    '*': deny
```

* Compute service operator within domain (cannot create and delete resources)

```yaml
scope: domain
policy:
  compute:
    '*':
      create: deny
      delete: deny
      '*': allow
```

### System Preset Policies

For convenience, the system has preset more than 150 permission policies, such as system administrator sysadmin, domain administrator domainadmin, project owner: projectadmin, etc.

Among them, to use the web console, users need to have some special permissions, which are predefined in these preset permission policies: sys-dashboard, domain-doshboard, project-dashboard, corresponding to system view, domain view, and project view web console permissions respectively. If a role needs to access the web console, the corresponding permission policy needs to be added to that role.

The following are commonly used preset permissions:

| Permission Name	      | Permission Scope  |	Permission Content                                                   |
|----------------|---------|-----------------------------------------------------------|
| sysadmin       |	Global	  | Global Administrator                                                 |
| syseditor      |	Global    |	Global Operator, has all permissions of sysadmin except for permissions to create and delete resources |
| sysviewer      |	Global	  | Global Read-Only Administrator, has permissions to list and get resource information globally                 |
| domain-admin   |	Domain	    | Administrator permissions for the domain where the user joins the project                                |
| domain-editor  |	Domain	    | All operation permissions for the domain where the user joins the project, does not have permissions to create and delete resources         |
| domain-viewer  |	Domain	    | All read-only permissions for the domain where the user joins the project                              |
| project-admin  |	Project	  |   Administrator permissions for the project the user joins                                    |
| project-editor |	Project	  | Operator permissions for the project the user joins, does not have permissions to create and delete resources               |
| project-viewer |  Project	  | All read-only permissions for the project the user joins                                   |

### Roles and Permissions

Roles need to be associated with permissions. The association relationship is defined in the role_policy association table. This association relationship has the following attributes, defining the conditions for role and permission association:

Attribute       | Type    | Required Field | Description
-----------|---------|--------------|-----------------------------------------------------------------
role_id    | string  | Yes           | Role ID
policy_id  | string  | Yes           | Permission policy ID
project_id | string  | No           | If a project is set, the user only has the corresponding permissions when joining that project with the specified role
ips        | string  | No           | IP whitelist where permissions take effect. If IPS is set, users only have corresponding permissions when logging in through matching IPs
valid_since | time   | No           | Start time when permissions take effect. If set, permissions only take effect after this time point
valid_until | time   | No           | End time when permissions take effect. If set, permissions are valid before this time point and invalid after

For example, if sysadmin permissions are associated with the admin role, and project_id is the ID of the system project, then users must join the system project with the admin role to have sysadmin permissions.

