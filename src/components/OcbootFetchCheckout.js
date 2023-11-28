import CodeBlock from '@theme/CodeBlock';
import { getCustomField } from './utils';

export default function OcbootFetchCheckout() {
  const version = getCustomField('release_version')
  return (
    <CodeBlock language='bash'>
      {
        `$ git fetch\n` + `$ git checkout ${version}`
      }
    </CodeBlock>
  )
}
