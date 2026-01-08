---
sidebar_position: 6
---

# Manual Deployment of Development Cluster

This article introduces the steps for manually deploying a service cluster for development and testing purposes.

## Target Audience

- Want to debug with breakpoints
- Low virtual machine configuration
- Don't want to use docker to package images
- Want to develop directly on macOS/Linux

## Known Issues

- Cannot debug host service on macOS
- Complex configuration

## Environment Preparation

Here, Debian 11 environment is used as an example, configuring only a minimal cluster consisting of nginx, apigateway, keystone, region and other services. Other services can be added as needed.

- Linux or macOS
- 4 cores 8G

### Basic Software Installation

- nginx
- MariaDB 5.5 or MySQL 5.7
- git, make, npm, yarn, curl
- go >=1.18

### Source Code Cloning

Here, it is assumed that the directories for cloning source code are **/root/cloudpods** **/root/dashboard**

```sh 
# Clone backend source code
$ git clone https://github.com/yunionio/cloudpods.git
# Here you need to switch the code to the branch you want, here set to release/3.9
$ cd cloudpods && git checkout release/3.10 && cd /root
# Clone frontend source code
$ git clone https://github.com/yunionio/dashboard.git
# Frontend code branch needs to match the backend
$ cd dashboard && git checkout release/3.10 && cd /root
# Create configuration file directory
$ mkdir -p /etc/yunion
```

### Start nginx and database services

```sh  
$ systemctl enable --now nginx mariadb
```

## Authentication Service (keystone) Initialization

The first service to start is keystone, because other services depend on the authentication service

1) First configure the keystone database

```sh
# Create database and database account for keystone service
$ mysql -uroot -e 'create database keystone;'
# Here set a keystone user with password cloudpods-keystone, which will be used in the configuration file later
$ mysql -uroot -e 'grant all privileges on keystone.* to "keystone"@"%" identified by "cloudpods-keystone"; flush privileges;'
```

2) Next configure the keystone service

```sh
# Compile keystone
$ cd /root/cloudpods && make cmd/keystone

# Write keystone service configuration file
$ mkdir -p /etc/yunion/keystone
# Note: use the database and database account password just created
$ cat<<EOF >/etc/yunion/keystone/keystone.conf
address = '127.0.0.1'
port = 5000
admin_port = 35357
sql_connection = 'mysql+pymysql://keystone:cloudpods-keystone@localhost:3306/keystone?charset=utf8'
log_level = 'debug'
auto_sync_table = true
EOF

$ Initialize configuration
# This will first initialize the keystone database tables according to the configuration, and set the sysadmin user password, here set to 123@admin, which will be used later
$ /root/cloudpods/_output/bin/keystone --conf /etc/yunion/keystone/keystone.conf --bootstrap-admin-user-password 123@admin --exit-after-db-init
# Start keystone service
$ /root/cloudpods/_output/bin/keystone --conf /etc/yunion/keystone/keystone.conf
```

3) Configure keystone service

## climc Initialization

After the authentication service is complete, use climc for some operations

```sh
# Compile climc command and place it in the executable environment directory
$ cd /root/cloudpods && make cmd/climc && cp /root/cloudpods/_output/bin/climc /usr/local/bin/

# Write rc_admin file
$ cat<<EOF >/etc/yunion/rc_admin
export OS_REGION_NAME=Yunion
export OS_PROJECT_NAME=system
export OS_PASSWORD=123@admin
export OS_AUTH_URL=http://127.0.0.1:35357/v3
export OS_USERNAME=sysadmin
export OS_ENDPOINT_TYPE=publicURL
EOF

# Set environment variables
$ source /etc/yunion/rc_admin

# Save sysadmin's policy
$ cat<<EOF >/root/sysadmin
policy:
  '*':
    '*':
      '*': allow
EOF
# Create sysadmin permissions
$ climc policy-create --enabled --scope system --is-system sysadmin /root/sysadmin

# Bind sysadmin permissions to admin role
$ climc policy-bind-role --project-id system --role-id admin sysadmin

# Add sysadmin to system project with admin role. After this, the sysadmin user will have operation permissions for the entire platform. If a ForbiddenError is reported, you can restart the keystone service and try this operation again
$ climc user-join-project --role admin --project system sysadmin

# Create Yunion region
$ climc region-create Yunion
```    

