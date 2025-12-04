import React from 'react';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import clsx from 'clsx';
import styles from './styles.module.css';

const ProductCards = () => {
  const products = [
    {
      id: 'onpremise',
      name: '私有云',
      nameId: 'productCards.onpremise.name',
      description: '轻量级私有云，支持KVM虚拟化、GPU直通和VMware纳管',
      descriptionId: 'productCards.onpremise.description',
      icon: require('@site/static/img/feature_private_cloud.svg').default,
      link: '/docs/onpremise/getting-started',
      gradient: 'linear-gradient(135deg, #076f38 0%, #33925d 100%)',
    },
    {
      id: 'cmp',
      name: '多云管理',
      nameId: 'productCards.cmp.name',
      description: '统一管理多个公有云和私有云平台，简化多云架构复杂度',
      descriptionId: 'productCards.cmp.description',
      icon: require('@site/static/img/feature_cloud_manager.svg').default,
      link: '/docs/cmp/getting-started',
      gradient: 'linear-gradient(135deg, #29784c 0%, #3cad6e 100%)',
    },
    {
      id: 'baremetal',
      name: '物理机管理',
      nameId: 'productCards.baremetal.name',
      description: '物理机全生命周期管理，支持操作系统安装和RAID配置',
      descriptionId: 'productCards.baremetal.description',
      icon: require('@site/static/img/feature_baremetal.svg').default,
      link: '/docs/baremetal/getting-started',
      gradient: 'linear-gradient(135deg, #359962 0%, #4fddbf 100%)',
    },
  ];

  return (
    <div className={styles.productCardsContainer}>
      <div className={styles.productCardsSubtitle}>
        <Translate id="productCards.subtitle">选择您的部署方式，开始使用 Cloudpods</Translate>
      </div>
      <div className={styles.productCardsGrid}>
        {products.map((product) => {
          const Icon = product.icon;
          return (
            <Link
              key={product.id}
              to={product.link}
              className={styles.productCard}
            >
              <div className={styles.productCardBadge}>
                <Translate id="productCards.quickStart">快速开始</Translate>
              </div>
              <div 
                className={styles.productCardIcon}
                style={{ background: product.gradient }}
              >
                <Icon className={styles.icon} />
              </div>
              <div className={styles.productCardContent}>
                <h3 className={styles.productCardName}>
                  <Translate id={product.nameId}>{product.name}</Translate>
                </h3>
                <p className={styles.productCardDescription}>
                  <Translate id={product.descriptionId}>{product.description}</Translate>
                </p>
              </div>
              {/* <div className={styles.productCardArrow}>
                →
              </div> */}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ProductCards;

