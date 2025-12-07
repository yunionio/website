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
      description: '一个可以管理海量KVM虚拟机的轻量级私有云',
      descriptionId: 'productCards.onpremise.description',
      icon: require('@site/static/img/feature_private_cloud.svg').default,
      link: '/docs/onpremise/getting-started',
      iconColor: '#076f38', // Primary green
      buttonColor: '#076f38',
      steps: [
        {
          title: '安装 Cloudpods',
          titleId: 'productCards.onpremise.step1.title',
          description: '一键部署私有云环境',
          descriptionId: 'productCards.onpremise.step1.description',
        },
        {
          title: '创建虚拟机',
          titleId: 'productCards.onpremise.step2.title',
          description: '使用 Web UI 或 CLI 创建 VM',
          descriptionId: 'productCards.onpremise.step2.description',
        },
        {
          title: '管理资源',
          titleId: 'productCards.onpremise.step3.title',
          description: '监控、扩展和优化您的私有云',
          descriptionId: 'productCards.onpremise.step3.description',
        },
      ],
      buttonText: '开始使用私有云 >',
      buttonTextId: 'productCards.onpremise.button',
    },
    {
      id: 'cmp',
      name: '多云管理',
      nameId: 'productCards.cmp.name',
      description: '管理多云资源,统一管控主流公有云和私有云',
      descriptionId: 'productCards.cmp.description',
      icon: require('@site/static/img/feature_cloud_manager.svg').default,
      link: '/docs/cmp/getting-started',
      iconColor: '#33925d', // Primary light green
      buttonColor: '#33925d',
      steps: [
        {
          title: '接入云账号',
          titleId: 'productCards.cmp.step1.title',
          description: '添加阿里云、AWS、腾讯云等',
          descriptionId: 'productCards.cmp.step1.description',
        },
        {
          title: '统一视图',
          titleId: 'productCards.cmp.step2.title',
          description: '在统一界面查看所有云资源',
          descriptionId: 'productCards.cmp.step2.description',
        },
        {
          title: '批量操作',
          titleId: 'productCards.cmp.step3.title',
          description: '跨云平台批量管理资源',
          descriptionId: 'productCards.cmp.step3.description',
        },
      ],
      buttonText: '开始使用多云管理 >',
      buttonTextId: 'productCards.cmp.button',
    },
    {
      id: 'baremetal',
      name: '裸金属',
      nameId: 'productCards.baremetal.name',
      description: '一个能进行物理机全生命周期管理的裸机云',
      descriptionId: 'productCards.baremetal.description',
      icon: require('@site/static/img/feature_baremetal.svg').default,
      link: '/docs/baremetal/getting-started',
      iconColor: '#29784c', // Primary dark green
      buttonColor: '#29784c',
      steps: [
        {
          title: '发现服务器',
          titleId: 'productCards.baremetal.step1.title',
          description: '自动发现物理机并加入管理',
          descriptionId: 'productCards.baremetal.step1.description',
        },
        {
          title: '部署操作系统',
          titleId: 'productCards.baremetal.step2.title',
          description: '通过 PXE 自动化部署',
          descriptionId: 'productCards.baremetal.step2.description',
        },
        {
          title: '监控维护',
          titleId: 'productCards.baremetal.step3.title',
          description: '硬件监控和远程管理',
          descriptionId: 'productCards.baremetal.step3.description',
        },
      ],
      buttonText: '开始使用裸金属 >',
      buttonTextId: 'productCards.baremetal.button',
    },
  ];

  return (
    <section className={styles.productCardsContainer}>
      <div className="container">
        <h2 className={styles.productCardsTitle}>
          <Translate id="productCards.title">快速开始</Translate>
        </h2>
        <div className={styles.productCardsSubtitle}>
          <Translate id="productCards.subtitle">选择您的部署方式, 快速上手 Cloudpods</Translate>
        </div>
        <div className={styles.productCardsGrid}>
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.productCardHeader}>
                  <div 
                    className={styles.productCardIcon}
                    style={{ backgroundColor: product.iconColor }}
                  >
                    <Icon className={styles.icon} />
                  </div>
                  <h3 className={styles.productCardName}>
                    <Translate id={product.nameId}>{product.name}</Translate>
                  </h3>
                </div>
                <div className={styles.productCardContent}>
                  <p className={styles.productCardDescription}>
                    <Translate id={product.descriptionId}>{product.description}</Translate>
                  </p>
                  <div className={styles.productCardSteps}>
                    {product.steps.map((step, index) => (
                      <div key={index} className={styles.productCardStep}>
                        <div className={styles.stepNumber}>{index + 1}</div>
                        <div className={styles.stepContent}>
                          <div className={styles.stepTitle}>
                            <Translate id={step.titleId}>{step.title}</Translate>
                          </div>
                          <div className={styles.stepDescription}>
                            <Translate id={step.descriptionId}>{step.description}</Translate>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link
                    to={product.link}
                    className={styles.productCardButton}
                    style={{ backgroundColor: product.buttonColor }}
                  >
                    <Translate id={product.buttonTextId}>{product.buttonText}</Translate>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductCards;

