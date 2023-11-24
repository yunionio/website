import CodeBlock from '@theme/CodeBlock';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Translate, { translate } from '@docusaurus/Translate';

export default function OcbootClone() {
  const { siteConfig } = useDocusaurusContext();
  const comment = translate({
    id: "OcbootClone.downloadComment",
    message: '# 下载 ocboot 工具到本地',
    description: 'locally download comment',
  })
  return (
    <div>
      <CodeBlock language='bash'>
        {
          comment + `\n$ git clone -b ${siteConfig.customFields.release_branch} https://github.com/yunionio/ocboot && cd ./ocboot`
        }
      </CodeBlock>
    </div>
  )
}
