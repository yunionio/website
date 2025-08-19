// GitHub Star Count Script
(function() {
  'use strict';

  // 缓存star数量，避免重复请求
  let starCount = null;
  let isInitialized = false;

  // 获取GitHub star数量
  async function fetchStarCount() {
    if (starCount !== null) {
      return starCount;
    }
    
    try {
      const response = await fetch('https://api.github.com/repos/yunionio/cloudpods');
      if (response.ok) {
        const data = await response.json();
        starCount = data.stargazers_count;
        return starCount;
      }
    } catch (error) {
      console.error('Failed to fetch GitHub star count:', error);
    }
    return null;
  }

  // 创建GitHub图标
  function createGitHubIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('style', 'margin-right:5px');
    svg.style.flexShrink = '0';
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z');
    
    svg.appendChild(path);
    return svg;
  }

  // 创建star数量徽章
  function createStarBadge(count) {
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.display = 'inline-flex';
    container.style.alignItems = 'center';

    // 检测当前主题
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // 箭头边框
    const arrowBorder = document.createElement('div');
    arrowBorder.style.position = 'absolute';
    arrowBorder.style.left = '-6px';
    arrowBorder.style.top = '50%';
    arrowBorder.style.transform = 'translateY(-50%)';
    arrowBorder.style.width = '0';
    arrowBorder.style.height = '0';
    arrowBorder.style.borderTop = '6px solid transparent';
    arrowBorder.style.borderBottom = '6px solid transparent';
    arrowBorder.style.borderRight = `6px solid ${isDark ? '#21262d' : '#d0d7de'}`;
    arrowBorder.style.zIndex = '-1';

    // 箭头主体
    const arrow = document.createElement('div');
    arrow.style.position = 'absolute';
    arrow.style.left = '-5px';
    arrow.style.top = '50%';
    arrow.style.transform = 'translateY(-50%)';
    arrow.style.width = '0';
    arrow.style.height = '0';
    arrow.style.borderTop = '5px solid transparent';
    arrow.style.borderBottom = '5px solid transparent';
    arrow.style.borderRight = `5px solid ${isDark ? '#30363d' : '#f6f8fa'}`;

    // Badge主体
    const badge = document.createElement('span');
    badge.style.display = 'inline-flex';
    badge.style.alignItems = 'center';
    badge.style.padding = '1px 5px';
    badge.style.fontSize = '10px';
    badge.style.fontWeight = '500';
    badge.style.borderRadius = '5px';
    badge.style.marginLeft = '0px';
    badge.style.transition = 'all 0.2s ease';
    badge.style.backgroundColor = isDark ? '#30363d' : '#f6f8fa';
    badge.style.color = isDark ? '#c9d1d9' : '#656d76';
    badge.style.borderTop = `1px solid ${isDark ? '#21262d' : '#d0d7de'}`;
    badge.style.borderBottom = `1px solid ${isDark ? '#21262d' : '#d0d7de'}`;
    badge.style.borderRight = `1px solid ${isDark ? '#21262d' : '#d0d7de'}`;
    badge.textContent = count.toLocaleString();

    container.appendChild(arrowBorder);
    container.appendChild(arrow);
    container.appendChild(badge);

    return container;
  }

  // 处理单个GitHub链接
  function processGitHubLink(link) {
    // 检查是否已经处理过
    if (link.hasAttribute('data-github-processed')) {
      return false;
    }
    
    // 标记为已处理
    link.setAttribute('data-github-processed', 'true');

    // 清空链接内容
    link.innerHTML = '';
    
    // 设置链接样式
    link.style.display = 'flex';
    link.style.alignItems = 'center';
    link.style.gap = '4px';
    link.style.textDecoration = 'none';
    link.style.color = 'inherit';

    // 添加GitHub图标
    const icon = createGitHubIcon();
    link.appendChild(icon);

    // 如果有star数量，添加徽章
    if (starCount !== null) {
      const badge = createStarBadge(starCount);
      link.appendChild(badge);
    }
    
    return true; // 表示成功处理了链接
  }

  // 查找并处理具有特定class的GitHub链接
  function processAllGitHubLinks() {
    // 查找具有GitHubLink-custom class的链接
    const links = document.querySelectorAll('a.GitHubLink-custom');
    
    let processedCount = 0;
    links.forEach(link => {
      if (processGitHubLink(link)) {
        processedCount++;
      }
    });
    
    return processedCount;
  }

  // 等待具有特定class的GitHub链接出现
  function waitForElements() {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 50; // 最多等待5秒
      
      const check = () => {
        attempts++;
        const links = document.querySelectorAll('a.GitHubLink-custom');
        
        if (links.length > 0) {
          resolve(links);
        } else if (attempts >= maxAttempts) {
          resolve([]);
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  // 初始化函数
  async function init() {
    if (isInitialized) {
      return;
    }
    isInitialized = true;


    try {
      // 等待具有特定class的GitHub链接出现
      const links = await waitForElements();
      
      // 获取star数量
      const count = await fetchStarCount();
      
      // 处理所有GitHub链接
      processAllGitHubLinks();
      
      // 如果第一次没有找到链接，再尝试一次
      if (links.length === 0) {
        setTimeout(() => {
          // 清除处理标记并重新处理
          const links = document.querySelectorAll('a.GitHubLink-custom');
          links.forEach(link => link.removeAttribute('data-github-processed'));
          processAllGitHubLinks();
        }, 1000);
      }

    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }

  // 监听主题变化
  function observeThemeChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          // 主题变化时清除处理标记并重新处理所有链接
          const links = document.querySelectorAll('a.GitHubLink-custom');
          links.forEach(link => link.removeAttribute('data-github-processed'));
          processAllGitHubLinks();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  // 监听URL变化（SPA路由）
  function observeUrlChanges() {
    let currentUrl = window.location.href;
    
    const observer = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        
        // 延迟重新初始化，等待DOM更新
        setTimeout(() => {
          // 清除所有处理标记
          const links = document.querySelectorAll('a.GitHubLink-custom');
          links.forEach(link => link.removeAttribute('data-github-processed'));
          processAllGitHubLinks();
        }, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // 启动脚本
  function startScript() {
    init();
    observeThemeChanges();
    observeUrlChanges();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startScript);
  } else {
    startScript();
  }

  // 也监听window load事件，确保所有资源都加载完成
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (!isInitialized) {
        startScript();
      } else {
        // 清除处理标记并重新处理
        const links = document.querySelectorAll('a.GitHubLink-custom');
        links.forEach(link => link.removeAttribute('data-github-processed'));
        processAllGitHubLinks();
      }
    }, 1000);
  });

  // 定期检查具有特定class的GitHub链接（备用方案）
  const checkInterval = setInterval(() => {
    if (isInitialized) {
      const links = document.querySelectorAll('a.GitHubLink-custom');
      if (links.length > 0) {
        // 检查是否所有链接都已处理
        const allProcessed = Array.from(links).every(link => link.hasAttribute('data-github-processed'));
        if (allProcessed) {
          clearInterval(checkInterval);
        } else {
          const processedCount = processAllGitHubLinks();
          // 如果处理了链接，再次检查是否全部完成
          if (processedCount > 0) {
            const allProcessedAfter = Array.from(links).every(link => link.hasAttribute('data-github-processed'));
            if (allProcessedAfter) {
              clearInterval(checkInterval);
            }
          }
        }
      }
    }
  }, 1000);

})();
