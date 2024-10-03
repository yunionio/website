import CodeBlock from '@theme/CodeBlock';
import { getCustomField } from './utils';

export default function OcbootFetchCheckout() {
  return (
    <CodeBlock language='bash'>
      {
        `$ git fetch --all\n` + `$ git checkout origin/master`
      }
    </CodeBlock>
  )
}

