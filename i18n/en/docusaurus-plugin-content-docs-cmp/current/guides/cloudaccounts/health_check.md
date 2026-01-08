---
sidebar_position: 1
---

# Health Check

Health check determines whether a cloud account can normally create resources through balance information.

## Function Description

- Some public clouds have consumption limits. For example, Alibaba Cloud cannot perform resource creation operations when the balance is below 100
- In order to ensure resource creation success as much as possible, the system defaults to automatically set cloud account health status based on cloud account balance information
- Cloud account health abnormalities will not affect resource synchronization, but will only limit resource creation operations. Please recharge as soon as possible or turn off the health check function


## Special Cases

- Because some enterprises may have agreements with public clouds or use vouchers, they can still create resources even when the account is abnormal. This function greatly limits the use of the cloud platform
- Users can turn this function on or off according to their needs

## Function Switch

```bash
# This function switch affects all cloud accounts

# Turn off cloud account health check
$ climc service-config --config cloudaccount_health_status_check=false region2

# Turn on cloud account health check
$ climc service-config --config cloudaccount_health_status_check=true region2

```

:::tip
The function switch will not immediately affect cloud account status. You can wait a few minutes for the cloud account status to update
Or go to the cloud account list, select a cloud account, and click the connection status. The cloud account health status will update immediately
:::

