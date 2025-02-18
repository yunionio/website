// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Cloudpods',
  // tagline: '开源、云原生的融合云平台',
  favicon: 'img/favicon.ico',
  customFields: {
    release_branch: 'release/3.11',
    pre_release_branch: 'release/3.10',
    release_version: 'v3.11.9',
    pre_release_version: 'v3.10.15',
    ocboot_release_version: 'master-v3.11.9-2',
  },

  // Set the production url of your site here
  url: 'https://www.cloudpods.org',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'yunionio', // Usually your GitHub org/user name.
  projectName: 'cloudpods', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans', 'en'],
  },

  scripts: [
    {
      src: 'https://hm.baidu.com/hm.js?3c5253cd6530122d0f774cab69e3c07f',
      async: true,
    },
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          lastVersion: 'current',
          versions: {
            current: {
              label: '3.11',
              path: '',
            },
          },
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            // 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
            'https://github.com/yunionio/website/tree/master',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/yunionio/website/tree/master', //  'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          blogTitle: 'Cloudpods blog',
          // blogDescription: 'A Docusaurus powered blog!',
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
    [
      '@docusaurus/plugin-google-gtag',
      {
        trackingID: 'G-999X9XX9XX',
        anonymizeIP: true,
      },
    ],
  ],

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        // `hashed` is recommended as long-term-cache of index file is possible.
        hashed: true,
        language: ['en', 'zh'],
        docsRouteBasePath: '/docs',
        indexBlog: true, // blog is disabled
        ignoreFiles: [/docs\/development\/changelog\/.*/],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
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
          // { to: '/docs/getting-started', label: '快速开始', position: 'left' },
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '文档',
          },
          { to: '/blog', label: '博客', position: 'left' },
          { to: 'https://www.yunion.cn/subscription/index.html', label: '服务订阅', position: 'left' },
          { to: 'https://apifox.com/apidoc/shared-f917f6a6-db9f-4d6a-bbc3-ea58c945d7fd', label: 'API', position: 'left' },
          {
            type: 'docsVersionDropdown',
            position: 'right',
            dropdownActiveClassDisabled: true,
            dropdownItemsAfter: [
              { label: '3.10', href: 'https://www.cloudpods.org/v3.10/' },
              { label: '3.9', href: 'https://v1.cloudpods.org/v3.9/' },
              // { to: '/versions', label: 'All versions' },
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
          },
        ],
      },
      // footer: {
      //   style: 'dark',
      //   // links: [
      //   //   {
      //   //     title: '文档',
      //   //     items: [
      //   //       {
      //   //         label: '快速开始',
      //   //         to: '/docs/getting-started',
      //   //       },
      //   //     ],
      //   //   },
      //   //   // {
      //   //   //   title: 'Community',
      //   //   //   items: [
      //   //   //     {
      //   //   //       label: 'Discord',
      //   //   //       href: 'https://discordapp.com/invite/docusaurus',
      //   //   //     },
      //   //   //     // {
      //   //   //     //   label: 'Stack Overflow',
      //   //   //     //   href: 'https://stackoverflow.com/questions/tagged/docusaurus',
      //   //   //     // },
      //   //   //     // {
      //   //   //     //   label: 'Twitter',
      //   //   //     //   href: 'https://twitter.com/docusaurus',
      //   //   //     // },
      //   //   //   ],
      //   //   // },
      //   //   {
      //   //     title: '更多',
      //   //     items: [
      //   //       // {
      //   //       //   label: 'Blog',
      //   //       //   to: '/blog',
      //   //       // },
      //   //       {
      //   //         label: 'GitHub',
      //   //         href: 'https://github.com/yunionio/website',
      //   //       },
      //   //     ],
      //   //   },
      //   // ],
      //   copyright: `Copyright © ${new Date().getFullYear()} The Cloudpods Authors.`,
      // },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'diff', 'go'],
      },
    }),
};

export default config;
