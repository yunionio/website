---
title: "Quota System"
date: 2019-08-04T20:51:23+08:00
weight: 4
edition: ee
description: >
  Introduction to Keystone's domain and project resource quota management
---


Quotas define the upper limit of resources that a domain or project can obtain. Quotas for domains or projects are managed by each resource management service, but since quotas are closely related to domains and projects, they are also introduced here.

## Domain Quota

Domain quota is the quota set by the system administrator for a domain. The sum of quotas for all projects under a domain cannot exceed the domain quota.

## Project Quota

Project quota is the resource quota set by the domain administrator for a project. When resources are created, only the project quota is checked, not the domain quota.


