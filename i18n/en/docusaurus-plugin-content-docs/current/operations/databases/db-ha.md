---
sidebar_position: 2
---

# Deploy Mariadb HA

Use keepalived and Mariadb's master-master replication feature to achieve high availability of DB.

## Deployment

The main function of keepalived is to provide vip for Mariadb, switching between 2 Mariadb instances to provide uninterrupted service.

In the following example:

- DB VIP: 192.168.199.97
- Primary node IP: 192.168.199.98
- Backup node IP: 192.168.199.99

### Configure Mariadb master-master replication

Install and start Mariadb

```bash
$ yum install -y mariadb-server
$ systemctl enable --now mariadb
```

Run the Mariadb Security Configuration Wizard to set passwords, etc.

```bash
$ mysql_secure_installation
 ... ...
Change the root password? [Y/n] y
New password:
Re-enter new password:
Password updated successfully!
Reloading privilege tables..
 ... Success!
 ... ...
Remove anonymous users? [Y/n] y
 ... Success!
 ... ...
Disallow root login remotely? [Y/n] y
 ... Success!
 ... ...
Remove test database and access to it? [Y/n] y
 - Dropping test database...
 ... Success!
 - Removing privileges on test database...
 ... Success! ... ...
Reload privilege tables now? [Y/n] y
 ... Success!
 ... ...
```

Modify the Mariadb configuration file to prepare for configuring the master-master replication.

Note: The difference between primary and secondary is the `confserver-id` and `auto_increment_offset` fields.

```bash
# Primary node
$ cat <<EOF > /etc/my.cnf
[mysqld]
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock
# Disabling symbolic-links is recommended to prevent assorted security risks
symbolic-links=0
# Settings user and group are ignored when systemd is used.
# If you need to run mysqld under a different user or group,
# customize your systemd unit file for mariadb according to the
# instructions in http://fedoraproject.org/wiki/Systemd
# skip domain name resolve
skip_name_resolve
# auto delete binlog older than 30 days
expire_logs_days=30
innodb_file_per_table=ON
max_connections = 300
max_allowed_packet=20M

server-id = 1
auto_increment_offset = 1
auto_increment_increment = 2
log-bin = mysql-bin
binlog-format = row
log-slave-updates
max_binlog_size = 1G
replicate-ignore-db = information_schema
replicate-ignore-db = performance_schema
max_connections = 1000
max_connect_errors = 0
max_allowed_packet = 1G
slave-net-timeout=10
master-retry-count=0

slow_query_log = 1
long_query_time = 2
slow_query_log_file = /var/log/mariadb/slow-query.log

[mysql]
no-auto-rehash

[mysqld_safe]
log-error=/var/log/mariadb/mariadb.log
pid-file=/var/run/mariadb/mariadb.pid

#
# include all files from the config directory
#
!includedir /etc/my.cnf.d
EOF

# Backup Node
$ cat <<EOF > /etc/my.cnf
[mysqld]
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock
# Disabling symbolic-links is recommended to prevent assorted security risks
symbolic-links=0
# Settings user and group are ignored when systemd is used.
# If you need to run mysqld under a different user or group,
# customize your systemd unit file for mariadb according to the
# instructions in http://fedoraproject.org/wiki/Systemd
# skip domain name resolve
skip_name_resolve
# auto delete binlog older than 30 days
expire_logs_days=30
innodb_file_per_table=ON
max_connections = 300
max_allowed_packet=20M

server-id = 2
auto_increment_offset = 2
auto_increment_increment = 2
log-bin = mysql-bin
binlog-format = row
log-slave-updates
max_binlog_size = 1G
replicate-ignore-db = information_schema
replicate-ignore-db = performance_schema
max_connections = 1000
max_connect_errors = 0
max_allowed_packet = 1G
slave-net-timeout=10
master-retry-count=0

slow_query_log = 1
long_query_time = 2
slow_query_log_file = /var/log/mariadb/slow-query.log

[mysql]
no-auto-rehash

[mysqld_safe]
log-error=/var/log/mariadb/mariadb.log
pid-file=/var/run/mariadb/mariadb.pid

#
# include all files from the config directory
#
!includedir /etc/my.cnf.d
EOF

# Restart the service
$ systemctl restart mariadb
```

On the primary node, create a read-only account, export all data, and import it into the backup node. Record the name and position of the binlog log file.