## Initialize Services and Endpoints

```sh
# Create keystone service
$ climc service-create --enabled identity keystone

# Create keystone endpoints
$ climc endpoint-create --enabled keystone Yunion public http://127.0.0.1:35357/v3
$ climc endpoint-create --enabled keystone Yunion admin http://127.0.0.1:35357/v3
$ climc endpoint-create --enabled keystone Yunion internal http://127.0.0.1:5000/v3

```

## Initialize Offline Package Service

Packages are stored in Alibaba Cloud object storage and are pulled by the region service by finding the corresponding endpoint

```sh
# Create offlinecloudmeta service
$ climc service-create --enabled offlinecloudmeta offlinecloudmeta

# Create offlinecloudmeta endpoints
$ climc endpoint-create --enabled offlinecloudmeta Yunion public https://yunionmeta.oss-cn-beijing.aliyuncs.com
$ climc endpoint-create --enabled offlinecloudmeta Yunion admin https://yunionmeta.oss-cn-beijing.aliyuncs.com
$ climc endpoint-create --enabled offlinecloudmeta Yunion internal https://yunionmeta.oss-cn-beijing.aliyuncs.com

```


## Configuration Service (yunionconf) Initialization

The yunionconf service saves configuration options for the frontend page

1) First configure the yunionconf service account in keystone and register the yunionconf service endpoint.

```sh
# Create yunionconf service
$ climc service-create --enabled yunionconf yunionconf

# Determine the yunionconf service listening port, here assumed to be 8010. The port specified in the yunionconf service configuration later must be 8010
# Create yunionconf endpoints
$ climc endpoint-create --enabled yunionconf Yunion internal http://127.0.0.1:8010
$ climc endpoint-create --enabled yunionconf Yunion public http://127.0.0.1:8010

# Create yunionconf service account
$ climc user-create --enabled --system-account --no-web-console --password yunionconf@admin yunionconfadmin
# Grant yunionconfadmin user admin role
$ climc user-join-project --role admin --project system yunionconfadmin
```

2) Next configure the yunionconf database

```sh
# Create database and database account for yunionconf service
$ mysql -uroot -e 'create database yunionconf;'
# Here set a yunionconf user with password cloudpods-yunionconf
$ mysql -uroot -e 'grant all privileges on yunionconf.* to "yunionconf"@"%" identified by "cloudpods-yunionconf"; flush privileges;'
```

3) Next configure and start the yunionconf service

```
# Compile yunionconf
$ cd /root/cloudpods/ && make cmd/yunionconf

# Write yunionconf service configuration file
# Note: use the database and database account password just created, and the yunionconf service authentication username and password
$ cat<<EOF >/etc/yunion/yunionconf.conf
region = 'Yunion'
address = '127.0.0.1'
port = 8010
auth_uri = 'http://127.0.0.1:35357/v3'
admin_user = 'yunionconfadmin'
admin_password = 'yunionconf@admin'
admin_tenant_name = 'system'
sql_connection = 'mysql+pymysql://yunionconf:cloudpods-yunionconf@localhost:3306/yunionconf?charset=utf8'
log_level = 'debug'
auto_sync_table = true
EOF

# Start yunionconf service
$ /root/cloudpods/_output/bin/yunionconf --conf /etc/yunion/yunionconf.conf
```


## Compute Service (region) Initialization

The region service is a basic service and also the control node.

1) First configure the region service account in keystone and register the region service endpoint.

```sh
# Create region service
$ climc service-create --enabled compute_v2 region2

# Determine the region service listening port, here assumed to be 8090. The port specified in the region service configuration later must be 8090
# Create region endpoints
$ climc endpoint-create --enabled region2 Yunion internal http://127.0.0.1:8090
$ climc endpoint-create --enabled region2 Yunion public http://127.0.0.1:8090

# Create region service account
$ climc user-create --enabled --system-account --no-web-console --password region@admin regionadmin
# Grant regionadmin user admin role
$ climc user-join-project --role admin --project system regionadmin
```

2) Next configure the region database

```sh
# Create database and database account for region service
$ mysql -uroot -e 'create database yunioncloud;'
# Here set a yunioncloud user with password cloudpods-yunioncloud
$ mysql -uroot -e 'grant all privileges on yunioncloud.* to "yunioncloud"@"%" identified by "cloudpods-yunioncloud"; flush privileges;'
```

