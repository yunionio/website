import CodeBlock from '@theme/CodeBlock';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Translate, { translate } from '@docusaurus/Translate';

function getConfig(productVersion) {
  const { siteConfig } = useDocusaurusContext();
  let shouldAsHost = () => {
    if (productVersion === 'CMP') {
      return 'false'
    }
    return 'true'
  }
  const primaryMasterNodeComment = translate({
    id: "ocbootConfigHA.primaryMasterNodeComment",
    message: "primary_master_node 表示运行 k8s 和 Cloudpods 服务的节点"
  })
  const asHostComment = translate({ id: "ocbootConfigHA.asHost", message: "该节点作为 Cloudpods 私有云计算节点，如果不想让控制节点作为计算节点，可以设置为 false" })
  const asHostOnVMComment = translate({ id: "ocbootConfigHA.asHostOnVM", message: "虚拟机可作为 Cloudpods 内置私有云计算节点（默认为 false）。开启此项时，请确保 as_host: true" })
  const productVersionComment = translate({
    id: "ocbootConfigHA.productVersion", message: "产品版本，从 [Edge, CMP, FullStack] 选择一个，FullStack 会安装融合云，CMP 安装多云管理版本，Edge 安装私有云"
  })
  const imageRepositoryComment = translate({
    id: "ocbootConfigHA.imageRepository",
    message: "服务对应的镜像仓库，如果待部署的机器不在中国大陆，可以用 dockerhub 的镜像仓库：docker.io/yunion",
  })
  const haComment = translate({ id: "ocbootConfigHA.enableHA", message: "启用高可用模式" })
  const hostNetworkComment = translate({ id: "ocbootConfigHA.hostNetwork", message: "计算节点默认网桥 br0 对应的网卡" })

  const content = `# ${primaryMasterNodeComment}
primary_master_node:
  # ssh login IP
  hostname: $PRIMARY_IP
  # ${translate({ message: "不使用本地登录方式" })}
  use_local: false
  # ssh login user
  user: root
  # cloudpods version
  onecloud_version: "${siteConfig.customFields.release_version}"
  # mariadb connection address
  db_host: "$DB_IP"
  # mariadb user
  db_user: "$DB_USER"
  # mariadb password
  db_password: "$DB_PSWD"
  # mariadb port
  db_port: "$DB_PORT"
  # ${translate({ message: "节点服务监听的地址，多网卡时可以指定对应网卡的地址" })}
  node_ip: "$PRIMARY_IP"
  # ${translate({ message: "对应 Kubernetes calico 插件默认网卡选择规则" })}
  ip_autodetection_method: "can-reach=$PRIMARY_IP"
  # ${translate({ id: "ocbootConfigHA.controlPlaneHostHint", message: "K8s 控制节点的 IP，对应keepalived 监听的 VIP" })}
  controlplane_host: $K8S_VIP
  # ${translate({ id: "ocbootConfigHA.controlPlanePortHint", message: "K8s 控制节点 apiserver 监听的端口" })}
  controlplane_port: "6443"
  # ${asHostComment}
  as_host: ${shouldAsHost()}
  # ${asHostOnVMComment}
  as_host_on_vm: ${shouldAsHost()}
  # ${productVersionComment}
  product_version: '${productVersion}'
  # ${imageRepositoryComment}
  image_repository: registry.cn-beijing.aliyuncs.com/yunionio
  # ${haComment}
  high_availability: true
  # ${translate({ id: "ocbootConfigHA.enableMinio", message: "使用 minio 作为后端虚拟机镜像存储" })}
  enable_minio: true
  insecure_registries:
  - $PRIMARY_IP:5000
  ha_using_local_registry: false
  # ${hostNetworkComment}
  host_networks: "$PRIMARY_INTERFACE/br0/$PRIMARY_IP"

master_nodes:
  # ${translate({ id: "ocbootConfigHA.joinControlNodeVIP", message: "加入控制节点的 k8s vip" })}
  controlplane_host: $K8S_VIP
  # ${translate({ id: "ocbootConfigHA.joinControlNodePort", message: "加入控制节点的 K8s apiserver 端口" })}
  controlplane_port: "6443"
  # ${translate({ id: "ocbootConfigHA.asController", message: "作为 K8s 和 Cloudpods 控制节点" })}
  as_controller: true
  # ${asHostComment}
  as_host: ${shouldAsHost()}
  # ${asHostOnVMComment}
  as_host_on_vm: ${shouldAsHost()}
  # ${translate({ id: "ocbootConfigHA.syncNtpFromPrimaryNode", message: "从 primary 节点同步 ntp 时间" })}
  ntpd_server: "$PRIMARY_IP"
  # ${haComment}
  high_availability: true
  insecure_registries:
  - $PRIMARY_IP:5000
  hosts:
  - user: root
    hostname: "$MASTER_1_IP"
    # ${hostNetworkComment}
    host_networks: "$MASTER_1_INTERFACE/br0/$MASTER_1_IP"
  - user: root
    hostname: "$MASTER_2_IP"
    # ${hostNetworkComment}
    host_networks: "$MASTER_2_INTERFACE/br0/$MASTER_2_IP"`
  return content;
}

export default function OcbootConfigHA(props) {
  const productVersion = props.productVersion;
  const config = getConfig(props.productVersion);
  return (
    <div>
      <CodeBlock language='bash'>
        {
          `# ${translate({ id: "ocbootConfigHA.initShellVars", message: "设置 shell 环境变量" })}
DB_IP="10.127.190.11"
DB_PORT=3306
DB_PSWD="0neC1oudDB#"
DB_USER=root

K8S_VIP=10.127.190.10
PRIMARY_INTERFACE="eth0"
PRIMARY_IP=10.127.90.101

MASTER_1_INTERFACE="eth0"
MASTER_1_IP=10.127.90.102
MASTER_2_INTERFACE="eth0"
MASTER_2_IP=10.127.90.103

# ${translate({ id: "ocbootConfigHA.generateConfigYAML", message: "生成 yaml 部署配置文件" })}
cat > config-k8s-ha.yml <<EOF
${config}
EOF`
        }
      </CodeBlock>
    </div>
  )
}
