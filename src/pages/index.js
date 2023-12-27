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
// import GitHubButton from 'react-github-btn'

import Heading from '@theme/Heading';
import styles from './index.module.css';

import Translate, { translate } from '@docusaurus/Translate';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const { isDarkTheme } = useColorMode();
  const Svg = require('@site/static/img/cloudpods.svg').default;
  return (
    <section className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className="row">
          <div className={clsx('col', styles.alignCenter)}>
            <Heading as="h1" className="hero__title">
              {siteConfig.title}
            </Heading>
            <p className="hero__subtitle">
              <Translate id="homepage.subtitle">云原生的开源融合云平台</Translate>
            </p>
            <p className="hero__title">
              <Translate id="homepage.buildown">构建您专属的云上之云</Translate>
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
            <Svg className={styles.heroImg} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  // const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={''}
      description="">
      <main>
        <HomepageHeader />
        {/* <HomepagePanel /> */}
        <HomepageFeatures />
        <HomepageBrands />
        <HomepageFooter />
      </main>
    </Layout>
  );
}
