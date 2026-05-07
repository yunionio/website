---
sidebar_position: 1
description: Cloudpods AI Cloud LLM 服务提供私有化大语言模型部署、管理和应用开发能力
---

# LLM 服务

## 概述

Cloudpods AI Cloud LLM 服务是一个完整的私有化大语言模型（LLM）管理平台，支持在私有云环境中快速部署、管理和使用各种开源大语言模型。该服务提供了从模型部署到应用开发的全链路支持，包括即时模型（Instant Model）管理、LLM 实例生命周期管理、Dify 知识库平台集成以及 MCP（Model Context Protocol）Agent 等功能。

### 核心特性

- **多模型支持**：支持 Ollama、vLLM 等多种 LLM 运行框架
- **即时模型管理**：提供预置模型镜像，实现秒级模型部署
- **Dify 集成**：内置 Dify 知识库和 AI 工作流平台
- **MCP Agent**：支持 Model Context Protocol，实现 AI 智能体与云平台的无缝交互

## 核心功能详解

### 1. LLM 实例管理

LLM 实例是运行大语言模型服务的容器化实例，支持以下关键特性：

#### 1.1 SKU 规格

| 规格类型 | CPU | 内存 | GPU | 适用场景 |
|---------|-----|------|-----|---------|
| 基础型 | 4核 | 16GB | - | 小型模型（< 7B） |
| 标准型 | 8核 | 32GB | 1卡 | 中型模型（7B-13B） |
| 高性能型 | 16核 | 64GB | 2卡 | 大型模型（13B-70B） |

#### 1.2 实例生命周期

```
创建中 (creating) → 就绪 (ready) → 运行中 (running) → 停止 (stop)
                           ↓
                     创建失败 (create_fail)
```

#### 1.3 模型挂载

支持三种模型部署方式：

1. **在线拉取**：从 Ollama 官方仓库动态拉取模型
2. **预置挂载**：挂载已缓存的即时模型镜像
3. **本地导入**：上传 GGUF 格式模型文件

### 2. 即时模型（Instant Model）

即时模型是预先打包好的模型镜像，可以实现秒级部署：

#### 2.1 模型导入流程

```
模型下载 → 打包为 TGZ → 上传镜像 → 创建即时模型记录 → 启用
```

#### 2.2 支持的模型格式

- **Ollama 格式**：通过 Ollama Registry 导入
- **GGUF 格式**：直接从 HuggingFace 等源导入

#### 2.3 GPU 显存估算

系统自动根据模型大小估算所需 GPU 显存：

```
显存需求 = 模型文件大小 × 1.15 + 500MB（框架开销）
```

### 3. Dify 集成

Dify 是一个开源的 LLM 应用开发平台，Cloudpods 提供了完整的一键部署能力：

#### 3.1 Dify 服务组件

| 组件 | 说明 |
|-----|------|
| API | 后端 API 服务 |
| Worker | 异步任务处理 |
| Worker Beat | 定时任务调度 |
| Web | 前端 Web 界面 |
| Nginx | 反向代理 |
| PostgreSQL | 主数据库 |
| Redis | 缓存服务 |
| Weaviate | 向量数据库 |
| Sandbox | 代码执行沙箱 |
| SSRF Proxy | 安全代理 |
| Plugin Daemon | 插件服务 |

#### 3.2 部署规格

支持根据业务规模选择不同的部署规格，自动配置各组件资源。

### 4. MCP Agent

MCP（Model Context Protocol）Agent 允许 LLM 通过标准化协议调用外部工具和 API：

#### 4.1 工作流程

```
用户请求 → LLM 思考 → 工具调用决策 → 执行工具 → 结果汇总 → 流式输出
```

#### 4.2 两阶段处理

1. **思考阶段**：非流式调用，决定需要使用的工具
2. **输出阶段**：流式调用，输出最终答案

#### 4.3 工具集成

内置云平台管理工具：

- 虚拟机生命周期管理（创建、启动、停止、删除）
- 资源查询（虚拟机、镜像、网络、存储）
- 监控信息获取
- 密码重置等运维操作

## 使用指南

### 环境准备

确保已部署 Cloudpods 平台，并启用 LLM 服务模块。

### CLI 命令参考

#### LLM 实例管理

```bash
# 列出所有 LLM 实例
climc llm-list

# 创建 LLM 实例
climc llm-create --name my-llm --llm-sku standard --llm-image ollama:latest

# 启动实例
climc llm-start my-llm

# 停止实例
climc llm-stop my-llm

# 查看实例详情
climc llm-show my-llm

# 删除实例
climc llm-delete my-llm

# 同步状态
climc llm-syncstatus my-llm
```

