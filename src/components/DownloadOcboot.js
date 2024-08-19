import CodeBlock from '@theme/CodeBlock';
import { getCustomField } from './utils';

export default function ReleaseBranch() {
  const version = getCustomField('ocboot_release_version')
  return (
    <CodeBlock language='bash'>
      {
        `$ wget https://github.com/yunionio/ocboot/archive/refs/tags/${version}.tar.gz
$ tar xf ${version}.tar.gz
$ cd ocboot-${version}`
      }
    </CodeBlock>
  )
}

