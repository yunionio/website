---
sidebar_position: 6
---

# Service Catalog

Introduces how Keystone's service catalog works. The Keystone service catalog defines regions, services, and service access endpoints within specified regions.

## Region

A region defines a deployment area. When multiple sets of services are deployed for users, each set of services is assigned a region identifier to distinguish them. When accessing services, by specifying a region, you can obtain access endpoints for the same service in different regions, allowing multiple sets of the same service to coexist.

### Restrictions

When there are access endpoints under this region, the region cannot be deleted


## Service

A service defines an API-providing service

### Service Attributes

Field    | Description
--------|---------------------
id      | Service ID, immutable ID	
name    | Service name	
type    | Service type. Typical service types include: compute, image, identity, k8s, meter, etc.
enabled	| Whether the service is enabled	

### Restrictions

When there are access endpoint definitions for this service, the service cannot be deleted

When the service is enabled, it cannot be deleted


## Service Access Points (endpoints)

An access point defines a service URL for a service in a specified region. It is divided into types such as public/internal and admin.

### Access Endpoint Attributes

| Field        | Description                                                                                                                                                                                            |
| ----------- | -----------------                                                                                                                                                                               |
| id          | ID                                                                                                                                                                                              |
| name        | Name                                                                                                                                                                                            |
| region_id   | The region to which the service access point belongs                                                                                                                                                                            |
| service_id  | The service to which the service access point belongs                                                                                                                                                                            |
| url         | Access URL of the access endpoint                                                                                                                                                                               |
| interface   | Interface type of the access endpoint. Currently supports four types: internal/public/admin/console. The internal type access endpoint is used by default. When a console type access endpoint for a service is defined, a link to jump to this URL will be displayed in the service catalog of the frontend console |
| enabled     | Whether the access endpoint is enabled                                                                                                                                                                                |

### Restrictions

When this access endpoint is enabled, it cannot be deleted

