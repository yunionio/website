import CodeBlock from '@theme/CodeBlock';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Translate, { translate } from '@docusaurus/Translate';

export default function BuildahK3S(props) {
  const productVersion = props.productVersion;
  return (
    <div>
      <CodeBlock language='bash'>
        {
          `
# ${translate({ message: "确保 git 已经安装" })}
# ${translate({ message: "克隆ocboot 的 master 分支. 注意：k3s的部署方式，目前只实现在 ocboot 的 master里" })}
git clone https://github.com/yunionio/ocboot.git && cd ocboot

# ${translate({ message: "安装 buildah" })}
./scripts/install-buildah.sh

# ${translate({ message: "默认部署 v3.11.x 版本的云管系统。如需部署其他版本，请自行修改 VERSION 文件到指定发行版。" })}

# ${translate({ message: "获取本机 IP" })}
# ${translate({ message: "如果网络情况复杂(多网卡、多ip)，此处也可手工指定 IP" })}
IP=$(ip route get 1 | awk '{print $7}' | sort -u | head -1)
./ocboot.sh run.py ${productVersion} $IP --k3s
           `
        }
      </CodeBlock>
    </div>
  )
}