3) Next configure and start the region service

```
# Compile region
$ cd /root/cloudpods/ && make cmd/region

# Write region service configuration file
# Note: use the database and database account password just created, and the region service authentication username and password
$ cat<<EOF >/etc/yunion/region.conf
region = 'Yunion'
address = '127.0.0.1'
port = 8090
auth_uri = 'http://127.0.0.1:35357/v3'
admin_user = 'regionadmin'
admin_password = 'region@admin'
admin_tenant_name = 'system'
sql_connection = 'mysql+pymysql://yunioncloud:cloudpods-yunioncloud@localhost:3306/yunioncloud?charset=utf8'
log_level = 'debug'
auto_sync_table = true
EOF

# Start region service
$ /root/cloudpods/_output/bin/region --conf /etc/yunion/region.conf
```

4) Test if the region service is normal

```
# Test region service interface
$ climc server-list
***  Total: 0  ***
```

The configuration steps for other services that use databases are similar to region. Note that the scheduler configuration file also uses the region service configuration file.


## API Gateway Service (apigateway) Initialization

The API gateway is the middle layer between web and various services. Web requests reach nginx and are then distributed to the API gateway service, which finally determines which service the request needs to be forwarded to

First create a service account for the API gateway

```sh
# Create API gateway service authentication user
$ climc user-create --enabled --system-account --no-web-console --password apigateway@admin apigateway
# Grant apigateway user admin role
$ climc user-join-project --role admin --project system apigateway
```
Next configure the API gateway service

```sh
# Compile apigateway
$ cd /root/cloudpods/ && make cmd/apigateway

# Write apigateway service configuration file. Note: the listening port here is 3000, which will be needed when configuring nginx later
$ cat<<EOF >/etc/yunion/apigateway.conf
region = 'Yunion'
address = '0.0.0.0'
port = 3000
auth_uri = 'http://127.0.0.1:35357/v3'
admin_user = 'apigateway'
admin_password = 'apigateway@admin'
admin_tenant_name = 'system'
log_level = 'debug'
EOF

# Start apigateway service
$ /root/cloudpods/_output/bin/apigateway --conf /etc/yunion/apigateway.conf
```

## Frontend Service Configuration

### Frontend Compilation

```sh
# Install yarn, refer to https://yarn.bootcss.com/docs/install
$ apt install yarn
# Compile frontend code
$ cd /root/dashboard && yarn && yarn build
```

### nginx Configuration

```sh
# Modify nginx default configuration
# This doesn't necessarily mean changing the /etc/nginx/conf.d/default file, it could be other configuration issues. The main thing is to make the following content take effect
# Edit the /etc/nginx/conf.d/default file and enter the following code
server {
    listen 80;

    location ~ /.well-known {
        allow all;
    }

    location / {
        # Note: this must match the location of the frontend compiled code
        root /root/dashboard/dist;
        index index.html;
        add_header Cache-Control no-cache;
        expires 1s;
        if (!-e $request_filename) {
            rewrite ^/(.*) /index.html last;
            break;
        }
    }

    location /static/ {
        # Some basic cache-control for static files to be sent to the browser # Same as above
        root /root/dashboard/dist;
        expires max;
        add_header Pragma public;
        add_header Cache-Control "public, must-revalidate, proxy-revalidate";
    }

    location /api {
        # This must match the API gateway address and port
        proxy_pass http://127.0.0.1:3000;
        proxy_redirect   off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api/v1/imageutils/upload {
        proxy_pass http://127.0.0.1:3000;
        client_max_body_size 0;
        proxy_http_version 1.1;
        proxy_request_buffering off;
        proxy_buffering off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}
    
# To prevent /root/dashboard/dist directory permission issues, it is recommended to change the startup user to root, or set correct directory permissions. This step can be ignored
$ sed -i '/^user.*/c\user root;' /etc/nginx/nginx.conf

# Reload nginx configuration file
$ nginx -s reload

# Test if web loads correctly
$ curl http://127.0.0.1 | grep OneCloud

# Test if nginx can forward requests to API gateway service
$ curl http://127.0.0.1/api/v2/servers | python3 -m json.tool
```

### Frontend Login

