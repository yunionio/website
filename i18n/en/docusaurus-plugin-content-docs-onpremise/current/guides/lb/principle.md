---
sidebar_position: 1
---

# Principle Introduction

## Concepts

When using the load balancer functionality provided by the platform, the following terms will be used.

Load Balancer Instance, sometimes also abbreviated as "Instance". Instances are associated with subnets. You need to select a subnet when creating an instance. The instance's IP address is allocated from this subnet.

An instance can have multiple load balancer listeners (Listener). Listener types are usually HTTP, HTTPS, TCP, UDP. Each listener also needs to specify a port. Instances and listeners together express the service's external address, protocol, and port.

Backend Server Group (Backend Group), Backend Server (Backend). Each backend server specifies the service backend's IP and port. Multiple backend servers in the same server group provide the same service.

Listeners can specify backend server groups. When users access the listener's address, the load balancer's forwarding node will forward requests to specific backends in the server group, thus achieving load balancing effects.

Load balancer cluster is a collection of forwarding nodes LBAgent. Generally, configuring two LBAgent nodes as mutual primary and backup under one cluster is sufficient. LBAgent nodes under the same cluster must have the same VRRP route ID.

Load balancer forwarding nodes are used to listen to load balancer instances and forward client requests to backend servers according to listener and forwarding rules. There can be multiple forwarding nodes under the same cluster, but only one node acts as the Master node to provide forwarding services at the same time. Nodes belonging to one cluster must have the same VRRP route ID.

Node lifecycle management:

1. Create node: Set node's configuration parameters.
2. Deploy node: Issue node's configuration files to the specified machine. Machines that provide forwarding functionality can be called forwarding instances. When node status is Master, it means nodes in the cluster can normally provide load balancer forwarding services.
3. Remove node: When nodes are not needed to provide services, you can remove nodes and delete configuration files from forwarding instances.
4. Delete node: Delete node's configuration file information, etc.

### HTTP/HTTPS Type Listeners

For HTTP/HTTPS type listeners, we can also create "Forwarding Policies (Listener Rule)" to further reuse the listener's address and port by utilizing HTTP protocol characteristics. Forwarding policies contain path and domain attributes to match HTTP requests from users. Each forwarding policy can specify its own backend server group. When the path and domain in the request match, the load balancer will forward it to servers in this backend group.

	          ___ Host: src0.example.com -> srv0 backendGroup
	        /
	HTTP/80
	        \
	          --- Host: srv1.example.com -> srv1 backendGroup

HTTPS type listeners need to bind TLS certificates. The platform supports RSA and EC2 certificates

### Access Control

The platform supports creating access control lists. Lists specify network CIDRs. Listeners can be associated with access control lists and specify applying the list as whitelist or blacklist. When used as whitelist, only requests from IPs in the list are accepted, and other requests will be rejected. When used as blacklist, networks in the list will be denied service, and addresses outside the list can be accessed.


