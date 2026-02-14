---
sidebar_position: 2
---

# 部署 Dify LLM 开发应用平台容器主机
本节介绍如何在在宿主机上使用 `climc` 工具创建一个有 `dify` 服务的容器主机

## 创建 Dify 镜像
使用下面的命令创建一系列 `dify` 组件的镜像
```sh
climc llm-image-create postgres-15alpine <YOUR-POSTGRES-IMAGE-NAME> 15-alpine
climc llm-image-create redis-6alpine <YOUR-REDIS-IMAGE-NAME> 6-alpine
climc llm-image-create nginx-latest <YOUR-NGINX-IMAGE-NAME> latest
climc llm-image-create dify-api <YOUR-DIFY-API-IMAGE-NAME> 1.7.2
climc llm-image-create dify-plugin <YOUR-DIFY-PLUGIN-IMAGE-NAME> 0.2.0-local
climc llm-image-create dify-web <YOUR-DIFY-WEB-IMAGE-NAME> 1.7.2
climc llm-image-create dify-sandbox <YOUR-DIFY-SANDBOX-IMAGE-NAME> 0.2.12
climc llm-image-create squid-latest <YOUR-SQUID-IMAGE-NAME> latest
climc llm-image-create weaviate-19 <YOUR-WEAVIATE-IMAGE-NAME> 1.19.0
```

## 创建 Dify 构建模板
使用下面的命令创建一个 `dify` 的构建模板
```sh
climc dify-model-create dify-4c4g 4 4096 1024 \
  postgres-15alpine redis-6alpine nginx-latest\
  dify-api dify-plugin dify-web dify-sandbox\
  squid-latest weaviate-19 --port-mappings 'tcp:80'
```

## 使用 Dify 构建模板启动一个 Dify 服务
使用下面的命令创建一个 `dify` 服务
```sh
climc dify-create dify dify-4c4g
```