---
sidebar_position: 4
---

# GitHub Issues Usage Guide

Introduction to cloudpods issues processing logic and usage methods.

All related issues of Cloudpods are managed and maintained at [https://github.com/yunionio/cloudpods/issues](https://github.com/yunionio/cloudpods/issues).

## Processing Logic

The current issue processing logic is as follows:

### Issue Lifecycle Related

- When users create issues:
    - Add the 'state/awaiting processing' label, indicating this problem is pending processing
- If an issue has not been updated for more than 30 days:
    - Add the stale label, indicating it has been inactive for a long time
    - If an issue has the announcement label, even if it hasn't been updated for more than 30 days, it won't get the stale label
- If an issue with the 'state/awaiting user feedback' label hasn't been updated for more than 37 days:
    - Automatically close the issue
- If an issue is closed:
    - If the issue doesn't have the stale label, it will remove the 'state/awaiting user feedback' and 'state/awaiting processing' labels

### Issue Comment Related

- When an issue receives a comment:
    - If the comment is from the issue creator:
        - Add the 'state/awaiting processing' label
        - And remove the 'state/awaiting user feedback' label
    - If the comment is from other users:
        - Add the 'state/awaiting user feedback' label
        - And remove the 'state/awaiting processing' label
        - If you don't want to remove 'state/awaiting processing', you need to add the '/keep-state' keyword in the comment

## Usage Guide

After labeling issues, you can filter based on labels. Common scenarios can be filtered using the following methods:

### Query Currently Pending Problems

Just query issues that are open, have the 'state/awaiting processing' label, and don't have the 'stale' label.

Github frontend can filter using the following expression:

```
is:open is:issue label:"state/awaiting processing" -label:stale 
```

Corresponding to Cloudpods issues page:

[https://github.com/yunionio/cloudpods/issues?page=1&q=is%3Aopen+is%3Aissue+label%3A%22state%2Fawaiting+processing%22+-label%3Astale](https://github.com/yunionio/cloudpods/issues?page=1&q=is%3Aopen+is%3Aissue+label%3A%22state%2Fawaiting+processing%22+-label%3Astale)

### Query Expired but Pending Problems

These types of problems need attention, usually problems we haven't processed for more than 30 days.

Just query issues that are open and have both 'state/awaiting processing' and 'stale' labels.

Github frontend can filter using the following expression:

```
is:open is:issue label:"state/awaiting processing" label:stale
```

Corresponding to Cloudpods issues page:

[https://github.com/yunionio/cloudpods/issues?q=is%3Aopen+is%3Aissue+label%3A%22state%2Fawaiting+processing%22+label%3Astale](https://github.com/yunionio/cloudpods/issues?q=is%3Aopen+is%3Aissue+label%3A%22state%2Fawaiting+processing%22+label%3Astale)

### Query Expired but Closed Problems

These types of problems are usually cases where users haven't replied for a long time. These problems have query value, sometimes you need to find these problems and reopen them.

Query issues that are closed and have the 'stale' label.

Github frontend can filter using the following expression:

```
is:closed is:issue label:stale
```

Corresponding to Cloudpods issues page:

[https://github.com/yunionio/cloudpods/issues?q=is%3Aclosed+is%3Aissue+label%3Astale](https://github.com/yunionio/cloudpods/issues?q=is%3Aclosed+is%3Aissue+label%3Astale)

