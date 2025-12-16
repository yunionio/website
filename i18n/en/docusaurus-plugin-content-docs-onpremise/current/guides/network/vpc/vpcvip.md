---
sidebar_position: 4
---

# Virtual IP (VIP)

Introduction to how to use virtual IP (VIP).

The built-in private cloud platform now supports allocating virtual IPs to a group of virtual machines for sharing in VPCs or classic network IP subnets. Through high availability software such as keepalived, VIPs can float between this group of virtual machines. keepalived detects service status on hosts and automatically sets the virtual IP on the network card of the virtual machine with the highest priority where the service is available.

## Model Concepts

In the resource model, VIP is bound to an anti-affinity group (instancegroup). You can bind a VIP to an anti-affinity group through the frontend or climc commands. After binding, this VIP can be used among virtual machines contained in this anti-affinity group.

At the same time, VIPs are usually for providing services externally. For virtual machines in VPCs, to allow access to services provided by VIPs from outside VPCs, the platform allows binding EIP to VIPs. After binding, VPCs outside can access services bound to VIPs through this EIP.

## climc Commands

### Bind a VIP to an Anti-Affinity Group

Limitations:
1. Currently, an anti-affinity group can only bind one VIP.
2. If the anti-affinity group has no virtual machine members, you can specify the IP subnet of the VIP to be bound. After binding, this anti-affinity group can only add virtual machines under this IP subnet. And these virtual machines can only have one virtual network card.
2. If the anti-affinity group already has virtual machine members, the prerequisite for the anti-affinity group to bind a VIP is that all virtual machines in the anti-affinity group join IP subnets under the same VPC, and these virtual machines all have only one virtual network card. The VIP bound to the anti-affinity group will be allocated from this IP subnet.

```bash
climc instancegroup-attachnetwork [--ip-addr IP_ADDR] [--alloc-dir ALLOC_DIR] [--reserved] [--require-designated-ip] [--network-id NETWORK_ID] <instancegroup>
```

### Bind EIP to Anti-Affinity Group in VPC

Limitations:
1. An anti-affinity group can only bind one EIP, and this anti-affinity group needs to have already bound a VIP before it can bind an EIP. After binding, EIP automatically maps to the corresponding VIP.

There are two cases: one is to automatically apply for an EIP and bind it to the anti-affinity group; the other is to bind an existing EIP to the anti-affinity group.

```bash
climc instancegroup-create-eip [--bandwidth BANDWIDTH] [--bgp-type BGP_TYPE] [--auto-dellocate] [--ip-addr IP_ADDR] [--charge-type CHARGE_TYPE] <instancegroup>
```

```bash
climc instancegroup-associate-eip [--ip-addr IP_ADDR] [--eip-id EIP_ID] <instancegroup>
```

### Unbind EIP from Anti-Affinity Group in VPC

```bash
climc instancegroup-dissociate-eip <instancegroup>
```

### Unbind VIP from Anti-Affinity Group

Limitations:
1. Only when the anti-affinity group has not bound an EIP can the anti-affinity group's VIP be unbound

```bash
climc instancegroup-detachnetwork [--ip-addr IP_ADDR] <ID>
```

### Application Example

Now deploy a master-standby nginx cluster, apply for two virtual machines nginx-master and nginx-slave, in the same IP subnet 192.168.4.0/22, with IPs 192.168.7.247/22 and 192.168.7.248/22 respectively.

Create anti-affinity group nginx, add nginx-master and nginx-slave.

Bind VIP 192.168.7.246/22 to anti-affinity group nginx.

ningx-master configuration is as follows:

```bash
sudo yum install -y nginx keepalived
```

Modify /etc/keepalived/keepalived.conf as follows:

```
global_defs {
    notification_email {
        notify@example.cn
    }
    notification_email_from sns-lvs@example.cn
    smtp_server smtp.example.cn
    smtp_connection_timeout 30
    router_id nginx_master        # Set nginx master's id, should be unique in a network
}
vrrp_script chk_http_port {
    script "/root/check_httpd.sh"    # Finally manually execute this script to ensure this script can execute normally
    interval 2                          # (Interval for executing detection script, unit is seconds)
    weight 2
}
vrrp_instance VI_1 {
    state MASTER            # Specify keepalived's role, MASTER is master, BACKUP is standby
    interface eth0            # Current network interface card for vrrp communication (current centos network card)
    virtual_router_id 66        # Virtual router number, master and standby must be the same
    priority 100            # Priority, larger value has higher priority for processing requests
    advert_int 1            # Check interval, default is 1s (vrrp multicast cycle seconds)
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    track_script {
        chk_http_port            # (Call detection script)
    }
    virtual_ipaddress {
        192.168.7.246/22            # Define virtual ip (VIP), can set multiple, one per line
    }
}
```

nginx-slave configuration is as follows:

```bash
sudo yum install -y nginx keepalived
```

Modify /etc/keepalived/keepalived.conf as follows:

```
global_defs {
    notification_email {
        notify@example.cn
    }
    notification_email_from sns-lvs@example.com
    smtp_server smtp.example.cn
    smtp_connection_timeout 30
    router_id nginx_slave        # Set nginx master's id, should be unique in a network
}
vrrp_script chk_http_port {
    script "/root/check_httpd.sh"    # Finally manually execute this script to ensure this script can execute normally
    interval 2                          # (Interval for executing detection script, unit is seconds)
    weight 2
}
vrrp_instance VI_1 {
    state BACKUP            # Specify keepalived's role, MASTER is master, BACKUP is standby
    interface eth0            # Current network interface card for vrrp communication (current centos network card)
    virtual_router_id 66        # Virtual router number, master and standby must be the same
    priority 99            # Priority, larger value has higher priority for processing requests
    advert_int 1            # Check interval, default is 1s (vrrp multicast cycle seconds)
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    track_script {
        chk_http_port            # (Call detection script)
    }
    virtual_ipaddress {
        192.168.7.246/22            # Define virtual ip (VIP), can set multiple, one per line
    }
}
```

The content of /root/check_httpd.sh on nginx-master and nginx-slave is as follows:

```bash
#!/bin/bash
A=`ps -C nginx --no-header |wc -l`        
if [ $A -eq 0 ];then                            
    systemctl restart nginx                # Restart nginx
    if [ `ps -C nginx --no-header |wc -l` -eq 0 ];then    # nginx restart failed
        exit 1
    else
        exit 0
    fi
else
    exit 0
fi
```

After the above configuration is complete, restart nginx and keepavlied services on nginx-master and nginx-slave respectively.

```bash
systemctl restart nginx keepalived
```

At this time, you can view on nginx-master through ip addr that eth0 has added subordinate VIP 192.168.7.246/22.

```bash
[root@nginx-master ~]# ip addr show dev eth0
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1440 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 00:24:b1:6d:9b:7d brd ff:ff:ff:ff:ff:ff
    inet 192.168.7.247/22 brd 192.168.7.255 scope global dynamic eth0
       valid_lft 94550864sec preferred_lft 94550864sec
    inet 192.168.7.246/22 scope global secondary eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::224:b1ff:fe6d:9b7d/64 scope link 
       valid_lft forever preferred_lft forever
```

Finally, bind an EIP to anti-affinity group nginx, then you can access the nginx cluster through this EIP from outside the VPC.

