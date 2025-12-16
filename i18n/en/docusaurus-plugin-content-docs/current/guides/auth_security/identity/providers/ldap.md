---
sidebar_position: 3
---

# LDAP Authentication Source

LDAP authentication sources support importing users and groups from LDAP, including Microsoft Active Directory (MSAD), OpenLDAP, and generic LDAP servers.

Domain, user, and group definitions come from LDAP. Adding and deleting are not allowed. Fields that cannot be modified are shown in the following table.

Resource | Non-modifiable Field Names
-----|------------------------------------------------------
Domain   | name
Group   | name, displayname
User | name, displayname, enabled, mobile, email, password

Basic configuration for LDAP authentication sources is as follows:

Configuration Item     | Description                                          | Example
-----------|-----------------------------------------------|------------------------------------------
url	       | Server address, must start with ldap:// or ldaps:// | ldap://192.168.222.201:389
suffix	   | DN of LDAP root path	                                   | DC=ipa,DC=yunionyun,DC=com
user       | Username of read-only account for accessing LDAP. For AD, it's the username. For OpenLDAP, it's the user's DN	| UID=dcadmin,CN=users,CN=accounts,DC=ipa,DC=yunionyun,DC=com
password   | Password of read-only account for accessing LDAP                                          | 	

For templates that import a single domain, you need to specify the user_tree_dn and group_tree_dn parameters

Configuration Item        | Description                                           | Example
--------------|------------------------------------------------|------------------------------------------------- 
user_tree_dn  | User search root path, will recursively search for users under this path | CN=users,CN=accounts,DC=ipa,DC=yunionyun,DC=com
group_tree_dn | Group search root path, will recursively search for groups under this path     | CN=groups,CN=accounts,DC=ipa,DC=yunionyun,DC=com


For templates that import multiple domains, you need to specify domain_tree_dn

Configuration Item         | Description                                                 | Example
---------------|------------------------------------------------------|----------------------------------
domain_tree_dn | Domain search root path, will search for domains in first-level child nodes under this path | OU=集团公司,DC=yuniondc,DC=com


For non-template LDAP configurations, there are the following configuration items:

Configuration Item          | Description                                                  | msad_one_domain Default Value  | msad_multi_domain Default Value | openldap_one_domain Default Value
---------------|------------------------------------------------------|------------|----------|----------
query_scope	   | Default search scope: entire subtree (sub) under tree_dn or current level (one)  | NA | NA | NA
import_domain  | Whether to import domain | false | true | false
domain_tree_dn | If import_domain is true, root path for importing domain information | NA | - | NA
domain_filter  | Filter for searching domains | NA | - | NA
domain_objectclass | Object class corresponding to domain | NA | organizationalUnit | NA
domain_id_attribute	| Attribute name corresponding to domain ID | NA | objectGUID | NA
domain_name_attribute | Attribute name corresponding to domain name   | NA | name | NA
domain_query_scope | Scope for searching domain information: sub or one | NA | one | NA
user_tree_dn          | DN of root node for importing user information. If import_domain is true, this field is meaningless   | - | NA | -
user_filter	          | Filter for searching users   | - | - | -
user_objectclass      | Object class corresponding to user   | organizationalPerson | organizationalPerson | person
user_id_attribute     | Object attribute name corresponding to user ID   | sAMAccountName | sAMAccountName | uid
user_name_attribute   | Object attribute name corresponding to username   | sAMAccountName | sAMAccountName | uid
user_enabled_attribute | Attribute name for user enabled status  | userAccountControl | userAccountControl | nsAccountLock
user_enabled_mask      | Mask corresponding to user enabled attribute  | 2 (0x10) | 2 (0x10) | 0
user_enabled_default   | Default value for user enabled attribute  | 512 | 512 | FALSE
user_enabled_invert	   | Whether user enabled attribute is inverted  | true | true | true
user_additional_attribute_mapping | Mapping table for additional user attributes | {"displayName:displayname", "telephoneNumber:mobile", "mail:email" } | {"displayName:displayname", "telephoneNumber:mobile", "mail:email" } | {"displayName:displayname", "mobile:mobile", "mail:email" }
user_query_scope                  | Scope for searching user information: sub or one | sub | sub | sub
group_tree_dn                     | Root path for importing group information | - | - | -
group_filter                      | Filter for searching groups | - | - | -
group_objectclass                 | Object class corresponding to group | group | group | ipausergroup
group_id_attribute                | Object attribute name corresponding to group ID | sAMAccountName | sAMAccountName | cn
group_name_attribute              | Object attribute name corresponding to group name | name | name | cn
group_member_attribute            | Object attribute name corresponding to group member attribute | member | member | member
group_members_are_ids             | Whether group member list contains user IDs or usernames | false | false | false
group_query_scope                 | Scope for searching group information: sub or one | sub | sub | sub

