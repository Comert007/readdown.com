---
title: IP或Port被墙检测
date: 2021-03-26 11:12:00
categories:
  - "IP"
  - "GFW"
thumbnail: /img/vps/bwh88_home.png
---

在[《自建VPS-防火长城》]({{< relref "自建VPS-防火长城.md" >}})中我们知道，GFW可以封锁我们的IP和Port(端口)，怎么检测IP和端口是否被封锁呢？
<!--more-->
# IP检测
点击链接进入[VPS234](https://www.vps234.com/)IP检测网站
> https://www.vps234.com/ipchecker/

输入IP进行检测
```
108.61.13.174
```
![IP被封锁](/img/vps/vps234_test_ip_error.png)
![IP被正常](/img/vps/vps234_test_ip_ok.png)

如果国内`ICMP`和`TCP`都是<i class="fa fa-close" style="color:#f00"></i>，而国外是<i class="fa fa-check" style="color:#138913"></i>，就表示你的IP已经被我们的老大哥封锁了。

# 端口检测
点击链接进入端口检测网站
> http://port.ping.pe/

输入ip和端口进行检测
```
108.61.13.174:80
```
![](/img/vps/port_test_ok.png)

![](/img/vps/port_test_error.png)

# 搬瓦工自带工具检测

如果你的国外服务器是[搬瓦工](https://bwh88.net/)，那么你可以直接使用它自带的检测地址

1. 首先登录[搬瓦工](https://bwh88.net/)

![搬瓦工首页](/img/vps/bwh88_home.png)


2. 然后点击顶部`register`，没有注册过的就会去注册，已注册过的就跳转到如下位置，并登录`KiwiVM`

![搬瓦工服务](/img/vps/bwh88_services.png)

3. 登录成功之后就使用如下链接进行测试
> https://kiwivm.64clouds.com/main-exec.php?mode=blacklistcheck

![测试IP](/img/vps/bwh88_test_main_ip.png)

如果测试成功就绿色标记显示为`IP NOT BLOCKED`，失败就红色标记显示为`IP BLOCKED`，也就是说：
* <b style="color:#138913">IP NOT BLOCKED </b>= 没被封
* <b style="color:#f00">IP BLOCKED </b> = 被封

我这里是没有被封
![测试IP成功](/img/vps/bwh88_test_main_ip_ok.png)

如果被封了，那就去换IP吧，[搬瓦工](https://bwh88.net/)换IP大概有两种方式：

1. [搬瓦工每 10 周可免费更换一次被封 IP](https://www.bandwagonhost.net/1925.html)
2. [搬瓦工IP被封后，后台自助付费更换新IP教程（仅需8美元）](https://www.bandwagonhost.net/1312.html)

免费换IP的方式，没有尝试过，有那个时间的童鞋可以确认一下。付费换IP需要8美元，折合人民币50多元，其实还是有点小贵，如果喜欢瞎折腾，我建议购买可以<b style="color:#f00">免费换IP</b>的服务商。
1. [hostwinds](https://www.hostwinds.com/) - 博主当前使用，虽然有时延迟比较高，但是便宜~
2. [vultr](https://www.vultr.com/) - 大品牌，延迟低，稍贵

也可以看看其他的推荐[支持免费换IP的VPS汇总](https://zhuanlan.zhihu.com/p/161232292)