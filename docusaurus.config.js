// @ts-check
// 重构后的 Docusaurus 配置文件
// 使用多文档实例方案

import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Cloudpods',
  favicon: 'img/favicon.ico',
  customFields: {
    release_branch: 'release/3.11',
    pre_release_branch: 'release/3.10',
    release_version: 'v3.11.13',
    pre_release_version: 'v3.10.15',
    ocboot_release_version: 'master-v3.11.13-0',
  },

  url: process.env.DOCUSAURUS_URL || 'https://www.cloudpods.org',
  baseUrl: process.env.DOCUSAURUS_BASE_URL || '/',

  organizationName: 'yunionio',
  projectName: 'cloudpods',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans', 'en'],
  },

  scripts: [
    {
      src: 'https://hm.baidu.com/hm.js?3c5253cd6530122d0f774cab69e3c07f',
      async: true,
    },
    {
      src: '/js/github-star.js',
      async: true,
    },
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false, // 禁用默认的 docs 配置，使用插件方式
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/yunionio/website/tree/master',
          blogTitle: 'Cloudpods blog',
          postsPerPage: 'ALL',
          blogSidebarTitle: 'All posts',
          blogSidebarCount: 'ALL',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [
    // 共享文档实例（使用 default ID 以兼容搜索插件）
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'default',
        path: 'docs/shared',
        routeBasePath: 'docs/shared',
        sidebarPath: './sidebars/shared.js',
        editUrl: 'https://github.com/yunionio/website/tree/master',
        lastVersion: 'current',
        versions: {
          current: {
            label: '3.11',
            path: '',
          },
        },
      },
    ],
    // 私有云管理文档实例
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'onpremise',
        path: 'docs/onpremise',
        routeBasePath: 'docs/onpremise',
        sidebarPath: './sidebars/onpremise.js',
        editUrl: 'https://github.com/yunionio/website/tree/master',
        lastVersion: 'current',
        versions: {
          current: {
            label: '3.11',
            path: '',
          },
        },
      },
    ],
    // 多云管理文档实例
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'cmp',
        path: 'docs/cmp',
        routeBasePath: 'docs/cmp',
        sidebarPath: './sidebars/cmp.js',
        editUrl: 'https://github.com/yunionio/website/tree/master',
        lastVersion: 'current',
        versions: {
          current: {
            label: '3.11',
            path: '',
          },
        },
      },
    ],
    // 物理机管理文档实例
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'baremetal',
        path: 'docs/baremetal',
        routeBasePath: 'docs/baremetal',
        sidebarPath: './sidebars/baremetal.js',
        editUrl: 'https://github.com/yunionio/website/tree/master',
        lastVersion: 'current',
        versions: {
          current: {
            label: '3.11',
            path: '',
          },
        },
      },
    ],
    // Google Analytics
    [
      '@docusaurus/plugin-google-gtag',
      {
        trackingID: 'G-999X9XX9XX',
        anonymizeIP: true,
      },
    ],
    // 重定向插件（用于向后兼容）
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          // 明确的重定向规则（用于根路径）
          {
            from: '/docs/introduction',
            to: '/',
          },
          {
            from: '/docs/getting-started',
            to: '/',
          },
          {
            from: '/docs/contact',
            to: '/docs/onpremise/contact',
          },
          {
            from: '/docs/release-notes',
            to: '/docs/onpremise/release-notes',
          },
          {
            from: '/docs/development',
            to: '/docs/onpremise/development',
          },
          {
            from: '/docs/development/changelog',
            to: '/docs/onpremise/development/changelog',
          },
        ],
      },
    ],
  ],

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        hashed: true,
        language: ['en', 'zh'],
        // 搜索插件会自动索引所有文档插件的内容
        docsRouteBasePath: '/docs',
        indexBlog: true,
        ignoreFiles: [/docs\/development\/changelog\/.*/],
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 5,
      },
      navbar: {
        title: 'Cloudpods',
        logo: {
          alt: 'Cloudpods Logo',
          src: 'img/cloudpods_circle_black.svg',
          srcDark: 'img/cloudpods_circle_white.svg',
        },
        items: [
          {
            type: 'dropdown',
            label: '文档',
            position: 'left',
            items: [
              {
                type: 'docSidebar',
                docsPluginId: 'onpremise',
                sidebarId: 'onpremiseSidebar',
                label: '私有云',
                to: '/docs/onpremise/getting-started',
              },
              {
                type: 'docSidebar',
                docsPluginId: 'cmp',
                sidebarId: 'cmpSidebar',
                label: '多云管理',
                to: '/docs/cmp/getting-started',
              },
              {
                type: 'docSidebar',
                docsPluginId: 'baremetal',
                sidebarId: 'baremetalSidebar',
                label: '物理机管理',
                to: '/docs/baremetal/getting-started',
              },
              // {
              //   type: 'docSidebar',
              //   docsPluginId: 'default',
              //   sidebarId: 'sharedSidebar',
              //   label: '通用文档',
              //   to: '/docs/shared/introduction',
              // },
            ],
          },
          { to: '/blog', label: '博客', position: 'left' },
          { to: 'https://www.yunion.cn/subscription/index.html', label: '服务订阅', position: 'left' },
          { to: 'https://apifox.com/apidoc/shared-f917f6a6-db9f-4d6a-bbc3-ea58c945d7fd', label: 'API', position: 'left' },
          {
            type: 'docsVersionDropdown',
            docsPluginId: 'default',
            position: 'right',
            dropdownActiveClassDisabled: true,
            dropdownItemsAfter: [
              { label: '3.10', href: 'https://www.cloudpods.org/v3.10/' },
              { label: '3.9', href: 'https://v1.cloudpods.org/v3.9/' },
            ],
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            href: 'https://github.com/yunionio/cloudpods',
            label: 'GitHub',
            position: 'right',
            className: 'GitHubLink-custom',
          },
        ],
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'diff', 'go'],
      },
    }),
};

export default config;

