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
          value={translate({ message: "中国大陆" })}
          label={translate({ message: "中国大陆" })}>
          <CodeBlock
            language="bash">
            {
              commentRunChinaAliReg + `\n$ ./run.py ${props.productVersion} <host_ip>\n\n` + commentRunChinaPip +
              `\n$ ./run.py -m https://mirrors.aliyun.com/pypi/simple/ ${props.productVersion} <host_ip>`
            }
          </CodeBlock>
        </TabItem>
        <TabItem
          value={translate({ message: "其他地区" })}
          label={translate({ message: "其他地区" })}>
          <p>{otherRegioinHint}</p>
          <CodeBlock language="bash">
            {
              `IMAGE_REPOSITORY=docker.io/yunion ./run.py ${props.productVersion} <host_ip>`
            }
          </CodeBlock>
        </TabItem>
      </Tabs>
    </div>
  )
}