```bash
# The following commands are executed on the primary node

# This password is for the Mariadb root set above. For convenience, the read-only account also uses this password
$ MYSQL_PASSWD='your-sql-passwd'

# Enable remote access to Mariadb
$ mysql -uroot -p$MYSQL_PASSWD -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '$MYSQL_PASSWD' WITH GRANT OPTION;FLUSH PRIVILEGES"

# Create a read-only account
$ mysql -u root -p$MYSQL_PASSWD -e "GRANT REPLICATION SLAVE ON *.* TO repl@'%' IDENTIFIED BY '$MYSQL_PASSWD';FLUSH PRIVILEGES"

# This example is for a fresh installation of Mariadb that hasn't been used yet. If you're doing master-master replication of a database that's already in use, you need to lock the table before exporting data. 
``````bash
$ mysql -uroot -p$MYSQL_PASSWD -e "SHOW PROCESSLIST"
+----+------+-----------+------+---------+------+-------+------------------+----------+
| Id | User | Host      | db   | Command | Time | State | Info             | Progress |
+----+------+-----------+------+---------+------+-------+------------------+----------+
|  4 | root | localhost | NULL | Query   |    0 | NULL  | SHOW PROCESSLIST |    0.000 |
+----+------+-----------+------+---------+------+-------+------------------+----------+

# Record the binlog file name and position
$ mysql -u root -p$MYSQL_PASSWD -e "SHOW MASTER STATUS\G"
*************************** 1. row ***************************
            File: mysql-bin.000001
        Position: 2023
    Binlog_Do_DB:
Binlog_Ignore_DB:

# Export all data
$ mysqldump --all-databases -p$MYSQL_PASSWD > alldb.db

# Copy alldb.db to the backup node
$ scp alldb.db db2:/root/


# Execute the following commands on the backup node

# This password is the MariaDB root password set above
$ MYSQL_PASSWD='your-sql-passwd'

# Import the data exported from the primary node
mysql -u root -p$MYSQL_PASSWD < alldb.db

# Reload privileges
mysql -u root -p$MYSQL_PASSWD -e "FLUSH PRIVILEGES"

# Record the binlog file name and position
mysql -u root -p$MYSQL_PASSWD -e "SHOW MASTER STATUS\G"
*************************** 1. row ***************************
            File: mysql-bin.000001
        Position: 509778
    Binlog_Do_DB:
Binlog_Ignore_DB:
```

Set up master-slave replication

```bash
# Execute the following commands on the primary node

# Modify MASTER_HOST to the IP address of the backup node, and modify MASTER_LOG_FILE and MASTER_LOG_POS based on the information recorded on the backup node
mysql -u root -p$MYSQL_PASSWD -e "CHANGE MASTER TO MASTER_HOST='192.168.199.99',MASTER_USER='repl',MASTER_PASSWORD='$MYSQL_PASSWD',MASTER_PORT=3306,MASTER_LOG_FILE='mysql-bin.000001',MASTER_LOG_POS=509778,MASTER_CONNECT_RETRY=2;START SLAVE"


# Execute the following commands on the backup node

# Modify MASTER_HOST to the IP address of the primary node, and modify MASTER_LOG_FILE and MASTER_LOG_POS based on the information recorded on the primary node
mysql -u root -p$MYSQL_PASSWD -e "CHANGE MASTER TO MASTER_HOST='192.168.199.98',MASTER_USER='repl',MASTER_PASSWORD='$MYSQL_PASSWD',MASTER_PORT=3306,MASTER_LOG_FILE='mysql-bin.000001',MASTER_LOG_POS=2023,MASTER_CONNECT_RETRY=2;START SLAVE"


# Execute this command on both primary and backup nodes, verify synchronization status, and output 2 Yes to indicate normal status
mysql -u root -p$MYSQL_PASSWD -e "SHOW SLAVE STATUS\G" | grep Running
Slave_IO_Running: Yes
Slave_SQL_Running: Yes

# If this step fails, for example, if Slave_SQL_Running is connecting, it's highly likely that the firewall has not been turned off. Please execute the following command to turn off the firewall, and then redo the previous step of checking the two Yes.
systemctl is-active firewalld >/dev/null && systemctl disable --now firewalld
```

The DB master-master replication deployment is now complete. You can test database operations on any node and verify them on the other node. However, it is still necessary to provide services externally through the VIP, otherwise if a switch occurs, the business side will need to switch IPs. Next, configure keepalived to provide external services.

### Deploy and configure keepalived

Set the relevant environment variables and configure them according to different environments.

```bash
# keepalived vip address
export DB_VIP=192.168.199.97

# keepalived auth toke
export DBHA_KA_AUTH=onecloud

# keepalived network interface
export DB_NETIF=eth0
```

Set sysctl options

```bash
$ cat <<EOF >>/etc/sysctl.conf
net.ipv4.ip_forward=1
net.ipv4.ip_nonlocal_bind=1
EOF

$ sysctl -p
```

Install keepalived nc

```bash
$ yum install -y keepalived nc
```

Add configuration

The following is the configuration for the primary node:

