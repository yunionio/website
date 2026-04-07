---
sidebar_position: 4
edition: ce
---

# Migrate from k8s to k3s

Migrating from k8s to k3s is suitable for users who:
- Need to upgrade the Kubernetes version
- Need to replace the underlying operating system
- Need to use new features

## Migration Principles

The migration keeps the existing database data, removes the original k8s components, and redeploys the environment with k3s based on the existing database. The migration does not affect existing VM networking or storage.

## Migration Notes
- If you migrate to k3s on the same operating system, uninstall the original k8s first, then install k3s.
- If you need to replace the operating system, install the database first, restore backups to the new database, and then install the k3s-based version using the new database.

## Migration Steps

The following example demonstrates replacing the underlying operating system: the current environment IP is `192.168.123.69`, OS is Ubuntu 22.04, and Cloudpods version is `v3.11.13`; the target environment IP is `192.168.123.68`, OS is Ubuntu 24.04, and the version is upgraded to `v4.0.2`.

### Back Up the Database

```bash
# Check the MySQL database password
$ kubectl get oc -n onecloud -o yaml | grep mysql -A 4
    mysql:
      host: 192.168.123.69
      password: dPwBCk67YSJ9
      port: 3306
      username: root

$ export MYSQL_USER=root
$ export MYSQL_PASS=dPwBCk67YSJ9
$ export BACKUP_DIR="/data/backup"
$ mkdir -p $BACKUP_DIR
$ DATABASES=$(mysql -u$MYSQL_USER -p$MYSQL_PASS -NBe "SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME NOT IN('sys','mysql','performance_schema','information_schema')")
$ for db in $DATABASES
do
  echo "Backing up database: $db"
  mysqldump -u$MYSQL_USER -p$MYSQL_PASS --databases $db | gzip > $BACKUP_DIR/${db}_$(date +%Y%m%d).sql.gz
done

# Check ClickHouse credentials (Enterprise Edition only)
$ kubectl get oc -n onecloud -o yaml | grep clickhouse -A 4
    clickhouse:
      host: "192.168.123.69"
      password: "BVA38JAtO"
      port: 9000
      username: default

$ clickhouse-client -h 192.168.123.69 --password 'BVA38JAtO' -q "select * from yunionmeter.payment_bills_tbl FORMAT CSV" | gzip > $BACKUP_DIR/payment_bill_$(date +%Y%m%d).csv.gz
$ clickhouse-client -h 192.168.123.69 --password 'BVA38JAtO' -q "select * from yunionmeter.tags_tbl FORMAT CSV" | gzip > $BACKUP_DIR/tags_$(date +%Y%m%d).csv.gz
```

### Uninstall k8s Components (Optional, only required when switching to k3s on the current OS)

```bash
$ kubeadm reset --force
$ ipvsadm --clear
$ systemctl disable --now docker.socket docker kubelet
$ sudo apt remove -y kubeadm kubectl kubelet kubernetes-cni
$ rm -rf /etc/kubernetes/ /var/lib/etcd/ /root/.kube/
$ reboot

```

### Install and Restore the Database

Log in to `192.168.123.68` and install the database:

```bash
$ sudo apt install mariadb-server mariadb-client
$ sudo sed -i 's/^bind-address\s*=.*/bind-address = 0.0.0.0/' /etc/mysql/mariadb.conf.d/50-server.cnf
$ sudo systemctl enable mariadb --now mariadb
$ mysql -e "CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'dPwBCk67YSJ9'; GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION; FLUSH PRIVILEGES;"
```

Log in to `192.168.123.69` and restore the database backups to `192.168.123.68`:

```bash
$ cd /data/backup
$ for backup in *.sql.gz; do gunzip -c "$backup" | mysql -uroot -pdPwBCk67YSJ9 -h192.168.123.68; done
```

### Restore the ClickHouse Database (Enterprise Edition only)

Install ClickHouse according to the official documentation at [https://clickhouse.com/docs/install](https://clickhouse.com/docs/install), and enable external access.

> You can restore backup files using the official import approach. For example:

```bash
gunzip -c /data/backup/payment_bill_$(date +%Y%m%d).csv.gz | clickhouse-client -q "INSERT INTO yunionmeter.payment_bills_tbl FORMAT CSV"
gunzip -c /data/backup/tags_$(date +%Y%m%d).csv.gz | clickhouse-client -q "INSERT INTO yunionmeter.tags_tbl FORMAT CSV"
```

### Install Using the New Database

Log in to `192.168.123.68`:

```bash
$ git clone -b release/4.0 https://github.com/yunionio/ocboot
$ cd ocboot
$ ssh-copy-id root@192.168.123.68
$ cat > config.yml << EOF
primary_master_node:
  hostname: 192.168.123.68
  port: 22
  user: root
  # Set the backup database IP
  db_host: 192.168.123.68
  db_user: root
  # Set the backup database password
  db_password: dPwBCk67YSJ9
  # Set the target installation version
  onecloud_version: v4.0.2
  onecloud_user: admin
  onecloud_user_password: admin@2026
  controlplane_host: 192.168.123.68
  controlplane_port: "6443"
  as_host: true
  region: region0
  zone: zone0
EOF

$ ./ocboot.sh install ./config.yml
```

### Switch Compute Nodes to k3s

Log in to each compute node and uninstall k8s-related components:

```bash
$ kubeadm reset --force
$ ipvsadm --clear
$ systemctl disable --now docker.socket docker kubelet
$ sudo apt remove -y kubeadm kubectl kubelet kubernetes-cni openvswitch-common openvswitch-switch
$ rm -rf /etc/kubernetes/ /var/lib/etcd/ /root/.kube/
$ reboot
```

For `v4.0.2` and later, log in to each compute node and add this line at the end of `/etc/yunion/host.conf`: `disable_probe_kubelet: true`.

Then re-add compute nodes to the cluster according to the latest documentation.
