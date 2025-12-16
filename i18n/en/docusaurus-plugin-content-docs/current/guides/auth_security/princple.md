---
sidebar_position: 1
---

# Authentication Service Principles

The platform authentication service component (keystone) initially adopted OpenStack's keystone component. In 2019, it was refactored using golang to implement the keystone component, maintaining compatibility with OpenStack Keystone v3.0 API, and extended the implementation of authentication sources (identity_provider) and permissions (policy), making it easier to implement complex authentication sources (such as SAML 2.0) and permission systems.

Currently, the authentication service component (keystone) has three main functions:

- Provide a user authentication system to prove to other systems whether a user is legitimate and provide user attributes. Concepts involved include authentication sources (identity_providers), domains, users, and groups.
- Provide a resource ownership system to provide other systems with a domain and project resource ownership system. Concepts designed include domains and projects.
- Provide a permission system that defines user/group permissions for resources. Concepts involved include projects, roles, and permission policies.

In addition, the authentication service also provides the following functions:

* Service catalog, providing service and service endpoint URL information, including region, service, endpoint, and other information.
* Configuration management, providing a basic setup for configuration management for each service, including add, delete, modify, and query functions for configuration information.

To achieve multi-tenant effects, the authentication service provides the concept of domains. A domain has a complete user authentication system and resource and permission system, allowing a domain administrator to completely autonomously manage users, groups, projects, roles, and permission policies within the domain.

Related resources and concepts are as follows:

| Resource         | Name   | Description                                                                           |
|------------------|--------|--------------------------------------------------------------------------------|
| IdentityProvider | Authentication Source	| Represents the source of authentication (domain/user/group) information. The system has a built-in SQL authentication source. Supports LDAP authentication sources.|
| Domain           | Domain	    | Represents a subset of authentication, containing corresponding users, groups, projects, roles, and policies. There is a default domain.| 
| User             | User   | Resource Operator. Users are entities that perform specific operations but do not own resources. To access resources, users must join specific projects and have specific permissions. The system has a default account sysadmin, which is automatically created during system deployment.|
| Group            | Group     | A collection of users. Adding a group to a project automatically adds users in the group to that project.|
| Project          | Project   | Resource Owner. Resources must belong to a project. The system has a default project system, which is automatically created when the system starts, and system administrators are added to this project by default.|
| Role             | Role   | A user's role in a project, used to determine the user's role. A user can have multiple roles in a project. The user's permissions in that project are the highest permissions of all matching policy-defined permissions. The system predefines a series of roles. This includes the admin role.|
| Policy           | (Permission) Policy   | Defines permissions for users with specified projects and specified roles. The system predefines a series of policies.|

The relationship between domains, projects, users, groups, and roles is shown in the following figure: There can be multiple domains in the system, and resources under each domain belong to several projects. Users or user groups join projects with specific roles, thereby being able to use resources in the projects. User and group authentication information comes from authentication sources. User and group permissions within projects are determined by permission policies corresponding to the roles of that user or group within the project.

![](./images/identity_concepts.png)


