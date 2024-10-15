import CodeBlock from '@theme/CodeBlock';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Translate, { translate } from '@docusaurus/Translate';

export default function OcbootRun(props) {
  const commentRunChinaAliReg = translate({
    id: "OcbootRun.runChinaAliRegComment",
    message: "# 直接部署，会从 registry.cn-beijing.aliyuncs.com 拉取容器镜像",
  })
  const commentRunChinaPip = translate({
    id: "OcbootRun.runChinaPip",
    message: `# 如果遇到 pip 安装包下载过慢的问题，可以用 -m 参数指定 pip 源\n# 比如下面使用: https://mirrors.aliyun.com/pypi/simple/ 源`,
  })

  const otherRegioinHint = translate({
    id: "OcbootRun.otherRegionHint",
    message: `对于某些网络环境，如果出现 registry.cn-beijing.aliyuncs.com 访问缓慢或不可达，可指定镜像源: docker.io/yunion 来安装，命令如下：`
  })
  return (
    <div>
      <Tabs>
        <TabItem
          value={translate({ message: "K3s" })}
          label={translate({ message: "K3s" })}>
          <p>卸载 K3s 服务</p>
          <CodeBlock
            language="bash">
            {
              `$ k3s-uninstall.sh\n$ k3s-agent-uninstall.sh`
            }
          </CodeBlock>
          <p>停止并禁用相关服务：</p>
          <CodeBlock
            language="bash">
            {
              `$ systemctl disable --now yunion-executor`
            }
          </CodeBlock>
        </TabItem>
        <TabItem
          value={translate({ message: "Kubernetes" })}
          label={translate({ message: "Kubernetes" })}>
          <p>卸载Kubernetes服务</p>
          <CodeBlock language="bash">
            {
              `$ kubeadm reset --force\n$ ipvsadm --clear`
            }
          </CodeBlock>
          <p>停止并禁用相关服务：</p>
          <CodeBlock
            language="bash">
            {
              `$ systemctl disable --now docker.socket docker kubelet yunion-executor`
            }
          </CodeBlock>
          <p>卸载kubelet, yunion-executor等包，并清除相关的数据目录，下面以 centos 举例：</p>
          <CodeBlock
            language="bash">
            {
              `$ rpm -qa |grep kube |xargs -I {} yum -y remove {} 
$ rpm -qa |grep yunion |xargs -I {} yum -y remove {}
$ rm -rf /etc/kubernetes/ /var/lib/etcd/ /root/.kube/ /opt/cloud/`
            }
          </CodeBlock>
        </TabItem>
      </Tabs>
    </div>
  )
}