#### 即时模型管理

```bash
# 列出所有即时模型
climc instant-app-list

# 导入模型（从 Ollama）
climc instant-app-import --model-name qwen3 --model-tag 8b --llm-type ollama

# 启用模型
climc instant-app-enable <model-id>

# 禁用模型
climc instant-app-disable <model-id>

# 设置自动缓存
climc instant-app-enable-auto-cache --auto-cache true <model-id>

# 查看模型详情
climc instant-app-show <model-id>
```

#### 模型快速部署

```bash
# 快速安装模型到 LLM 实例
climc llm-install-models --models '[{"id":"model-xxx","display_name":"Qwen-7B","tag":"7b"}]' my-llm

# 卸载模型
climc llm-uninstall-models --models '[{"id":"model-xxx"}]' my-llm

# 重新安装模型
climc llm-reinstall-models --models '[{"id":"model-xxx"}]' my-llm
```

#### Dify 管理

```bash
# 列出 Dify 实例
climc dify-list

# 创建 Dify 实例
climc dify-create --name my-dify --dify-sku standard

# 启动 Dify
climc dify-start my-dify

# 停止 Dify
climc dify-stop my-dify

# 删除 Dify
climc dify-delete my-dify
```

#### MCP Agent 管理

```bash
# 创建 MCP Agent（关联 LLM 实例）
climc mcp-agent-create --name my-agent --llm-id <llm-id> --model qwen3:8b --llm-driver ollama

# 创建 MCP Agent（自定义端点）
climc mcp-agent-create --name my-agent --llm-url http://llm-api:11434 --model qwen3:8b --llm-driver ollama

# 使用 OpenAI 驱动
climc mcp-agent-create --name my-openai-agent --llm-url https://api.openai.com --model gpt-4 --llm-driver openai --api-key <key>

# 对话测试（流式）
climc mcp-agent-chat-stream --message "列出所有虚拟机" my-agent

# 查看 MCP 工具列表
climc mcp-agent-mcp-tools my-agent

# 调用特定工具测试
climc mcp-agent-tool-request --tool-name list_servers --arguments '{}' my-agent
```

### API 参考

#### LLM 实例 API

**创建实例**

```http
POST /llms
Content-Type: application/json

{
  "name": "my-llm",
  "llm_sku_id": "<sku-id>",
  "llm_image_id": "<image-id>",
  "auto_start": true
}
```

**快速模型操作**

```http
POST /llms/{id}/install-models
Content-Type: application/json

{
  "models": [
    {
      "id": "model-xxx",
      "display_name": "Qwen-7B",
      "tag": "7b",
      "llm_type": "ollama"
    }
  ],
  "method": "install"
}
```

#### 即时模型 API

**导入模型**

```http
POST /instant_models/import
Content-Type: application/json

{
  "model_name": "qwen3",
  "model_tag": "8b",
  "llm_type": "ollama"
}
```

#### MCP Agent API

**流式对话**

```http
POST /mcp_agents/{id}/chat-stream
Content-Type: application/json

{
  "message": "列出所有虚拟机",
  "history": [
    {"role": "user", "content": "你好"},
    {"role": "assistant", "content": "您好！有什么可以帮助您？"}
  ]
}
```

**响应格式**

```
data: 正在查询虚拟机列表...

data: 找到 5 台虚拟机

data: 1. vm-xxx (运行中)

data: 2. vm-yyy (已停止)
```

## 最佳实践

### 1. 模型选择建议

| 场景 | 推荐模型 | 规格 | 显存需求 |
|-----|---------|------|---------|
| 文本生成 | Qwen3-8B | 基础型 | 10GB |
| 代码辅助 | DeepSeek-Coder-7B | 标准型 | 12GB |
| 多轮对话 | Qwen3-14B | 高性能型 | 20GB |
| RAG 应用 | Qwen3-8B + Dify | 标准型 | 10GB + 向量库 |

### 2. 生产环境部署

1. **高可用配置**
   - 使用多副本部署 LLM 实例
   - 配置负载均衡
   - 启用持久化存储

2. **资源规划**
   - 预留 20% 的 GPU 显存缓冲
   - 配置自动扩缩容策略
   - 监控 GPU 利用率

3. **模型缓存策略**
   - 常用模型启用自动缓存
   - 定期清理不用的模型缓存
   - 多节点预缓存热门模型

### 3. Dify 生产部署

1. **数据库优化**
   - 使用外部 PostgreSQL 集群
   - 配置 Redis 哨兵模式
   - 独立部署 Weaviate 向量库

