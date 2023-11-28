import CodeBlock from '@theme/CodeBlock';
import Translate, { translate } from '@docusaurus/Translate';
import { getCustomField } from './utils';

export default function GetClusterVersion() {
  const version = getCustomField('pre_release_version')
  return (
    <CodeBlock language='bash'>
      {
        translate({ id: "GetClusterVersion.useKubectlGetVersion", message: "# 使用 kubectl 获得当前集群的版本" }) + `\n$ kubectl -n onecloud get onecloudclusters default -o=jsonpath='{.spec.version}'` + `\n${version} # ` + translate({ id: "GetClusterVersion.resultVersion", message: "发现当前版本为 " }) + version
      }
    </CodeBlock>
  )
}
