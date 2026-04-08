---
title: "用 Cloudpods 批量运行 OpenClaw 小龙虾：一台服务器，一群龙虾"
description: "介绍如何使用 Cloudpods AI 云平台批量部署 OpenClaw 智能体助手，零 GPU 即可上手，支持 QQ、飞书、Telegram 等多渠道接入"
authors:
  - name: Zexi Li
    url: https://github.com/zexi
    image_url: https://github.com/zexi.png
tags: [AI, OpenClaw, Cloudpods, LLM]
---

# 用 Cloudpods 搭建 OpenClaw 龙虾农场：一台服务器，一群龙虾

## 为什么需要"批量"运行小龙虾？

[OpenClaw（小龙虾）](https://docs.openclaw.ai/)是一个开源自托管的个人智能体助手，能接入 QQ、飞书、Telegram、Discord 等主流 IM，在日常聊天窗口里调用 AI 能力，辅助完成文档总结、信息查询等任务。

OpenClaw 作为 AI 智能体，具备调用浏览器、执行命令、读写文件等能力，直接在本地电脑上运行缺少隔离的沙箱环境，存在一定的安全隐患。在服务器上直接运行则需要手动安装配置环境，如果团队里多个人都想用，逐个搭建和维护的成本也不低。

[Cloudpods](https://github.com/yunionio/cloudpods) AI 云正是为了解决这些问题：**每个 OpenClaw 实例运行在独立的容器中，天然具备沙箱隔离；同时通过平台统一管理，把"部署一只小龙虾"变成"批量开通一群小龙虾"。**

<!--truncate-->

## Cloudpods + OpenClaw 的架构

```
+----------------------------------------------------------+
|                  Cloudpods AI 云控制台                      |
|                                                          |
|  +------------+   +------------+   +------------+        |
|  |  OpenClaw  |   |  OpenClaw  |   |  OpenClaw  |  ...   |
|  |  实例 #1   |   |  实例 #2   |   |  实例 #N   |        |
|  +------+-----+   +------+-----+   +------+-----+        |
|         |                |                |               |
|         v                v                v               |
|    Moonshot / 智谱 / MiniMax 等在线模型 API               |
|    - - - - - - - - - - - - - - - - - - - - -              |
|    也可接入本地 Ollama 推理实例（需 GPU）                  |
|                                                          |
|    容器主机: containerd + SDN 网络 + 持久存储              |
+----------------------------------------------------------+
```

核心思路：

- **OpenClaw 实例不需要 GPU**，纯 CPU 即可运行，资源占用低。它负责 IM 渠道对接、对话管理、工具调用。
- **模型能力来自在线 API**：配置一个 Moonshot 的 API Key，所有实例即刻拥有大模型能力，无需 GPU 投入。
- **Cloudpods 容器主机**负责底层调度——网络、存储、隔离，统一管理。

也就是说，不需要 GPU 服务器，一台普通的 x86 服务器加上一个在线模型的 API Key，就可以为整个团队批量开通 AI 助手。

## 怎么用？

整体分两步：先部署 Cloudpods AI 云平台，再在平台上创建 OpenClaw 实例。

### 1. 部署 Cloudpods AI 云

参考[AI 云部署文档](https://www.cloudpods.org/docs/aicloud/getting-started)完成部署。部署完成后即可访问 Cloudpods 控制台，进入 **人工智能** 模块开始使用。

### 2. 创建 OpenClaw 实例

在控制台里创建 OpenClaw 实例，配上模型供应商（月之暗面、智谱、MiniMax 等）的 API Key 和聊天渠道（QQ、飞书、Telegram、Discord 等）认证信息，点击创建即可。**假设要为团队 20 个人开通，创建 20 个实例即可，每个实例独立隔离、独立 IP、互不干扰。**

详细的操作步骤参考：[OpenClaw 快速开始文档](https://www.cloudpods.org/docs/aicloud/guides/llm-app/openclaw)

## OpenClaw 容器内置 XFCE 桌面 + 浏览器

Cloudpods 预置的 OpenClaw 容器镜像集成了 **XFCE 轻量桌面环境**和 **Chromium 浏览器**的完整图形化工作空间：

- **可视化调试**：直接在浏览器打开远程图形桌面查看日志、修改配置，不需要 SSH 到服务器再进入容器执行命令，降低了使用门槛。
- **内置浏览器供 AI 调用**：每个龙虾实例自带 Chromium 浏览器，OpenClaw 可以直接调用浏览器完成网页搜索、信息抓取、页面操作等任务，让智能体真正具备"上网"能力，而不只是纯文本对话。
- **独立隔离的工作空间**：每个龙虾实例是一个完整的 Ubuntu 桌面和独立的 workspace，内部的操作不会影响其他实例和宿主机。

## 对比自建 Docker 部署

| 维度 | 自建 Docker | Cloudpods AI 云 |
|------|------------|----------------|
| 批量部署 | 手写脚本，逐台 SSH | 控制台点选，秒级创建 |
| 网络隔离 | 手动配 iptables / 端口映射 | SDN 网络自动分配独立 IP 和端口映射 |
| 多实例管理 | 散落各服务器，无统一视图 | 统一控制台，全生命周期管理 |
| 监控日志 | 需要自建监控体系 | 内置监控 + 日志查询 |
| 资源调度 | 手动选择机器 | 自动调度到合适的宿主机 |
| 存储持久化 | 手动挂载目录 | 云硬盘自动挂载管理，支持弹性扩容 |

简单来说：**Docker 解决了"跑起来"的问题，Cloudpods 解决了"管起来"的问题。** 一两个实例时差别不大，但当实例数量达到 10 个、50 个、100 个时，统一管理的价值就体现出来了。

## 几个实用的搭配方案

### 1. 零 GPU 方案：在线 API + OpenClaw

最轻量的方案。一台普通服务器部署 Cloudpods，批量开通 OpenClaw 实例，模型全走 Moonshot / 智谱 / MiniMax 的在线 API。**无需 GPU 投入，按调用量付费**，适合快速试用或中小团队。

### 2. 私有化方案：Ollama + OpenClaw

如果对数据安全有要求，不希望对话内容经过外部 API，可以在 Cloudpods 上额外部署 Ollama 推理实例。Ollama 是平台内置支持的轻量本地推理服务，在 GPU 服务器上创建后，拉取 Qwen3、DeepSeek 等开源模型，再将 OpenClaw 的模型供应商指向 Ollama 的内网地址即可。全链路数据不出内网，适合金融、政务等对合规要求较高的场景。

### 3. AI 全家桶：OpenClaw + Dify + ComfyUI

在同一个 Cloudpods 平台上可以同时运行多种 AI 应用：
- **OpenClaw**：日常聊天 AI 助手（不需要 GPU）
- **Dify**：构建 RAG 知识库、工作流编排（不需要 GPU）
- **ComfyUI**：AI 图像生成（需要 GPU）

三者可以共享同一个 Ollama 推理后端，一套基础设施支撑多种 AI 场景。

## Cloudpods 容器主机的底层优势

Cloudpods 4.0 引入了自研容器主机，与 Kubernetes 的设计目标不同，它专门面向**有状态单机工作负载**：

- **有状态容器**：固定 IP、持久存储、Overlay 持久化，重启不丢数据
- **原生 GPU 透传**：支持 NVIDIA GPU，以及 NVIDIA MPS 共享
- **NUMA 感知调度**：自动均衡 CPU 和内存的 NUMA 亲和性，充分利用硬件性能
- **轻量高效**：基于 containerd，不依赖 Docker 和 Kubernetes

这些特性让 AI 应用的交付从繁琐的环境搭建，变成了"选模板、点创建、开始用"的简单体验。

## 相关链接

- **Cloudpods 开源仓库**：[github.com/yunionio/cloudpods](https://github.com/yunionio/cloudpods)
- **AI 云部署文档**：[Cloudpods AI 云快速开始](https://www.cloudpods.org/docs/aicloud/getting-started)
- **OpenClaw 快速开始**：[OpenClaw 使用指南](https://www.cloudpods.org/docs/aicloud/guides/llm-app/openclaw)