```sh
# Create web login user admin
$ climc user-create --enabled --password admin@123 admin
# Grant admin user admin role
$ climc user-join-project --role admin --project system admin
# You can now open the virtual machine address (http://ip) for frontend login, username and password are admin/admin@123 respectively
```

## Other Service Configuration

### Monitor Service (monitor) Initialization

monitor is the monitoring service, which depends on an external influxdb v1.7.7 service.

1) First configure the monitor service account in keystone and register the monitor service endpoint.

```sh
# Create region service
$ climc service-create --enabled monitor monitor

# Determine the monitor service listening port, here assumed to be 8093. The port specified in the monitor service configuration later must be 8093
# Create monitor endpoints
$ climc endpoint-create --enabled monitor Yunion internal http://127.0.0.1:8093
$ climc endpoint-create --enabled monitor Yunion public http://127.0.0.1:8093

# Create monitor service account
$ climc user-create --enabled --system-account --no-web-console --password monitor@admin monitoradmin
# Grant monitoradmin user admin role
$ climc user-join-project --role admin --project system monitoradmin
```

2) Configure influxdb service

monitor depends on the influxdb service. You need to deploy an influxdb service locally and then add the influxdb service endpoint to the cluster. The steps are as follows:

```bash
# Using docker to start influxdb 1.7.7 is the simplest way. For other installation methods, please search yourself
# Listen on local port 8086, persistent directory at /tmp/influxdb, can be modified according to your environment
$ docker run -p 8086:8086 -v /tmp/influxdb:/var/lib/influxdb registry.cn-beijing.aliyuncs.com/yunion/influxdb:1.7.7

# Test influxdb network connectivity. If an error is returned, it means connectivity is fine
$ curl http://127.0.0.1:8086/query
{"error":"missing required parameter \"q\""}

# Add influxdb service endpoint
$ climc service-create --enabled influxdb influxdb

# Determine the influxdb service listening port, here assumed to be 8086. The port specified in the monitor service configuration later must be 8086
# Create influxdb endpoints
$ climc endpoint-create --enabled influxdb Yunion internal http://127.0.0.1:8086
$ climc endpoint-create --enabled influxdb Yunion public http://127.0.0.1:8086
```

3) Next configure the monitor database

```sh
# Create database and database account for monitor service
$ mysql -uroot -e 'create database yunionmonitor;'
# Here set a yunionmonitor user with password cloudpods-monitor
$ mysql -uroot -e 'grant all privileges on yunionmonitor.* to "yunionmonitor"@"%" identified by "cloudpods-monitor"; flush privileges;'
```

4) Next configure and start the monitor service

```
# Compile monitor
$ cd /root/cloudpods/ && make cmd/monitor

# Write monitor service configuration file
# Note: use the database and database account password just created, and the monitor service authentication username and password
$ cat<<EOF >/etc/yunion/monitor.conf
region = 'Yunion'
address = '127.0.0.1'
port = 8093
auth_uri = 'http://127.0.0.1:35357/v3'
admin_user = 'monitoradmin'
admin_password = 'monitor@admin'
admin_tenant_name = 'system'
sql_connection = 'mysql+pymysql://yunionmonitor:cloudpods-monitor@localhost:3306/yunionmonitor?charset=utf8'
log_level = 'debug'
auto_sync_table = true
EOF

# Start monitor service
$ /root/cloudpods/_output/bin/monitor --conf /etc/yunion/monitor.conf
```

5) Test if the monitor service is normal

```
# Test monitor service interface
$ climc monitor-alert-list
***  Total: 0  ***
```


## Future Improvements

- This step directly specifies parameters to execute each service
    - macOS recommends using launchctl+LaunchControl for startup management of each service
    - Linux can write systemd scripts to manage each service
- This step does not use SSL. If using SSL, the following content needs to be changed
    - Modify each service's configuration file and add SSL configuration
    - Modify each service's endpoints and specify https
    - Modify nginx configuration and change forwarded requests to https
- In this step, all service listening addresses are 127.0.0.1. If you want to expose each service's API externally, you need to change the following content
    - Change listening address to 0.0.0.0
    - Modify service public endpoint addresses to externally accessible addresses
- Since there are still many services not deployed, the frontend will have many service not found errors, and even many frontend functions cannot be used
    - According to frontend prompts, deploy the missing services