```bash
# Make sure virtual_router_id doesn't conflict with other keepalived clusters on the local network
$ cat <<EOF >/etc/keepalived/keepalived.conf
global_defs {
    router_id onecloud
}

vrrp_script chk_mysql {
    script "/etc/keepalived/chk_mysql"
    interval 1
}

vrrp_instance VI_1 {
    state MASTER
    interface $DB_NETIF
    virtual_router_id 99
    priority 100
    advert_int 1
    nopreempt
    authentication {
        auth_type PASS
        auth_pass $DBHA_KA_AUTH
    }

    track_script {
        chk_mysql
    }

    virtual_ipaddress {
        $DB_VIP
    }
}
EOF

$ cat <<EOF > /etc/keepalived/chk_mysql
#!/bin/bash
echo | nc 127.0.0.1 3306 &>/dev/null
EOF

$ chmod +x /etc/keepalived/chk_mysql
```

The following is the configuration for the backup node:

```bash
# Make sure the virtual_router_id of the backup node is the same as that of the primary node
$ cat <<EOF >/etc/keepalived/keepalived.conf
global_defs {
    router_id onecloud
}

vrrp_script chk_mysql {
    script "/etc/keepalived/chk_mysql"
    interval 1
}

vrrp_instance VI_1 {
    state BACKUP
    interface $DB_NETIF
    virtual_router_id 99
    priority 99
    advert_int 1
    nopreempt
    authentication {
        auth_type PASS
        auth_pass $DBHA_KA_AUTH
    }

    track_script {
        chk_mysql
    }

    virtual_ipaddress {
        $DB_VIP 
    }
}
EOF

$ cat <<EOF > /etc/keepalived/chk_mysql
#!/bin/bash
echo | nc 127.0.0.1 3306 &>/dev/null
EOF

$ chmod +x /etc/keepalived/chk_mysql
```

After the configuration is complete, start `keepalived` on the master and standby nodes respectively using the following command:

```bash
$ systemctl enable --now keepalived
$ ip addr show $DB_NETIF
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 00:22:cf:40:1e:29 brd ff:ff:ff:ff:ff:ff
    inet 192.168.199.99/24 brd 192.168.199.255 scope global dynamic eth0
       valid_lft 100651906sec preferred_lft 100651906sec
    inet 192.168.199.97/32 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::222:cfff:fe40:1e29/64 scope link
       valid_lft forever preferred_lft forever
```

### Configure `keepalived` to switch network adapter automatically

In this solution, `k8s` and `mysql` share the same network adapter. If `k8s` uses the `host` feature, it will automatically enable the `br0` network adapter. When `host` starts or switches network adapters, it may affect the high availability of `mysql`. The following auxiliary script can enhance the stability of `k8s+mysql`. 

Run the following scripts respectively on the primary and standby nodes of `db`. Be sure to replace the `node_ip` variable in the first line with the machine's own IP address.

```bash
# Replace the variable DB_NODE_IP in this script with the local IP address
node_ip=$DB_NODE_IP
[[ -z "$node_ip" ]] && echo "please export variable 'node_ip' first! "

cat <<EOF_CK1 >/etc/keepalived/check_interface.sh
#!/usr/bin/env bash

datestr="\$(date +"%F %T")"
env_interface=\$(cat /etc/keepalived/keepalived.conf| grep -w interface |awk '{print \$2}')
echo "[\$datestr] The interface keepalived is currently listening on: \$env_interface"
router_interface=\$(/usr/sbin/ip a show | grep $node_ip | awk '{ print \$NF}')
echo "[\$datestr] The name of the interface where the ip is located: [\$router_interface]"

if [[ -n "\$router_interface" ]] && [[ "\$router_interface" != "\$env_interface" ]]; then
    echo "[\$datestr] updating keepalived.conf interface"
    sed -i -e "s#\$env_interface#\$router_interface#g" /etc/keepalived/keepalived.conf
    systemctl restart keepalived
else
    echo "[\$datestr] No need to update interface. "
fi
EOF_CK1

cat <<EOF_CK2 >/etc/keepalived/check_interface2.sh
#!/usr/bin/env bash
for i in {1..3}; do
    /etc/keepalived/check_interface.sh >> /var/log/keepalived.log
    sleep 20
done
EOF_CK2

cat <<EOF_CRON >/etc/cron.d/update_keepalived_interface
* * * * * root /etc/keepalived/check_interface2.sh >/dev/null 2>&1
EOF_CRON
systemctl restart crond
chmod +x /etc/keepalived/chk_mysql
chmod +x /etc/keepalived/check_interface.sh
chmod +x /etc/keepalived/check_interface2.sh

systemctl enable --now keepalived
systemctl restart keepalived
chmod +x /etc/rc.d/rc.local
if ! grep -q /etc/keepalived/check_interface.sh /etc/rc.d/rc.local; then
    sed -i '$a bash /etc/keepalived/check_interface.sh >> /var/log/keepalived.log' /etc/rc.d/rc.local
fi
```

Thus, the high availability deployment of DB is completed. The Mariadb or keepalived service of any node can be down without affecting external services in case of a node failure.