2. **安全加固**
   - 启用 HTTPS 访问
   - 配置访问控制策略
   - 定期备份知识库数据

### 4. MCP Agent 优化

1. **历史记录管理**
   - 限制历史消息长度（默认用户 4000 字符，助手 8000 字符）
   - 定期清理过期会话

2. **超时配置**
   - 默认 MCP Agent 超时：10 分钟
   - 根据网络环境调整

## 故障排查

### 常见问题

#### 1. LLM 实例创建失败

**症状**：实例状态显示 `create_fail`

**排查步骤**：

1. 检查 SKU 和镜像是否存在
   ```bash
   climc llm-sku-list
   climc llm-image-list
   ```

2. 查看计算节点资源是否充足
   ```bash
   climc host-list --zone <zone>
   ```

3. 检查网络配置
   - 确认 VPC 和子网配置正确
   - 检查安全组规则

4. 查看详细日志
   ```bash
   climc log-show <task-id>
   ```

#### 2. 模型拉取失败

**症状**：无法从 Ollama 仓库拉取模型

**排查步骤**：

1. 检查网络连通性
   ```bash
   # 进入 LLM 容器
   climc server-ssh <server-id>
   curl -I https://registry.ollama.ai
   ```

2. 检查磁盘空间
   ```bash
   df -h /var/lib/ollama
   ```

3. 手动拉取测试
   ```bash
   ollama pull qwen3:8b
   ```

#### 3. 即时模型无法启用

**症状**：模型状态不是 `active`

**排查步骤**：

1. 检查镜像状态
   ```bash
   climc image-show <image-id>
   ```

2. 同步镜像状态
   ```bash
   climc instant-app-syncstatus <model-id>
   ```

3. 确认镜像已缓存到计算节点
   ```bash
   climc storagecachedimage-list --cachedimage-id <image-id>
   ```

#### 4. Dify 服务启动失败

**症状**：Dify 实例无法启动或部分组件异常

**排查步骤**：

1. 检查各容器状态
   ```bash
   climc server-containers-show <server-id>
   ```

2. 查看容器日志
   ```bash
   climc server-container-logs <server-id> <container-name>
   ```

3. 检查依赖服务
   - PostgreSQL 连接
   - Redis 连接
   - Weaviate 连接

#### 5. MCP Agent 工具调用失败

**症状**：Agent 无法调用工具或返回错误

**排查步骤**：

1. 检查 MCP Server 配置
   ```bash
   climc mcp-agent-show <agent-id>
   ```

2. 测试工具列表获取
   ```bash
   climc mcp-agent-mcp-tools <agent-id>
   ```

3. 检查 LLM 连接
   ```bash
   curl <llm-url>/api/tags
   ```

4. 查看 API Key 配置（OpenAI 驱动）

#### 6. GPU 调度失败

**症状**：实例创建时提示 GPU 资源不足

**排查步骤**：

1. 检查 GPU 节点状态
   ```bash
   climc host-list --gpus > 0
   ```

2. 查看 GPU 使用情况
   ```bash
   climc isolated-device-list --host <host-id>
   ```

3. 确认驱动和运行时
   ```bash
   nvidia-smi
   ```

### 日志收集

收集 LLM 服务相关日志：

```bash
# LLM 服务日志
kubectl logs -n onecloud deployment/llm-service

# 任务日志
climc task-show <task-id>

# 操作审计日志
climc log-list --type llm
```

### 性能调优

#### GPU 显存优化

1. **量化部署**
   - 使用 INT8/INT4 量化模型
   - 启用 Ollama 的量化选项

2. **上下文长度调整**
   - 根据实际需求调整 max_tokens
   - 合理设置 context window

3. **批处理优化**
   - 调整并发请求数
   - 启用请求合并

#### 网络优化

1. **镜像加速**
   - 配置私有镜像仓库
   - 使用镜像缓存节点

2. **模型缓存预热**
   ```bash
   # 批量缓存模型到节点
   climc storagecachedimage-cache --image-id <image-id> --host-type container
   ```

## 版本兼容性

| Cloudpods 版本 | LLM 服务版本 | 特性支持 |
|---------------|-------------|---------|
| v3.11+ | v1.0 | 基础 LLM 管理 |
| v3.12+ | v1.1 | 即时模型、Dify |
| v3.13+ | v1.2 | MCP Agent |

## 参考资源

- [Ollama 官方文档](https://github.com/ollama/ollama)
- [Dify.AI 文档](https://docs.dify.ai/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Cloudpods API 文档](https://docs.cloudpods.io/)
