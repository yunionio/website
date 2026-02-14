---
sidebar_position: 1
---

# 部署基于 ollama 的大模型服务
本节介绍如何在在宿主机上配置 nvidia contaienr runtime，并使用 gpu 创建一个有 ollama 服务的容器主机

## 安装显卡驱动
请自行在[ nvidia 官方](https://www.nvidia.cn/drivers/lookup/)上选择合适的闭源驱动安装并重启系统

## 配置 nvidia container runtime
```shell
#  nvidia contaienr toolkit,  https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html
$ curl -s -L https://nvidia.github.io/libnvidia-container/stable/rpm/nvidia-container-toolkit.repo | \
  sudo   
tee /etc/yum.repos.d/nvidia-container-toolkit.repo
 
 
   
$ sudo yum-config-manager --enable nvidia-container-toolkit-experimental
   
$ sudo yum install -y nvidia-container-toolkit
 
 
#  containerd runtime,  --config  containerd 
$ nvidia-ctk runtime configure --runtime=containerd --config /etc/yunion/containerd/config.toml
```
执行上诉步骤后需要手动修改 containerd runtime 切换成 nvidia
```shell
#  runc  nvidia
$ vi /etc/yunion/containerd/config.toml
default_runtime_name = "runc"
---
default_runtime_name = "nvidia"
 
 
#  yunion containerd
$ systemctl restart yunion-containerd.service
```

<!--
### 使用非官方的 GGUF 文件创建
首先在[ Hhugging Face ](https://huggingface.co/)或者[魔搭社区](https://modelscope.cn/)挑选一个合适的模型，然后使用 gguf 文件链接进行创建
```shell
climc llm-create --allow-delete\
  --disk medium=rotate,size=128m,format=raw\
  --net cnet18 -p 'index=0,port=11434,host_port=20435,protocol=tcp'\
  test-llm-create-$(date +'%Y%m%d%H%M%S') 4096\
  docker.io/ollama/ollama:latest qwen2:7b\
  --gguf "file=https://modelscope.cn/models/qwen/Qwen2-7B-Instruct-GGUF/resolve/master/qwen2-7b-instruct-q2_k.gguf,source=web"
```
若官方未提供，可尝试自行使用[ llama.cpp ](https://github.com/ggml-org/llama.cpp)将其转化为 gguf 文件，并上传到宿主机上进行模型创建
```shell
climc llm-create --allow-delete\
  --disk medium=rotate,size=128m,format=raw\
  --net cnet18 -p 'index=0,port=11434,host_port=20435,protocol=tcp'\
  test-llm-create-$(date +'%Y%m%d%H%M%S') 4096\
  docker.io/ollama/ollama:latest qwen2:0.5b\
  --gguf "file=/root/qwen2-0_5b.gguf,source=host,parameter=[temperature=0.6|stop=AI assistant:|num_ctx=2048|top_k=100]"
```
对于 modelfile 参数的含义及设置方式，具体可参考[ ollama 的官方文档](https://github.com/ollama/ollama/blob/main/docs/modelfile.md)，其中的 `ADAPTER` 参数暂未支持 -->

## 创建 Ollama 镜像
使用下面的命令创建一个 `Ollama` 镜像条目
```sh
climc llm-image-create ollama-latest <YOUR-OLLAMA-IMAGE-NAME> latest
```

## 创建 llm 模板
使用下面的命令创建一个 `llm` 的构建模板
```sh
climc llm-model-create ollama-qwen3-8b \
  1 1023 1024 ollama-latest ollama qwen3:8b \
  --devices 'GeForce RTX 4060' --port-mappings 'tcp:11434'
```

## 使用 llm 构建模板启动一个 qwen3:8b 的大模型服务
使用下面的命令创建：
```sh
climc llm-create qwen3-8b ollama-qwen3-8b
```

## 访问大模型服务
可使用下面的方法进行测试
```shell
curl http://cloudpods-ip:host-port/v1/chat/completions\
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3:8b",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```
如果部署成功会有类似下面的输出
```json
{
  "id":"chatcmpl-991",
  "object":"chat.completion",
  "created":1761122201,
  "model":"qwen3:8b",
  "system_fingerprint":"fp_ollama",
  "choices":[{
    "index":0,
    "message":{
      "role":"assistant",
      "content":"\u003cthink\u003e\nOkay, the user greeted me with \"Hello, how are you?\" I need to respond appropriately. First, I should acknowledge their greeting and express that I'm here to help. Since I'm an AI, I don't have feelings, so I should mention that I don't have emotions but can assist with various tasks. I should keep the tone friendly and open-ended to encourage them to ask questions or share what they need help with. Maybe add an emoji to keep it approachable. Let me check for any errors and make sure the response is clear and welcoming.\n\u003c/think\u003e\n\nHello! I'm just a virtual assistant, so I don't have feelings, but I'm here and ready to help you with anything you need! 😊 What can I assist you with today?"
    },
    "finish_reason":"stop"
  }],
  "usage":{
    "prompt_tokens":14,
    "completion_tokens":159,
    "total_tokens":173
  }
}
```