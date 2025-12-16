---
sidebar_position: 2
---

# API Access Method

Cloudpods APIs are provided by various backend services respectively. Therefore, to access APIs, the API caller must be able to directly access each service. Each service's API can be accessed through two URL addresses. One is a URL with EndpointType of internal, which can only be accessed within the Kubernetes cluster; the other is a URL with EndpointType of public, which is the Node Port access URL of the host machine hosting the platform service.

There are several deployment options for services calling APIs:

## Deployed within Kubernetes Cluster

In this case, the API caller can directly access each service's service cluster IP, so it can access each service's address with EndpointType of internal.

## In the Same Internal Network Security Domain as the Host

In this case, the API caller can directly access the host's Node Port, so it can access each service's address with EndpointType of public.

## Not in the Same Network Security Domain as the Platform

In this case, the service caller cannot directly access the cluster host's Node Port and needs to access through a unified API entry point, which facilitates network security policies.

### Unified API Entry Point

For this purpose, the API gateway provides a unified API entry point. The entry URL of each backend service API is uniformly forwarded by the API gateway, and the following path needs to be inserted in the access path:

```
/api/s/<service_type>
```

For example, the normal REST API for accessing the network (networks) list service of the region service is as follows, and you need to directly access the internal or public Endpoint of the region service.

```
GET /networks
```

The REST API through the unified API gateway is as follows, where compute_v2 is the service type of the region service.

```
GET /api/s/compute_v2/networks
```

### Enable Unified API Entry Point

This unified API entry point is disabled by default and needs to be enabled through configuration in the apigateway service:

```
climc service-config-edit yunionapi
```

Set the following configuration item to True:

```
  enable_backend_service_proxy: true
```

After setting, the apigateway service needs to be restarted.

### SDK and climc Using Unified API Entry Point

To facilitate the use of the unified API entry point, SDK and climc have made the following changes:

[Code Example](https://github.com/yunionio/cloudpods/blob/be62b3e0495d687f0d7e45bc73df6a6abef5f8ac/pkg/mcclient/README.md?plain=1#L62)

* The authentication service entry needs to be set to:

```
https://<ip_or_domain_of_apigatway>/api/s/identity/v3
```

* EndpointType needs to be set to apigateway


### climc Configuration

climc needs to configure the following environment variables to use the unified API entry point to access the backend:

```
export OS_AUTH_URL=https://<ip_or_domain_of_apigatway>/api/s/identity/v3
export OS_ENDPOINT_TYPE=apigateway
```

For example, if the web console access address is: [https://192.168.220.71](https://192.168.220.71), then the unified API AUTH_URL address is: [https://192.168.220.71/api/s/identity/v3](https://192.168.220.71/api/s/identity/v3).

