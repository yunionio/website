执行下面的步骤进行重装:

1. 执行 `kubeadm reset -f` 删除 kubernetes 集群。
2. 按照 配置文件`config-allinone-current.yml` 里  `mariadb_node`的数据库连接信息来连接mariadb 客户端，然后`drop`掉 `ocboot` 创建的数据库，只留下系统自带的数据库（例如 `information_schema,mysql,performance_schema`）。
   ```sql
   -- drop databases created by ocboot
   drop database if exists autoupdate         ;
   drop database if exists bastionhost        ;
   drop database if exists devtool            ;
   drop database if exists extdb              ;
   drop database if exists glance             ;
   drop database if exists grafana            ;
   drop database if exists itsm_engine        ;
   drop database if exists keystone           ;
   drop database if exists kubeserver         ;
   drop database if exists monitor            ;
   drop database if exists notify             ;
   drop database if exists report             ;
   drop database if exists webconsole         ;
   drop database if exists yunionagent        ;
   drop database if exists yunionansible      ;
   drop database if exists yunionbilling      ;
   drop database if exists yunioncloud        ;
   drop database if exists yunioncloudevent   ;
   drop database if exists yunioncloudid      ;
   drop database if exists yunioncloudnet     ;
   drop database if exists yunioncloudproxy   ;
   drop database if exists yunionconf         ;
   drop database if exists yunionlogger       ;
   drop database if exists yunionmeter        ;
   ```
3. 重启操作系统，以便释放`kubernetes`创建的虚拟网卡，恢复默认网络环境。
4. 重新运行 `ocboot` 的 `run.py` 脚本。
