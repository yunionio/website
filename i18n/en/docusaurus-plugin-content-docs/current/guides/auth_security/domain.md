---
title: "Domain (Tenant)"
date: 2019-08-04T20:51:23+08:00
weight: 2
description: >
  Introduction to the concept of domain or tenant
---

To achieve multi-tenant effects, the authentication service provides the concept of domains. A domain has a complete user authentication system and resource and permission system, allowing a domain administrator to completely autonomously manage users, groups, projects, roles, and permission policies within the domain.

## Domain Attributes

| Field Name | Description     |
|----------|----------|
| id       | ID, read-only |
| name     | Name     |
| enabled  | Whether enabled |

## Domain Restrictions

- A domain can only be deleted when there are no projects, roles, or policies within the domain, and it is set to enabled=false state
- The default domain cannot be deleted
- The following attributes of domains synchronized from LDAP cannot be modified: name

## Domain Namespace

The domain namespace is global, meaning domain names are globally unique

## Preset Values

After system initialization, a default domain is preset as the domain where the initial sysadmin account and system project are located

