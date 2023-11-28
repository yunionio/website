import DocCardList from '@theme/DocCardList';
import { useCurrentSidebarCategory } from '@docusaurus/theme-common';

export default function IndexDocCardList() {
  return (
    <DocCardList items={useCurrentSidebarCategory().items} />
  )
}
