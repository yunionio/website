---
sidebar_position: 4
edition: ce
---

# k8s迁移至k3s

k8s迁移至k3s适用于以下用户
- 需要升级 Kubernetes 版本
- 需要更换底层操作系统
- 需要使用新功能

## 迁移原理

迁移主要是保留现有数据库数据，卸载原有 k8s 组件，并在现有数据库基础上使用 k3s 重新部署环境, 迁移不影响已有虚拟机网络及存储。

## 迁移说明
- 若在原有操作系统上迁移至 k3s，需要先卸载原有 k8s，再安装 k3s。
- 若需要更换操作系统，可先安装数据库，再将备份恢复到新数据库，最后使用新数据库安装 k3s 版本。

## 迁移步骤

以下为更换底层操作系统示例：当前环境 IP 为 `192.168.123.69`，操作系统为 Ubuntu 22.04，Cloudpods 版本为 `v3.11.13`；迁移目标 IP 为 `192.168.123.68`，操作系统为 Ubuntu 24.04，且升级版本至 `v4.0.2`。

### 备份数据库

```bash
# 查看mysql数据库密码
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
  echo "备份数据库：$db"
  mysqldump -u$MYSQL_USER -p$MYSQL_PASS --databases $db | gzip > $BACKUP_DIR/${db}_$(date +%Y%m%d).sql.gz
done

# 查看clickhouse数据库账号密码(仅企业版需要)
$ kubectl get oc -n onecloud -o yaml | grep clickhouse -A 4
    clickhouse:
      host: "192.168.123.69"
      password: "BVA38JAtO"
      port: 9000
      username: default

$ clickhouse-client -h 192.168.123.69 --password 'BVA38JAtO' -q "select * from yunionmeter.payment_bills_tbl FORMAT CSV" | gzip > $BACKUP_DIR/payment_bill_$(date +%Y%m%d).csv.gz
$ clickhouse-client -h 192.168.123.69 --password 'BVA38JAtO' -q "select * from yunionmeter.tags_tbl FORMAT CSV" | gzip > $BACKUP_DIR/tags_$(date +%Y%m%d).csv.gz
```

### 卸载k8s组件(可选，仅在当前操作系统上替换k3s时需要)

```bash
$ kubeadm reset --force
$ ipvsadm --clear
$ systemctl disable --now docker.socket docker kubelet
$ sudo apt remove -y kubeadm kubectl kubelet kubernetes-cni
$ rm -rf /etc/kubernetes/ /var/lib/etcd/ /root/.kube/
$ reboot

```

### 安装并恢复数据库

登录 192.168.123.68 安装数据库
```bash
$ sudo apt install mariadb-server mariadb-client
$ sudo sed -i 's/^bind-address\s*=.*/bind-address = 0.0.0.0/' /etc/mysql/mariadb.conf.d/50-server.cnf
$ sudo systemctl enable mariadb --now mariadb
$ mysql -e "CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'dPwBCk67YSJ9'; GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION; FLUSH PRIVILEGES;"
```

登录 192.168.123.69 恢复数据库备份至 192.168.123.68

```bash
$ cd /data/backup
$ for backup in *.sql.gz; do gunzip -c "$backup" | mysql -uroot -pdPwBCk67YSJ9 -h192.168.123.68; done
```

### 恢复clickhouse数据库(仅企业版需要)

按照官方文档安装 https://clickhouse.com/docs/install, 并开启外部地址访问

> 可参考官方导入方式将备份文件恢复，例如：

```bash
gunzip -c /data/backup/payment_bill_$(date +%Y%m%d).csv.gz | clickhouse-client -q "INSERT INTO yunionmeter.payment_bills_tbl FORMAT CSV"
gunzip -c /data/backup/tags_$(date +%Y%m%d).csv.gz | clickhouse-client -q "INSERT INTO yunionmeter.tags_tbl FORMAT CSV"
```

### 使用新数据库安装

登录到 192.168.123.68
```bash
$ git clone -b release/4.0 https://github.com/yunionio/ocboot
$ cd ocboot
$ ssh-copy-id root@192.168.123.68
$ cat > config.yml << EOF
primary_master_node:
  hostname: 192.168.123.68
  port: 22
  user: root
  # 指定备份数据库IP
  db_host: 192.168.123.68
  db_user: root
  # 指定备份数据库密码
  db_password: dPwBCk67YSJ9
  # 指定当前安装版本
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

### 切换计算节点到k3s

需要分别登录到各个计算节点卸载k8s相关组件

```bash
$ kubeadm reset --force
$ ipvsadm --clear
$ systemctl disable --now docker.socket docker kubelet
$ sudo apt remove -y kubeadm kubectl kubelet kubernetes-cni openvswitch-common openvswitch-switch
$ rm -rf /etc/kubernetes/ /var/lib/etcd/ /root/.kube/
$ reboot
```

v4.0.2及之后版本，需要依次登录到各个计算节点，往 /etc/yunion/host.conf 末尾加一行配置 disable_probe_kubelet: true

再按照最新文档依次再重新添加计算节点到集群