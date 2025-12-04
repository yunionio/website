import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useColorMode } from '@docusaurus/theme-common';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import HomepageBrands from '@site/src/components/HomepageBrands';
import HomepageFooter from '@site/src/components/HomepageFooter';
import ProductCards from '@site/src/components/ProductCards';
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
        <div className={styles.heroContent}>
          <div className={styles.heroTitleRow}>
            <Heading as="h1" className="hero__title">
              {siteConfig.title}
            </Heading>
            <Svg className={styles.heroImg} />
          </div>
          <p className="hero__subtitle">
            <Translate id="homepage.subtitle">云原生的开源融合云平台</Translate>
          </p>
          <ProductCards />
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
