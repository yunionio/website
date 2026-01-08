---
sidebar_position: 7
---

# Resource Project Synchronization

Describes project ownership issues during resource synchronization.

## Basic Concepts

- Cloud project: Refers to the mapping relationship between local projects and cloud projects
- Synchronization policy: Refers to a description specifically for resource ownership when cloud resources are synchronized to local

## Cloud to Local Resource Ownership Description

- When cloud account is not associated with synchronization policy:
    1. Resources created locally or resources whose projects have been changed will not change project ownership during resource synchronization
    2. Find the cloud-to-local mapping relationship based on the cloud project mapping table and change resource project ownership
    3. If no cloud project mapping relationship is found, resources belong to the project where the cloud subscription is located
- When cloud account is associated with synchronization policy:
    1. Resources newly created locally or resources whose projects have been changed will also change resource ownership according to the synchronization policy
    2. Priority is given to settings in the synchronization policy. If not matched, ownership follows steps 2 and 3 when the cloud account is not associated with a synchronization policy

## Local to Cloud Project Synchronization

Assume the cloud project mapping relationship is as follows, and all cloud projects are normally available

| Cloud Project | Priority | Local Project |
|----------|--------|----------|
| cloud-A  | 0      | local-A  |
| cloud-B  | 3      | local-B  |
| cloud-C  | 2      | local-B  |
| cloud-D  | 0      | local-C  |

- If local-A project is used when creating resources, according to the mapping table, local-A maps to cloud-A project, and created resources will belong to cloud-A project
- If local-B project is used when creating resources, according to the mapping table, both cloud-B and cloud-C can be selected, but cloud-B has the highest priority, and created resources will belong to cloud-B project
- If local-D project is used when creating resources, no mapping relationship is found in the mapping table, then a local-D project with the same name will be created on cloud, and created resources will belong to the local-D project on cloud

## Project Auto Rename

This function is supported starting from v3.11. After the cloud name is changed, the local project name changes simultaneously. After the cloud project is deleted, the local project will be deleted as well (resources will not be directly deleted)

Prerequisites:
- Cloud account has auto-create project enabled
- Cloud account is not bound to synchronization policy
- Region service has auto-rename function enabled (disabled by default)
- Local project only maps to one cloud project of one cloud account

Region service method to enable/disable auto-rename:
```shell
# Disable auto-rename
$ climc service-config region2 --config 'enable_auto_rename_project=false'
# Enable auto-rename
$ climc service-config region2 --config 'enable_auto_rename_project=true'
```

:::warning
If the local project is deleted, the cloud account will re-establish the mapping relationship based on the cloud name during synchronization
:::

