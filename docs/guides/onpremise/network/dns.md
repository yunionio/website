---
sidebar_position: 5
---

# 虚拟机域名设置

虚拟机的域名涉及如下几个服务：

* region负责生成虚拟机的域名信息
* host负责通过dhcp将域名信息注入到虚拟机内
* region_dns负责虚拟机之间的域名解析，实现云平台内主机名和主机IP的解析，以及中继上游DNS的解析，为主机提供DNS解析服务。

每台虚拟机都需要配置其域名解析服务器和域名解析地址前缀，这两个信息是由region生成，并且同步到host，最后通过dhcp下发到虚拟机内部。

region服务提供如下两个配置项指定虚拟机的dns服务器地址和搜索域名后缀

配置选项     | 说明
-------------|------------------------------------------------------------
dns_server   | 全局的dns服务器地址，默认为该集群内region_dns所在节点的IP 
dns_domain   | 全局的dns搜索后缀，默认值为 cloud.onecloud.io

同时，每个IP子网都有两个属性，用于override全局的region配置选项，提供个性化的域名服务器和后缀

属性         | 说明                                 | 默认值
-------------|--------------------------------------|--------------------------
guest_dns    | 该IP子网的虚拟机的域名解析服务器地址 | region的dns_server选项
guest_domain | 该IP子网的虚拟机的域名后缀           | region的dns_domain选项

## region_dns介绍

region_dns基于coredns实现，配置语法和coredns一致。

