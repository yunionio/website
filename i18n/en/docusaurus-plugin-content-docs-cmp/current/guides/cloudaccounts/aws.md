---
sidebar_position: 2
---

# AWS Integration Common Questions

## Permission Requirements for Obtaining AWS Sub-Account Resource Information

If the AWS account connected to the cloud management platform belongs to an organization (Organization), you can configure permissions to synchronize all accounts under the AWS organization to the cloud management platform, with each account corresponding to a subscription under the cloud account.

The principle for obtaining resources under each member account of the AWS organization is: use an IAM account's AKSK under a master account to obtain OrganizationAccountAccessRole permissions through AssumeRole, and access resources under each member account

Permission configuration requirements are as follows:

1. The connected AK/SK must be an IAM user's AK/SK under a master account, not the master account's main AKSK

2. The minimum permission requirement for this IAM user is: sts:AssumeRole

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "sts:AssumeRole",
            "Resource": "arn:aws:iam::*:role/OrganizationAccountAccessRole"
 
        }
    ]
}
```

3. Each member account has a Role: OrganizationAccountAccessRole

For newly created AWS member accounts under the AWS organization (Organization), there is automatically a Role: OrganizationAccountAccessRole, and this role's permissions are equivalent to AdministratorAccess

If it's an AWS member account invited to join, this Role may not exist and needs to be added manually. For specific steps, refer to: https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_accounts_access.html#orgs_manage_accounts_create-cross-account-role

