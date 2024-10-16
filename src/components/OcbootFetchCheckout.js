import CodeBlock from '@theme/CodeBlock';
import { getCustomField } from './utils';

export default function OcbootFetchCheckout() {
  const branch = getCustomField('release_branch')
  return (
    <CodeBlock language='bash'>
      {
        `$ git fetch --all\n` + `$ git checkout origin/${branch}`
      }
    </CodeBlock>
  )
}
