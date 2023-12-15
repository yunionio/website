---
edition: ce
sidebar_position: 2
---

# Upgrading through docker compose

:::tip
This method is only applicable to upgrading environments deployed using docker compose. If your environment is deployed using ocboot, please refer to the following documentation for upgrading:

- [Upgrade with ocboot](./ocboot-upgrade)
:::

Upgrading with docker compose is easy, just update the configuration file `docker-compose.yml`.

When the [ocboot/compose/docker-compose.yml](https://github.com/yunionio/ocboot/blob/master/compose/docker-compose.yml) of upstream updates, you can use the `git pull` command to pull the latest code, and then restart it. The steps are as follows:

## Update ocboot code

Log in to the node where docker compose is running and enter the ocboot code directory.

```bash
$ cd ocboot
```

Pull the latest code and checkout to the corresponding released version.

import OcbootFetchCheckout from '@site/src/components/OcbootFetchCheckout';

<OcbootFetchCheckout />

## Restart the compose service

After pulling the latest `docker-compose.yml` configuration file, use the following command to restart the service.

```bash
$ cd compose
$ docker compose down
$ docker compose up -d
```