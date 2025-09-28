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

## 创建基于 ollama 的容器主机
### 使用 ollama 官方模型库进行创建
在[ ollama 官方模型列表](https://ollama.com/library)中选择感兴趣的模型，记住模型名称以及量化版本使用下面的命令进行创建
```shell
climc llm-create --allow-delete\
  --disk medium=rotate,size=128m,format=raw\
  --net cnet18 -p 'index=0,port=11434,host_port=20434,protocol=tcp'\
  test-llm-create-$(date +'%Y%m%d%H%M%S') 4096\
  docker.io/ollama/ollama:latest qwen2:0.5b 
```
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
对于 modelfile 参数的含义及设置方式，具体可参考[ ollama 的官方文档](https://github.com/ollama/ollama/blob/main/docs/modelfile.md)，其中的 `ADAPTER` 参数暂未支持
## 访问大模型服务
可使用下面的方法进行测试
```shell
curl http://cloudpods-ip:20435/v1/chat/completions\
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2:0.5b",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```