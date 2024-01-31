import styles from './styles.module.css';
import Translate from '@docusaurus/Translate';
import Link from '@docusaurus/Link';

const SupportBrandInfo = {
  title: '支持的云平台和技术',
  title_id: 'homepage.supportBrandTitle',
  icons: ['IPMI', 'KVM', 'Redfish', 'ceph', 'minio', 'VMware', 'OpenStack', 'Nutanix', 'ZStack', 'Proxmox',
    'BingoCloud', 'ctyun', 'ecloud', 'JDCloud', 'Aliyun', 'TencentCloud', 'huaweicloud', 'AWS', 'Azure', 'GoogleCloud', 'UCloud',
    'Oracle', 'QingCloud', 'Volcengine', 'BaiduCloud', 'liantong', 'jinshan']
}

const UserBrandInfo = {
  title: '谁在用Cloudpods？',
  title_id: 'homepage.cloudpodsUserTitle',
  sub_title: '请在此 {issueLink} 查看Cloudpods用户列表',
  sub_title_id: 'homepage.cloudpodsUserDesc',
  icons: ['mininglamp', 'tianyancha', 'percent', 'bitmain', 'navinfo', 'bonc', 'huolala', 'jzsec', 'lixiang', 'nio', 'nsfocus',
    'lexin', 'xiaoying', 'hpc-now', 'asiainfodata', 'tcl', 'iscas', 'grgbanking', 'stoneatom', 'jilin-university', 'guojiachaosuanjinan', 'dongnan-university']
}

const OrgBrandInfo = {
  title: '组织贡献者',
  title_id: 'homepage.orgTitle',
  sub_title: '感谢以下组织对Cloudpods做出的开发贡献',
  sub_title_id: 'homepage.orgDesc',
  icons: ['bonc', 'grgbanking', 'summer-ospp', 'BingoCloud', 'tuyou']
}

function Icons({ icons }) {
  const Icons = icons.map(url => {
    return {
      icon: (require(`@site/static/img/provider/${url}.png`).default),
      name: url,
    }
  })
  return (
    <div className={styles.providerWrapper}>
      {Icons.map((item, idx) => (
        <img className={styles.providerImg} src={item.icon} alt={item.name} />
      ))}
    </div>
  )
}

export default function HomepageFeatures() {
  return (
    <div>
      {/* 支持平台 */}
      <section className={styles.section}>
        <div className="container">
          <div>
            <div className={styles.sectionTitle}>
              <Translate id={SupportBrandInfo.title_id}>{SupportBrandInfo.title}</Translate>
            </div>
            <Icons icons={SupportBrandInfo.icons} />
          </div>
        </div>
      </section>
      {/* 用户 */}
      <section className={styles.section} style={{ background: 'rgba(0,0,0,0.05)' }}>
        <div className="container">
          <div>
            <div className={styles.sectionTitle}>
              <Translate id={UserBrandInfo.title_id}>{UserBrandInfo.title}</Translate>
            </div>
            <div className={styles.sectionSubTitle}>
              <Translate
                id={UserBrandInfo.sub_title_id}
                values={{
                  issueLink: (
                    <Link to="https://github.com/yunionio/cloudpods/issues/11427">GitHub Issue</Link>
                  ),
                }}>
                {UserBrandInfo.sub_title}
              </Translate>
            </div>
            <Icons icons={UserBrandInfo.icons} />
          </div>
        </div>
      </section>
      {/* 贡献者 */}
      <section className={styles.section}>
        <div className="container">
          <div>
            <div className={styles.sectionTitle}>
              <Translate id={OrgBrandInfo.title_id}>{OrgBrandInfo.title}</Translate>
            </div>
            <div className={styles.sectionSubTitle}>
              <Translate id={OrgBrandInfo.sub_title_id}>{OrgBrandInfo.sub_title}</Translate>
            </div>
            <Icons icons={OrgBrandInfo.icons} />
          </div>
        </div>
      </section>
    </div>

  );
}
