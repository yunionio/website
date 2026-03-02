# LLM 服务

Cloudpods LLM 服务为企业提供了私有化部署大语言模型（LLM）的完整解决方案，支持快速部署、弹性扩缩容、多模型管理和应用编排等功能。

## 概述

Cloudpods LLM 服务基于容器技术构建，提供以下核心能力：

- **即时模型（Instant Model）**：一键部署和运行开源大语言模型
- **容器化部署**：基于 Pod 和容器的轻量级 LLM 运行环境
- **Dify 集成**：内置 Dify LLM 应用开发平台，快速构建 AI 应用
- **模型生命周期管理**：完整的模型导入、缓存、部署和监控能力
- **资源隔离**：支持多租户环境下的资源配额和隔离

## 核心功能

### 1. 即时模型管理

**即时模型（Instant Model）**是 Cloudpods LLM 服务的核心功能，允许用户快速导入和部署开源大语言模型。

#### 功能亮点

- **模型导入**：支持从 Ollama Registry 等主流模型仓库自动拉取模型
- **智能缓存**：模型镜像支持自动缓存到存储节点，加速后续部署
- **显存预估**：自动计算模型所需的 GPU 显存（VRAM），包含权重、KV Cache 和框架开销
- **挂载点管理**：灵活的模型挂载路径配置，支持多种 LLM 运行时

#### 支持的 LLM 运行时

| 运行时 | 描述 | 适用场景 |
|--------|------|----------|
| Ollama | 本地运行大模型的利器 | 快速原型、开发测试 |
| VLLM | 高吞吐 LLM 推理引擎 | 生产环境、高并发 |
| llama.cpp | 纯 C/C++ 实现的 LLM 推理 | 资源受限环境 |

### 2. LLM 实例管理

LLM 实例是运行大语言模型的容器化环境，提供完整的生命周期管理。

#### 功能特性

- **规格模板（SKU）**：预定义的 CPU、内存、GPU 资源配置模板
- **网络配置**：支持 VPC 网络和自动分配 IP
- **存储卷**：持久化存储支持，数据不随实例重启丢失
- **弹性扩缩容**：根据负载自动调整实例规模

#### 实例状态

| 状态 | 描述 |
|------|------|
| `creating` | 正在创建实例 |
| `running` | 实例运行中 |
| `stopped` | 实例已停止 |
| `unknown` | 状态未知 |
| `create_fail` | 创建失败 |

### 3. Dify 集成

Cloudpods 内置 Dify 集成，支持一键部署 Dify LLM 应用开发平台。

#### Dify 组件

Dify 采用多容器微服务架构，包含以下组件：

| 组件 | 功能 |
|------|------|
| **Postgres** | 数据持久化存储 |
| **Redis** | 缓存和消息队列 |
| **API** | 后端 API 服务 |
| **Worker** | 异步任务处理 |
| **Worker Beat** | 定时任务调度 |
| **Plugin** | 插件服务 |
| **Sandbox** | 代码执行沙箱 |
| **SSRF Proxy** | SSRF 防护代理 |
| **Web** | 前端界面 |
| **Nginx** | 反向代理 |
| **Weaviate** | 向量数据库 |

#### 应用场景

- 快速构建基于私有模型的 Chatbot
- 开发 RAG（检索增强生成）应用
- 构建 AI Workflow 和 Agent
- 多模型对比和评测

### 4. MCP Agent 支持

Cloudpods LLM 服务支持 MCP（Model Context Protocol）Agent，允许 LLM 与外部工具和服务交互。

## 架构设计

### 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Cloudpods LLM Service                  │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│   LLM API   │ Dify API    │ Model API   │  MCP API          │
├─────────────┴─────────────┴─────────────┴───────────────────┤
│                    LLM Controller                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ LLM Manager  │  │ Model Manager│  │ Dify Manager     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    Container Runtime                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │     Pod      │  │   Container  │  │   Volume         │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 数据流

1. **模型导入流程**
   ```
   用户请求 -> 创建临时模型 -> 从 Registry 下载 -> 
   打包为镜像 -> 上传镜像仓库 -> 更新模型状态
   ```

2. **实例部署流程**
   ```
   创建 LLM 实例 -> 选择 SKU 和镜像 -> 创建 Pod -> 
   拉取模型镜像 -> 启动容器 -> 暴露服务端点
   ```

## 使用指南

### 前提条件

- Cloudpods 平台已部署且版本 >= v3.11
- 已配置容器运行环境
- 具备 GPU 节点（用于运行大模型）

### 导入模型

```bash
# 导入 Ollama 模型
climc instant-model-import --model-name qwen2.5 --model-tag 7b --llm-type ollama

# 查看导入状态
climc instant-model-list
```

