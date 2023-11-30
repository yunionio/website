---
sidebar_position: 10
---

# 常见问题

## 创建页面无任何资源

### 现象

1. 如下图所示, 创建页面无任何可选资源

![](./images/no_region.png)


### 可能的原因

- 前端缓存
    1. 可通过刷新整个页面解决
- 当前所选的域底下没有 **可用** 的云账号
    1. [创建云账号](../../../../../web_ui/multiplecloud/cloudaccount/cloudaccount) 到所选域
- 云账号健康状态异常
    1. 查看 [健康检查](../cloudaccounts/health_check)
- 没有可用套餐
    1. 同步套餐异常(一般是由于外网不通引起的)
    2. 请查看控制节点到 `https://yunionmeta.oss-cn-beijing.aliyuncs.com` 是否可以正常通信
    3. 再次同步云账号
- 没有可用的IP子网
    1. 页面默认显示的是有ip子网的平台和区域
    2. 若页面中没有想要的平台或区域，请确保要选定的平台及区域有正常的ip子网

## 查看虚拟机日志

- 如图点击结果为失败的日志

![](./images/vm_log.png)


## 创建虚拟机失败问题汇总

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem'

### 常见错误整理

<Tabs>

<TabItem value="通用" label="通用">

- iStorageCache.GetIImageById: NotFoundError
    - 此错误一般是由于镜像未能及时更新导致
    - release/3.6版本及之前版本公有云镜像依赖于云账号更新，若长时间账号未全量同步，镜像可能会和公有云不一致，需要手动全量同步云账号，或设置云账号自动同步修复
    - release/3.7及之后版本，我们会周期同步公有云镜像，并将结果即时更新至阿里云OSS中，平台每天会从阿里云OSS中获取最新镜像，不再依赖云账号同步，此设置仅对公有云公共镜像生效，若使用公有云自定义镜像，依然需要同步云账号更新镜像列表

</TabItem>


<TabItem value="阿里云" label="阿里云">

- Failed to create specification ecs.t5-c1m1.large.processCommonRequest: SDK.ServerError\nErrorCode: InvalidParameter.NotMatch\nRecommend: https://error-center.aliyun.com/status/search?Keyword=InvalidParameter.NotMatch&source=PopGw\nRequestId: BAD90CC0-D76D-589D-9701-1516A6FC3C13\nMessage: the provided 'Image -> os_type: CentOS' and 'Rule -> os_type: exclude[Ubuntu Debian Aliyun CentOS]' are not matched.
    - 此返回结果一般是由于选择的套餐和镜像冲突导致的
    - 可以选择非UEFI的镜像避免此错误的发生
    - [Github Issue](https://github.com/yunionio/cloudpods/issues/11481)

</TabItem>

<TabItem value="腾讯云" label="腾讯云">
- [TencentCloudSDKError] Code=ImageQuotaLimitExceeded, Message=FailedOperation: Failed to create image as the number of image 10 cannot exceed the quota for image 10
    - 此问题出现在使用公有云私有镜像创建机器, 每个区域最多支持10个自定义镜像，可以联系腾讯云调高每个区的配额，或者删除不再使用的私有镜像
    - 偶尔会遇见区域有9个自定义镜像，依然出现这个报错
</TabItem>

<TabItem value="Azure" label="Azure">
- Allocation failed. We do not have sufficient capacity for the requested VM size in this region. Read more about improving likelihood of allocation success at http://aka.ms/allocation-guidance\ 
    - 此问题一般出现在Azure资源不足，或者套餐在所选的region不可用
    - 请更换套餐，或者更换区域再尝试创建

</TabItem>

<TabItem value="AWS" label="AWS">
- Failed to create specification c6g.medium.Unsupported: The requested configuration is currently not supported. Please check the documentation for supported configurations
    - 当前账号不支持c6g.medium套餐，未找到原因，其他账号可能支持
    - 目前出现这个错误只能去更换套餐
</TabItem>

</Tabs>

## 通用问题汇总

- Client.Timeout exceeded while awaiting headers
- ClientError read tcp 10.40.52.146:57462->10.168.26.243:3128: i/o timeout
    - 此问题一般出现在网络环境不好，或者使用了代理
    - 请检查网络环境，或者检查代理日志，是否出现超时

- dial tcp: lookup example.com on 192.168.222.171:53: read udp 10.168.222.219:463933->192.168.222.171:53: i/o timeout
    - 此问题一般出现在DNS网络不通，不能正常解析域名
    - 请检查DNS配置，再重试操作


## 重置密码失败问题汇总

## 常见错误整理

<Tabs>

<TabItem value="ZStack" label="ZStack">

- operation error, because:qemu-agent service is not ready in vm
    - ZStack重置密码依赖于qemu-agent, 请确保虚拟机中qemu-agent是否正常运行

</TabItem>

</Tabs>