### Authentication Source Synchronization

For authentication sources such as LDAP that can be fully synchronized, domain, user, and group information will be fully synchronized periodically. The synchronization cycle is 15 minutes by default and can be configured through the parameter default_sync_interval_seoncds.

### Configuration Commands

LDAP authentication sources support three modes:

1. Single Domain Mode

Import users and groups under the specified LDAP dn_tree into a specified domain. This mode supports two import templates: msad_one_domain, which is the MSAD import template, and openldap_one_domain, which is the OpenLDAP import template.

```bash
climc idp-create-ldap-single-domain --target-domain example_domain --url ldap://192.168.222.102 --suffix 'DC=ipa,DC=example,DC=com' --user 'UID=dcadmin,CN=users,CN=accounts,DC=ipa,DC=example,DC=com' --password <password> --user-tree-dn 'CN=users,CN=accounts,DC=ipa,DC=example,DC=com' --group-tree-dn 'CN=groups,CN=accounts,DC=ipa,DC=example,DC=com' mainLdap openldap_one_domain
```

2. Multi-Domain Mode

Import each OU under the specified LDAP dn_tree as a new domain, and import users and groups under the corresponding OU into the corresponding domain. This mode only supports one template msad_multi_domain, which only supports MSAD import (because only MSAD supports the OU concept).

```bash
climc idp-create-ldap-multi-domain --url 'ldap://192.168.222.102' --suffix 'DC=example,DC=com' --user 'dcadmin' --password <password> --domain-tree-dn 'OU=集团公司,DC=example,DC=com' multildap msad_multi_domain
```

3. Custom Mode

Fully custom mode, requiring users to specify all LDAP parameters. This mode has complex parameters and is only recommended when the above modes do not work.

```bash
climc idp-create-ldap [--no-auto-create-project] [--target-domain TARGET_DOMAIN] [--auto-create-project] [--query-scope {one,sub}] [--user USER] [--password PASSWORD] [--disable-user-on-import] [--domain-tree-dn DOMAIN_TREE_DN] [--domain-filter DOMAIN_FILTER] [--domain-objectclass DOMAIN_OBJECTCLASS] [--domain-id-attribute DOMAIN_ID_ATTRIBUTE] [--domain-name-attribute DOMAIN_NAME_ATTRIBUTE] [--domain-query-scope {one,sub}] [--user-tree-dn USER_TREE_DN] [--user-filter USER_FILTER] [--user-objectclass USER_OBJECTCLASS] [--user-id-attribute USER_ID_ATTRIBUTE] [--user-name-attribute USER_NAME_ATTRIBUTE] [--user-enabled-attribute USER_ENABLED_ATTRIBUTE] [--user-enabled-mask USER_ENABLED_MASK] [--user-enabled-default USER_ENABLED_DEFAULT] [--user-enabled-invert] [--user-additional-attribute USER_ADDITIONAL_ATTRIBUTE] [--user-query-scope {one,sub}] [--group-tree-dn GROUP_TREE_DN] [--group-filter GROUP_FILTER] [--group-objectclass GROUP_OBJECTCLASS] [--group-id-attribute GROUP_ID_ATTRIBUTE] [--group-name-attribute GROUP_NAME_ATTRIBUTE] [--group-member-attribute GROUP_MEMBER_ATTRIBUTE] [--group-members-are-ids] [--group-query-scope {one,sub}] <--url URL> <--suffix SUFFIX> <NAME>
```

