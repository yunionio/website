---
sidebar_position: 3
---

# Azure Create Subscription Settings

Describes how to grant permissions to applications to support creating subscriptions

## Prerequisites

- Azure account is an international account
- Azure account is an enterprise account
- The account entered in the platform and the application in this document are the same

## Log in to Azure Console, Enable CloudShell

![](./images/az_cloud_shell.png)

## Get enrollment account id

Execute az billing enrollment-account list in the cloud shell above, as shown below

![](./images/az_enrollment_account.png)

Here assume the id is /providers/Microsoft.Billing/enrollmentAccounts/747ddfe5-xxxx-xxxx-xxxx-xxxxxxxxxxxx, save it for later use

## Get Application Id

Go to Azure Active Directory => App registrations, find the application in use, and obtain the Application (client) ID, then execute in cloud shell
```shell
az ad sp show --id 7ffdacec-8769-4802-9975-4ba7a2906ec8 | grep id
```

![](./images/az_app_id.png)

Obtain the Application Id as 5b744b52-4215-4cc7-b776-429ce447c62c, save it for later use


## Grant Application enrollment account Owner Permission

Open cloud shell and execute

```shell
# Here 5b744b52-4215-4cc7-b776-429ce447c62c is the Application Id
# /providers/Microsoft.Billing/enrollmentAccounts/747ddfe5-xxxx-xxxx-xxxx-xxxxxxxxxxxx is the enrollment account id
az role assignment create --role Owner --assignee-object-id 5b744b52-4215-4cc7-b776-429ce447c62c --scope /providers/Microsoft.Billing/enrollmentAccounts/747ddfe5-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

As shown in the figure, the permission has been granted successfully
![](./images/az_assign_role.png)


:::tip
If you encounter an **EntitlementNotFound** error when creating a subscription, you need to enable [Create Subscription Permission](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/ea-portal-administration#enterprise-devtest-offer) on ea according to the documentation
:::

## Reference Documentation

- [Programmatically Create Subscriptions](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/programmatically-create-subscription-preview?tabs=azure-cli)
- [Permission Grant Documentation](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/grant-access-to-create-subscription?tabs=rest%2Crest-2)
- [Enable Create Subscription Permission](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/ea-portal-administration#enterprise-devtest-offer)

