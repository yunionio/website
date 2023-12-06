import { getCustomField } from './utils';

export default function SiteCustomField({ fieldKey }) {
  return (
    <code>{getCustomField(fieldKey)}</code>
  )
}