### 创建 LLM 实例

```bash
# 创建 LLM 实例
climc llm-create --name my-llm --sku llm-4c8g1v100 \
  --llm-image-id <image-id> --net <network-id>

# 启动实例
climc llm-perform-start <llm-id>

# 查看实例详情
climc llm-show <llm-id>
```

### 部署 Dify

```bash
# 创建 Dify 实例
climc dify-create --name my-dify --sku dify-standard \
  --net <network-id>

# 查看 Dify 访问地址
climc dify-show <dify-id>
```

## API 参考

### LLM API

| API | 方法 | 描述 |
|-----|------|------|
| `/llms` | GET | 列出所有 LLM 实例 |
| `/llms` | POST | 创建 LLM 实例 |
| `/llms/{id}` | GET | 获取实例详情 |
| `/llms/{id}` | DELETE | 删除实例 |
| `/llms/{id}/start` | POST | 启动实例 |
| `/llms/{id}/stop` | POST | 停止实例 |
| `/llms/{id}/sync-status` | POST | 同步状态 |

### Instant Model API

| API | 方法 | 描述 |
|-----|------|------|
| `/instant-models` | GET | 列出所有模型 |
| `/instant-models` | POST | 创建模型记录 |
| `/instant-models/{id}/import` | POST | 导入模型 |
| `/instant-models/{id}/enable` | POST | 启用模型 |
| `/instant-models/{id}/disable` | POST | 禁用模型 |

### Dify API

| API | 方法 | 描述 |
|-----|------|------|
| `/difies` | GET | 列出所有 Dify 实例 |
| `/difies` | POST | 创建 Dify 实例 |
| `/difies/{id}/start` | POST | 启动 Dify |
| `/difies/{id}/stop` | POST | 停止 Dify |

## 最佳实践

### 1. 模型选择

根据业务场景选择合适的模型：

| 场景 | 推荐模型 | 显存需求 |
|------|----------|----------|
| 通用对话 | Qwen-7B | ~10GB |
| 代码生成 | CodeLlama-13B | ~20GB |
| 长文本处理 | Qwen-72B | ~80GB |
| 多模态 | LLaVA | ~15GB |

### 2. 资源配置

根据模型大小和并发需求选择 SKU：

| SKU 规格 | CPU | 内存 | GPU | 适用模型 |
|----------|-----|------|-----|----------|
| llm-4c8g | 4核 | 8GB | - | 7B 以下量化模型 |
| llm-8c16g1v100 | 8核 | 16GB | 1x V100 | 13B 模型 |
| llm-16c32g1a100 | 16核 | 32GB | 1x A100 | 70B 模型 |

### 3. 网络规划

- 为 LLM 实例分配独立的 VPC 子网
- 配置安全组规则限制访问来源
- 使用负载均衡暴露服务入口

### 4. 监控告警

建议配置的监控指标：

- GPU 显存使用率
- 推理延迟（Latency）
- 请求吞吐量（Throughput）
- 实例健康状态

## 故障排查

### 常见问题

#### 1. 模型导入失败

**现象**：模型导入任务失败，状态显示为 `killed`

**排查步骤**：
1. 检查镜像仓库存储空间
2. 查看下载网络连接状态
3. 检查模型文件完整性

**解决方案**：
```bash
# 重新导入模型
climc instant-model-perform-syncstatus <model-id>
```

#### 2. 实例启动失败

**现象**：实例创建成功但无法启动

**排查步骤**：
1. 检查容器运行时状态
2. 查看 Pod 事件日志
3. 确认镜像已缓存到节点

**解决方案**：
```bash
# 查看实例日志
climc llm-show <llm-id> | grep -i error

# 重启实例
climc llm-perform-stop <llm-id>
climc llm-perform-start <llm-id>
```

#### 3. 模型响应慢

**现象**：模型推理延迟高

**排查步骤**：
1. 检查 GPU 利用率
2. 查看并发请求数
3. 确认模型是否使用了 GPU

**解决方案**：
- 升级到更高配置的 SKU
- 启用模型量化（Quantization）
- 调整批处理大小

## 相关文档

- [容器服务文档](./container.md)
- [镜像管理文档](./image.md)
- [网络配置文档](../network/vpc.md)
- [Dify 官方文档](https://docs.dify.ai/)

## 更新日志

### v3.11

- 新增 LLM 服务模块
- 支持 Ollama 和 VLLM 运行时
- 集成 Dify 应用平台
- 支持 MCP Agent

### v3.12

- 优化模型导入流程
- 增强 GPU 显存预估算法
- 新增模型自动缓存功能
- 支持更多模型格式
