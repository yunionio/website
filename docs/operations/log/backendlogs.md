---
sidebar_position: 1
---

# 查看服务日志

通过Grafana + Loki 持久化保存后端服务日志。

:::tip
以下内容只适用于使用 ocboot 部署的环境。
:::


自`3.7.6`版本后，operator服务结合 kubeserver 会默认部署 grafana 和 loki 提供查看后端服务日志的功能。

查看日志只用登录 grafana 即可，默认的 grafana 访问方式是以 ingress 的方式暴露服务。

### 访问Grafana

1. 访问Grafana的地址默认为 `https://控制节点IP地址/grafana`。

- 默认登录用户: `admin`
- 密码通过登陆管理节点执行以下命令获取: (注意该密码如果通过 grafana 前端修改后将会失效)

```bash
# 获取 admin 默认管理员登陆的密码
$ kubectl get oc -n onecloud default -o=jsonpath='{.spec.monitorStack.grafana.adminPassword}'
```

![](/img/docs/operations/log/grafana-home.png)

2. 点击上图中的 explore 按钮，进入Loki日志查询页面。如在该页面可查询某节点的host pod日志等。在查询条件中输入`{app="host",hostname="testhost"}`，在下方将会显示出该节点上的host pod日志。

![](/img/docs/operations/log/explore.png)

### 查询条件

loki 的日志服务查询是按标签进行过滤的，常用的标签 "app" 对应服务的名称，"hostname" 对应 pod 所在的机器，“container_name" 对应容器名称。

```bash
# 比如要查看 "ovn-north" 容器的日志
{container_name="ovn-north"}
 
# 查看节点 test 上的 host 服务日志
{app="host",hostname="test"}
 
# 查看 baremetal 服务日志
{app="baremetal-agent"}

# 过滤出 host 服务，主机名为 ceph-02 ，并包含 error 关键字的日志
{app="host",hostname="ceph-02"} |= "error"
```

更多查询使用方法请参考: [Loki Log queries](https://grafana.com/docs/loki/latest/query/log_queries/) 。

### 使用举例

如查询region服务过去3小时包含 error 关键字的日志。

查询条件可设置为`{app="region"} |= "error"`，时间过滤设置为“Last 3 hours” 。

![](/img/docs/operations/log/explore-region.png)
