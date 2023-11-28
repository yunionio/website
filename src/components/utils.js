import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export function getCustomField(key) {
  const { siteConfig } = useDocusaurusContext();
  return siteConfig.customFields[key];
}
