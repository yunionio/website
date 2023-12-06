import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import HomepageBrands from '@site/src/components/HomepageBrands';
import HomepageFooter from '@site/src/components/HomepageFooter';
import HomepagePanel from '@site/src/components/HomepagePanel';

import Heading from '@theme/Heading';
import styles from './index.module.css';

import Translate, { translate } from '@docusaurus/Translate';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">
          <Translate id="homepage.subtitle">开源、云原生的融合云平台</Translate>
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started/">
            <Translate id="homepage.getStarted">快速开始</Translate>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={''}
      description="">
      <HomepageHeader />
      <main>
        <HomepagePanel />
        <HomepageFeatures />
        <HomepageBrands />
        <HomepageFooter />
      </main>
    </Layout>
  );
}
