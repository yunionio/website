import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useColorMode } from '@docusaurus/theme-common';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import HomepageBrands from '@site/src/components/HomepageBrands';
import HomepageFooter from '@site/src/components/HomepageFooter';
// import HomepagePanel from '@site/src/components/HomepagePanel';

import Heading from '@theme/Heading';
import styles from './index.module.css';

import Translate, { translate } from '@docusaurus/Translate';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const { isDarkTheme } = useColorMode();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container row">
        <div className={clsx('col', styles.alignCenter)}>
          <Heading as="h1" className="hero__title">
            {siteConfig.title}
          </Heading>
          <p className="hero__subtitle">
            <Translate id="homepage.subtitle">云原生的开源融合云平台</Translate>
          </p>
          <p className="hero__title">
            <Translate id="homepage.buildown">构建您自己的云上之云</Translate>
          </p>
          <div className={styles.buttons}>
            <Link
              className="button button--secondary button--lg"
              to="/docs/getting-started/">
              <Translate id="homepage.getStarted">快速开始</Translate>
            </Link>
          </div>
        </div>
        <div className="col">
          <img src={isDarkTheme? useBaseUrl('img/logo_black.png') : useBaseUrl('img/logo_white.png') } className={styles.heroImg} />
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  // const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={''}
      description="">
      <HomepageHeader />
      <main>
        {/* <HomepagePanel /> */}
        <HomepageFeatures />
        <HomepageBrands />
        <HomepageFooter />
      </main>
    </Layout>
  );
}
