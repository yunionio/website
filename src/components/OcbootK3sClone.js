import CodeBlock from '@theme/CodeBlock';
import Translate, { translate } from '@docusaurus/Translate';
import { getCustomField } from './utils';

export default function OcbootClone() {
  const comment = translate({
    id: "OcbootClone.downloadComment",
    message: '# 下载 ocboot 工具到本地',
    description: 'locally download comment',
  })
  const branch = getCustomField('release_branch')
  return (
    <div>
      <CodeBlock language='bash'>
        {
          comment + `\n$ git clone https://github.com/yunionio/ocboot && cd ./ocboot`
        }
      </CodeBlock>
    </div>
  )
}

