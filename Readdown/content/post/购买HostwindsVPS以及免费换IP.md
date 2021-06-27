---
title: 购买Hostwinds VPS以及免费换IP
date: 2021-3-26 15:45:13
categories:
  - "ip"
tags: ["hostwinds"]

thumbnail: /img/vps/hostwinds_linux_list.png
---

在{% post_link IP或Port被墙检测 《IP或Port被墙检测》 %}中我们介绍到，可以使用免费换IP的服务商，防止我们操作失误造成GFW对我们的封锁。这里用笔者经常使用的`Hostwinds`介绍。
<!--more-->
为什么使用Hostwinds呢？
* 首先是它可以针对国内的用户进行免费换IP
* 其次是它真的便宜，虽然延迟对比[搬瓦工](https://www.bwh88.net/)要高一点，但是能接受
* 再有就是它能够随时换IP，不需要被墙之后才能换

# 购买VPS

打开如下链接，进度Hostwind主页
> https://www.hostwinds.com/

* 点击VPS，在下拉列表中选择`Unmanaged Linux`
* 在新打开的列表中选择，选择第一个
![](/img/vps/hostwinds_linux_list.png)
* 如果没有注册或者登录过这个网站会出现登录或注册
![](/img/vps/hostwinds_linux_login.png)
* 点击登录就会配置客户端信息和产品信息
![](/img/vps/hostwinds_linux_client_info.png)
![](/img/vps/hostwinds_package_main_info.png)
![](/img/vps/hostwinds_package_optionnal_info.png)
![](/img/vps/hostwinds_package_payment_info.png)
* 点击`Complete Order`确定订单之后，就会跳转去支持
![](/img/vps/hostwinds_invoce_vps.png)
* 最后扫支付宝的二维码就行了，大概400元左右，支付完成之后就能看到购买的VPS了

# 换IP

> 注意：不能在有代理的情况下执行此操作，否则换的IP极大几率是被封锁了的

* 点击`client login`进入你购买的VPS列表
![](/img/vps/hostwinds_vps_service.png)
* 点击`Manage`管理你的VPS进入当前VPS信息界面
![](/img/vps/hostwinds_vps_manage.png)
* 点击`Click Here to Manage This Server`(管理你的VPS)进入管理详情，可以查看和修改你的ssh登录密码
![](/img/vps/hostwinds_vps_manage_detail.png)
* 点击`Manage IP's`(管理IP)，并点击`Fix ISP Block`(修复IP阻断)稍等一段时间就更换IP就完成了
![](/img/vps/hostwinds_vps_manage_ip.png)
* 最后一定要重置VPS的网络，否则可能一直处于阻断状态
![](/img/vps/hostwinds_vps_manage_network.png)

> <strong style="color: #e67e22">Notice：</strong>
> * 检测换IP是否成功，可以查看 {% post_link IP或Port被墙检测 《IP或Port被墙检测》 %}
> * 等一段时间后，如果检测结果还是无法使用，就<span style="color: #e67e22">重复换IP</span>的过程，直到成功为止