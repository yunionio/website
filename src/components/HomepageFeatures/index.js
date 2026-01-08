import clsx from 'clsx';
import Heading from '@theme/Heading';
import Translate from '@docusaurus/Translate';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '云原生',
    title_id: 'homepage.featureServer',
    Svg: require('@site/static/img/feature_cloud_native.svg').default,
    description: '运行在Kubernetes中，使用Kubernetes Operator管理和维护',
    description_id: 'homepage.featureServerDesc',
  },
  {
    title: '私有云',
    title_id: 'homepage.featurePrivateCloud',
    Svg: require('@site/static/img/feature_private_cloud.svg').default,
    description: '一个可以管理海量KVM虚拟机的轻量级私有云',
    description_id: 'homepage.featurePrivateCloudDesc',
  },
  {
    title: '裸金属',
    title_id: 'homepage.featureBaremetal',
    Svg: require('@site/static/img/feature_baremetal.svg').default,
    description: '一个能进行物理机全生命周期管理的裸机云',
    description_id: 'homepage.featureBaremetalDesc',
  },
  {
    title: '多云管理',
    title_id: 'homepage.featureMultipleClouds',
    Svg: require('@site/static/img/feature_cloud_manager.svg').default,
    description: '管理多云资源的功能，可以管理大多数的主流云，包括私有云以及公有云',
    description_id: 'homepage.featureMultipleCloudsDesc',
  },
  {
    title: '多云K8S',
    title_id: 'homepage.featureK8s',
    Svg: require('@site/static/img/feature_k8s.svg').default,
    description: '在多云环境部署和管理Kubernetes集群',
    description_id: 'homepage.featureK8sDesc',
  },
  {
    title: '多租户IAM',
    title_id: 'homepage.featureIam',
    Svg: require('@site/static/img/feature_identity.svg').default,
    description: '一套完整的多租户认证和访问控制体系',
    description_id: 'homepage.featureIamDesc',
  },
  {
    title: '多云SSO',
    title_id: 'homepage.featureSso',
    Svg: require('@site/static/img/feature_cloud_sso.svg').default,
    description: '多云SSO允许以统一的联邦身份访问各个云平台原生控制台',
    description_id: 'homepage.featureSsoDesc',
  },
  {
    title: 'CLIMC',
    title_id: 'homepage.featureClimc',
    Svg: require('@site/static/img/feature_climc.svg').default,
    description: '使用命令行工具 climc 高效管理Cloudpods',
    description_id: 'homepage.featureClimcDesc',
  },
  {
    title: '统一API',
    title_id: 'homepage.featureApi',
    Svg: require('@site/static/img/feature_api.svg').default,
    description: '一套功能丰富、统一一致的REST API和模型访问以上的云资源和功能',
    description_id: 'homepage.featureApiDesc',
  },
];

function Feature({Svg, title, title_id, description, description_id}) {
  return (
    <div className={styles.featureItem}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className={'text--center padding-horiz--md ' + styles.featureTitle}>
        <Heading as="h3">
          <Translate id={title_id}>{title}</Translate>
        </Heading>
        <div className={styles.featureItemText}>
          <Translate id={description_id}>{description}</Translate>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.featureSection}>
      <div className="container">
        <div className={styles.sectionTitle}>
          <Translate id="homepage.featureTitle">The One Cloud Contains All Your Clouds</Translate>
        </div>
        <div className={styles.sectionSubTitle}>
          <Translate id="homepage.featureDesc">Cloudpods不仅可以管理本地的虚拟机和物理机资源，还可以管理多个云平台和云账号。Cloudpods隐藏了这些异构基础设施资源的数据模型和API的差异，对外暴露了一套统一的API，允许用户就像用一个云一样地访问多云。从而大大降低了访问多云的复杂度，提升了管理多云的效率。</Translate>
        </div>
        <div className={styles.featureWrapper}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
