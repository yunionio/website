---
sidebar_position: 2
---

# 部署 Dify LLM 开发应用平台容器主机
使用下面的命令进行创建，注意磁盘需要进行格式化，最好是测试过的 `ext4`，否则容器无法挂载。
对于提供的镜像仓库，至少需要有以下镜像：`postgres:15-alpine`, `redis:6-alpine`, `nginx:latest`, `langgenius/dify-api:1.7.2`, `langgenius/dify-plugin-daemon:0.2.0-local`, `langgenius/dify-web:1.7.2`, `langgenius/dify-sandbox:0.2.12`, `ubuntu/squid:latest`, `semitechnologies/weaviate:1.19.0`，否则无法完成创建。
```shell
climc dify-create --allow-delete\
  --disk medium=rotate,size=3g,format=raw,fs=ext4\
  --net cnet20 -p 'index=0,port=80,host_port=20301,protocol=tcp'\
  test-dify-create-$(date +'%Y%m%d%H%M%S') 4096 docker.io
```
支持对 dify 容器的环境变量进行修改从而实现个性化配置，所有的可配置选项可以参考[ .env.example 文件](https://github.com/langgenius/dify/blob/main/docker/.env.example)，在 api 请求中的格式为:
```json
{
    "customized_envs": [
        {
            "key": "APP_WEB_URL",
            "value": "http://cloudpods.ip:20301"
        },
        {
            "key": "SERVICE_API_URL",
            "value": "http://cloudpods.ip:20301"
        }
    ]
}
```