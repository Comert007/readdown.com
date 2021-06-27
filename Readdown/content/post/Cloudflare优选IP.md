---
title: Cloudflare优选IP
date: 2021-04-02 09:55:32
tags: ["hostwinds","cloudflare"]
categories: "IP"
thumbnail: /img/vps/vps_route_cn2gt.png
---

在自建VPS之后，我们会发现连接速度并没有那么理想，难度是我们被骗了？其实不然，实质上是我们的VPS所走的线路不是什么高端线路。现在市面上提供的线路一般有：
* 163传统骨干网 - 全程都是以202.97开头
* CN2 GT 中端线路 - 去程和回程国内线路都是202.97开头，国际则是59.43开头
* CN2 GIA 独立线路 - 全程59.43开头，表现最好最稳定
<!--more-->
![](/img/vps/vps_route_163.png)

上图为在[Hostwinds](https://www.hostwinds.com/)上购买的VPS线路，可以看到从国内到国际都是202.97开头，走的都是我们传统网络，而且线路十分复杂

![](/img/vps/vps_route_cn2gt.png)

上图为在[搬瓦工](http://bwh88.net/)上购买的CN2 GT线路VPS，只有在转到国外的时候才会切换到59.43的线路上

由于CN2 GIA 的线路稍微有点贵，所以这里就不进行演示了，有兴趣的童鞋，可以使用如下网址追踪一下
> https://tools.ipip.net/traceroute.php

这里就会出现一个问题，如果自己购买的VPS是一个走比较低端线路的VPS，初次搭建尝试后就会感觉“食之无味，弃之可惜”。

所以我们这里就需要使用我们的主角[Cloudflare](http://cloudflare.com/)代理我们的网站，然后使用优选IP进行加速。

# Cloudflare
要想使用[Cloudflare](http://cloudflare.com/)，首先我们需要知道[Cloudflare](http://cloudflare.com/)是做什么的？

[Cloudflare](http://cloudflare.com/)（NYSE：NET）是一家总部位于旧金山的美国跨国科技企业，以向客户提供基于反向代理的内容分发网络（Content Delivery Network, CDN）及分布式域名解析服务（Distributed Domain Name Server）为主要业务。

![](/img/vps/vps_cloudflare_product.png)

# Cloudflare代理

那[Cloudflare](http://cloudflare.com/)到底是怎么代理我们的VPS的呢？个人总结了如下的几点：
* 让[Cloudflare](http://cloudflare.com/)代理我们自己的站点
* 在代理我们的站点之后，会将站点的内容拉取到所有连接点附近的数据中心存储起来
* 当客户端请求相关数据时，就会路由到就近的数据中心，并从其中将代理的数据返回给客户端。

[Cloudflare](http://cloudflare.com/)代理的大概流程如下图所示
![](/img/vps/vps_cloudflare_core.png)

## 代理VPS

接下来我们就实际操作一下，怎么代理我们的VPS。需要准备如下：

* 域名一个，可在[NameSilo](https://www.namesilo.com/)购买。
* VPS一个，默认认为已经配置好了相关内容

> <strong style="color: #e67e22">Notice：</strong> <span style="color: #e67e22; font-size:16px">本站不提供搭建VPS相关脚本，可访问以下网站</span>
> * 一个专注于VPS的网站 - [【Tlanyan】](https://tlanyan.me)
> * V2ray XTLS黑科技 - [【V2xtls】](https://v2xtls.org/)
> * 波仔分享 - [【V2raySSR】](http://v2rayssr.com/)


1. 打开[Cloudflare](http://cloudflare.com/)，登录成功之后，点击添加站点
![Cloudflare首页](/img/vps/vps_cloudflare_home.png)

2. 输入域名并确认添加站点
![确认添加站点](/img/vps/vps_cloudflare_add_site.png)

3. 选择添加计划并继续
![选择添加计划](/img/vps/vps_cloudflare_add_plan.png)

4. 添加代理的ip记录值，将小云朵点亮之后并继续
![添加代理记录](/img/vps/vps_cloudflare_record.png)
[Cloudflare](http://cloudflare.com/)

5. 会提供如下的DNS地址，需要到购买域名的机构将DNS进行替换，这里壹[NameSilo](https://www.namesilo.com/)为例
![DNS地址](/img/vps/vps_cloudflare_change_dns.png)

6. 打开[NameSilo]()登录，并点击'My Acount'
![NameSilo](/img/vps/vps_cloudflare_namesilo.png)

7. 点击`Manage My Domains`去管理我的DNS
![NameSilo Acount](/img/vps/vps_namesilo_account.png)

8. 进入之后点击需要修改域名之后的重叠的银色椭圆
![管理域名DNS](/img/vps/vps_namesilo_dns.png)

9. 进入之后替换前连个`DNS Server`，将第三个直接删除，最后点击`SUBMIT`提交
![替换DNS Server](/img/vps/vps_namesilo_change_dns.png)

10. 静候一段时间（大概一个小时左右），当Cloudflare主页呈现以下情况的时候，就说明代理成功
![Cloudflare Site](/img/vps/vps_cloudflare_site.png)

# 优选IP

接下来就是根据当前自己的网段，从Cloudflare的海量IP中优选出最适合自己的。
1. 优选IP程序下载
> https://github.com/badafans/better-cloudflare-ip/releases

2. 双击`CF优选IP`并打开
![CF优选](/img/vps/vps_cloudflare_better_ip.png)

3. 设置你期望达到的带宽大小，我这里填写的是`50`，然后等一段时间，就可以根据你的网络优选出适合的IP

> 切记不要开代理

![优选结果](/img/vps/vps_cloudflare_better_result.png)

4. 出现上图状态，就说明优选成功，将当前优选IP替换到V2Ray系列工具的Address里，这里使用的是V2rayN。
![V2rayN使用优选IP](/img/vps/vps_cloudflare_better_v2rayn.png)

5. 然后就可以愉快的玩耍，对于走163骨干线的来说，速度还是提升了很多的！
![Youtube速度测试](/img/vps/vps_cloudflare_youtube_speed.png)