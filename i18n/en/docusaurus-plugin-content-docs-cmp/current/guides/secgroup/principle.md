---
sidebar_position: 1
---

# Principle Introduction

Introduction to security group related design.

Starting from v3.11, security groups will adopt a one-to-one mode from local to cloud. Modifying a single security group rule will directly synchronize and affect the corresponding security group rule on cloud.

## Operations Involved in Security Group Operations

### Security Group Creation

Creating a security group requires selecting the corresponding region, cloud account or vpc. Security group creation will create the corresponding security group on cloud. Some clouds will have some default security group rules when creating security groups. After creation is complete, these rules will be synchronized to local and can be deleted as needed.

### Security Group Rule Addition, Deletion and Modification

- For simple security groups, only modification of source IP and port information is supported
- Complex security group rules only support deletion
- Support creating simple security group rules

### Security Group Deletion

Only unused security groups (security groups not bound to any resources) can be deleted
- Security group deletion will delete the corresponding security group on cloud

### Binding Security Groups When Creating Resources

- Security groups bound when creating resources (such as virtual machines)
    - If no security group is specified, a default security group will be found or created and associated based on information such as the vpc region where the virtual machine is located
    - If a security group is specified, you need to first select vpc, then associate the security groups under vpc

### Synchronization of Cloud Platform Security Groups to Local

When cloud account synchronization occurs, security groups will be synchronized to the Cloudpods platform according to security group ownership

### Cloud Account Deletion

- When a cloud account is deleted, all security group records under this account will be deleted

