import styles from './styles.module.css';
import Translate from '@docusaurus/Translate';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock'

export default function HomepagePanel() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.panelWrapper}>
          <div className={styles.panelItem}>
            <div className={styles.panelItemTitle}>Cloudpods Virtualization</div>
            <div className={styles.panelItemSubTitle}>
              <Translate id='homepage.cloudpodsVirtDesc'>本地虚拟化&裸金属</Translate>
            </div>
            <CodeBlock language='bash'>
              {'git clone -b release/3.10 https://github.com/yunionio/ocboot && cd ./ocboot\n./run.py virt'}
            </CodeBlock>
            <div className={styles.panelItemSupport}>
              <Translate id='homepage.osSupport'>系统支持：CentOS 7.6~7.9 Minimal、Debian 10/11、Ubuntu 22.04、银河麒麟V10 SP2、统信 UOS kongzi</Translate>
              <Link to='/docs/getting-started/onpremise/' style={{ marginLeft: '5px' }}>
                <Translate id='homepage.viewDocs'>查看部署文档</Translate>
              </Link>
            </div>
          </div>
          <div className={styles.panelItem} style={{marginLeft: '2rem'}}>
            <div className={styles.panelItemTitle}>Cloudpods CMP</div>
            <div className={styles.panelItemSubTitle}>
              <Translate id='homepage.cloudpodsCmpDesc'>统一管理公有云和私有云</Translate>
            </div>
            <CodeBlock language='bash'>
              {'git clone -b release/3.10 https://github.com/yunionio/ocboot && cd ./ocboot\n./ run.py cmp'}
            </CodeBlock>
            <div className={styles.panelItemSupport}>
              <Translate id='homepage.osSupport'>系统支持：CentOS 7.6~7.9 Minimal、Debian 10/11、Ubuntu 22.04、银河麒麟V10 SP2/SP3、统信 UOS kongzi</Translate>
              <Link to='/docs/getting-started/cmp/' style={{ marginLeft: '5px' }}>
                <Translate id='homepage.viewDocs'>查看部署文档</Translate>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
