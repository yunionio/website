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
# ${translate({ message: "可以使用 -h 选项来查看详细参数" })}
./ocboot.sh add-node [-h] [--user SSH_USER] [--key-file SSH_PRIVATE_FILE] [--port SSH_PORT] [--node-port SSH_NODE_PORT] FIRST_MASTER_HOST TARGET_NODE_HOSTS [TARGET_NODE_HOSTS ...]

positional arguments:
  FIRST_MASTER_HOST     onecloud cluster primary master host, e.g., 10.1.2.56
  TARGET_NODE_HOSTS     target nodes ip added into cluster

options:
  -h, --help            show this help message and exit
  --user SSH_USER, -u SSH_USER
                        primary master host ssh user (default: root)
  --key-file SSH_PRIVATE_FILE, -k SSH_PRIVATE_FILE
                        primary master ssh private key file (default: /root/.ssh/id_rsa)
  --port SSH_PORT, -p SSH_PORT
                        primary master host ssh port (default: 22)
  --node-port SSH_NODE_PORT, -n SSH_NODE_PORT
                        worker node host ssh port (default: 22) `
        }
      </CodeBlock>
    </div>
  )
}
