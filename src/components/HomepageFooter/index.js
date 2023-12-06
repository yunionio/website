import styles from './styles.module.css';
import Translate from '@docusaurus/Translate';
import Link from '@docusaurus/Link';
import { InlineIcon } from '@iconify/react';

const ContactImg = require('@site/static/img/contact_me.png').default;
export default function HomepageFooter() {
  return (
    <footer class="footer footer--dark">
      <div class="container container--fluid">
        <div className={styles.footerItemsWrapper}>
          {/* 问题 */}
          <div className={styles.footerItem}>
            <div className={styles.footerItemTitle}>
              <InlineIcon icon="akar-icons:question-fill" className={styles.footerItemIcon} />
              <span className={styles.footerItemTitleText}>
                <Translate id="homepage.question">有问题</Translate>
              </span>
            </div>
            <div className={styles.footerItemContent}>
              <Link className={styles.footerItemText} to="https://github.com/yunionio/cloudpods/issues">
                <Translate id="homepage.createIssue">请在 GitHub 提 Issue</Translate>
              </Link>
            </div>
          </div>
          {/* 贡献 */}
          <div className={styles.footerItem}>
            <div className={styles.footerItemTitle}>
              <InlineIcon icon="akar-icons:github-fill" className={styles.footerItemIcon} />
              <span className={styles.footerItemTitleText}>
                <Translate id="homepage.contribute">欢迎贡献</Translate>
              </span>
            </div>
            <div className={styles.footerItemContent}>
              <div>
                <Link className={styles.footerItemText} to="https://github.com/yunionio/cloudpods">
                  <Translate id="homepage.createPr">请在 GitHub 提 Pull Request</Translate>
                </Link>
              </div>
              <div>
                <Link className={styles.footerItemText} to="https://github.com/yunionio/cloudpods">
                  <Translate id="homepage.createPr2">给 Cloudpods 贡献代码</Translate>
                </Link>
              </div>
            </div>
          </div>
          {/* 联系 */}
          <div className={styles.footerItem}>
            <div className={styles.footerItemTitle}>
              <InlineIcon icon="ant-design:wechat-filled" style={{'font-size': '1.3rem'}} className={styles.footerItemIcon} />
              <span className={styles.footerItemTitleText}>
                <Translate id="homepage.contact">欢迎联系我们</Translate>
              </span>
            </div>
            <div className={styles.footerItemContent}>
              <img className={styles.footerItemImg} src={ContactImg} />
            </div>
          </div>
        </div>
        <div className={styles.copyRight} style={{'margin-top': '2rem'}}>
          Copyright © 2017-2023 The Cloudpods Authors.
        </div>
        <div className={styles.copyRight}>
          <Link style={{'color': '#fff'}} to="https://beian.miit.gov.cn">京ICP备2021005745号-3</Link>
        </div>
      </div>
    </footer>
  );
}
