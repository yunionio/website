import CodeBlock from '@theme/CodeBlock';
import Translate, { translate } from '@docusaurus/Translate';
import { getCustomField } from './utils';

export default function OcbootFetchCheckout() {
  const version = getCustomField('release_version')
  const hint = translate({ id: 'OcbootUpdate.PRIMARY_MASTER_HOST_explation', message: '是指部署集群的第一个节点的 ip 地址，需要本机能够使用 ssh 密钥登录上去。' })
  return (
    <div>
      <p><strong>PRIMARY_MASTER_HOST</strong> {hint}</p>
      <CodeBlock language='bash'>
        {
          `$ ./ocboot.sh upgrade <PRIMARY_MASTER_HOST> ${version}`
        }
      </CodeBlock>
    </div>
  )
}
