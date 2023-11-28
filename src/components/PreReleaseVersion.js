import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function ReleaseTag() {
  const { siteConfig } = useDocusaurusContext();
  const version = siteConfig.customFields.release_version;
  return (
    <code>{version}</code>
  )
}

