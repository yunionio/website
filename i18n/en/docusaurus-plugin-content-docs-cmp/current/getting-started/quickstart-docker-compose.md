---
sidebar_position: 2
edition: ce
---

# Quick Installation via Docker Compose

Use [Docker Compose](https://docs.docker.com/compose/) to rapidly deploy the Cloudpods CMP multi-cloud management version

## Requirements

:::tip Note
This method deploys the Cloudpods multi-cloud management version through Docker Compose, in an All in One environment where all multi-cloud management services run in containers on a single node.

This deployment method only applies to the use of multi-cloud management features, such as managing public clouds (AWS, Alibaba Cloud, Tencent Cloud, etc.) or other private clouds (ZStack, OpenStack, etc.), and cannot be used for built-in private cloud-related features (because built-in private clouds require the installation and configuration of various virtualization software such as QEMU and Openvswitch on the nodes).

If you need to use the built-in private cloud, use the [Private cloud](../../onpremise/getting-started) deployment method.
:::

## Environment Preparation

### Machine Configuration Requirements

- Minimum configuration requirements: 4 core CPUs, 8GiB memory, 100GiB storage
- docker version: ce-23.0.2
    - It is recommended to install the latest version of CE, as the new version already includes the docker-compose plugin.
    - Docker needs to enable container networks and iptables.

### Installing and Configuring Docker

:::tip Note
If your environment has already installed a newer version of Docker, you can skip this step.
:::

Here, CentOS 7 is used to install Docker as an example. If it is another distribution, please refer to the official document for installation: [Install Docker Engine](https://docs.docker.com/engine/install/).

For Chinese users, installing docker-ce can use Aliyun's repository, with the following steps:

```bash
# Install necessary system tools
$ sudo yum install -y yum-utils device-mapper-persistent-data lvm2

# Add software source information
$ sudo yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# Update and install docker-ce and compose plugins
$ sudo yum makecache fast
$ sudo yum -y install docker-ce docker-ce-cli docker-compose-plugin

# Enable Docker service
$ sudo systemctl enable --now docker
```

## Running Cloudpods CMP

After the Docker Compose environment is ready, you can use the docker-compose.yml configuration file in https://github.com/yunionio/ocboot to start the service, as follows:

```bash
# Download the OCBoot tool to the local environment
$ git clone -b release/3.11 https://github.com/yunionio/ocboot && cd ./ocboot

# Enter the compose directory
$ cd compose
$ ls -alh docker-compose.yml

# Start services
$ docker compose up
```

After the services are started, you can log in to *https://localhost* to access the front-end service. The default login user and password are admin and admin@123, respectively.

## Operational Instructions

### 1. Run services in the background

Use the '-d / --detach' parameter to run all services in the background, as follows:

```bash
# Run all services in the background
$ docker compose up -d

# After the service is put in the background, you can use the 'logs' instruction to view the output log
$ docker compose logs -f
```

### 2. Log in to the climc command line container

If you need to operate on the platform using command-line tools, log in to the container using the following method:

```bash
$ docker exec -ti compose-climc-1 bash
Welcome to Cloud Shell :-) You may execute `climc` and other command tools in this shell.
Please exec 'climc' to get started

# Source authentication information
bash-5.1# source /etc/yunion/rcadmin
bash-5.1# climc user-list
```

### 3. Check service configuration and persistent data

All persistent data for services is stored under the directory *ocboot/compose/data*, and all configurations are auto-generated and generally don't need manual modification. The directories are explained below:

```bash
$ tree data
data
├── etc
│   ├── nginx
│   │   └── conf.d
│   │       └── default.conf    # Front-end nginx configuration
│   └── yunion
│       ├── *.conf  # Configuration for various cloudpod services
│       ├── pki     # Certificate directory
│       ├── rcadmin     # Command-line authentication information
├── opt
│   └── cloud
│       └── workspace
│           └── data
│               └── glance # The image directory for the image service storage
└── var
    └── lib
        ├── influxdb    # The directory for persisting InfluxDB data
        └── mysql       # The directory for persisting MySQL database data
```

### 4. Delete all containers

All persistent data for services is stored under the directory *ocboot/compose/data*, and removing containers will not result in data loss. Simply restart using *docker compose up* the next time. The operation is shown below:

```bash
# Remove the service
$ docker compose down
```

## Upgrade

Upgrading via docker compose is very convenient, just update the `docker-compose.yml` configuration file.

When the upstream [ocboot/compose/docker-compose.yml](https://github.com/yunionio/ocboot/blob/master/compose/docker-compose.yml) is updated, you can pull the latest code through git pull command, then restart. Steps are as follows:

### Update ocboot Code

Log in to the node running docker compose and enter the ocboot code directory.

```bash
$ cd ocboot
```

Pull the latest code and checkout to the corresponding release version.

import OcbootFetchCheckout from '@site/src/components/OcbootFetchCheckout';

<OcbootFetchCheckout />

### Restart compose Service

After pulling the latest docker-compose.yml configuration file, use the following command to restart the service.

```bash
$ cd compose
$ docker compose down
$ docker compose up -d
```

## Common Problems

### 1. The docker service does not open iptables and the bridge, causing the container network to fail to be created

By default, iptables is turned on when starting the docker service. If "bridge: none" and "iptables: false" are set in */etc/docker/daemon.json*, docker compose functionality will not work.

Before running `docker compose`, make sure that the bridge and iptables functions are turned on.

### 2. How is the docker-compose.yml file generated with many services?

The Cloudpods CMP multi-cloud management version includes various services. Manually writing each compose configuration would be very complex, so the *generate-compose.py* script is used in ocboot to generate the `docker-compose.yml` file. The following command can be used to generate the compose configuration file:

```bash
$ python3 generate-compose.py > compose/docker-compose.yml
```
