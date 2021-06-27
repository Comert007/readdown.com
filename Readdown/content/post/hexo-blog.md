---
title: 使用 Hexo 搭建个人博客
date: 2019-12-16 13:12:22
categories:
  - "blog"
tags: ["theme","hexo","ssl"]
thumbnail: /img/ssl/hexo-index-page.png
---

![](/img/top/hexo.jpeg)
> 作为一只程序猿，每个人都希望有一个自己的个人博客，博客自己写的话，那太麻烦了。幸好[Hexo](https://hexo.io/zh-cn/docs/index.html)提供了一个快捷生成博客的方案。

<!--more-->


注意：以下操作都在Linux系统上进行

## 本地构建Hexo

在构建Hexo之前，我们得先安装两个工具:   
* Git   
* Node.js   

Git 安装很简单，运行如下代码
```
sudo apt-get install git
```
Node.js安装复杂稍微复杂一点，可参考[Linux系统安装Nodejs
](https://www.cnblogs.com/mao2080/p/9346018.html)

这里当都已安装完成了。

### 安装Hexo  
安装了`node`就可以使用使用 npm 安装 `Hexo`

```
npm install -g hexo-cli
```
查看是否安装完成，可以使用如下代码：

```
hexo -v
```
创建一个本地文件夹，用来存放 `hexo blog`, 我这里是`StaticWeb` 
在当前文件夹下执行   

```
hexo init
npm install 
```

构建完成之后大概可以看到如下的一个目录结构：

.
├── _config.yml
├── package.json
├── scaffolds
├── source
|   ├── _drafts
|   └── _posts
└── themes

然后在`Terminal`中执行如下代码，就可以通过 `http://localhost:4000`进行访问了

```
hexo s/hexo server
```
![Hexo](/img/ssl/hexo-blog-landscape.png)

## 更换 Hexo 主题
我们发现这个主题实在是太丑了，没办法重新找一个进行更换，我这里使用的是`Melody`，如果想使用其他的主题到[Hexo主题](https://hexo.io/themes/)进行更换

* [Melody-Preview](https://molunerfinn.com/)
* [Melody-GitHub](https://github.com/Molunerfinn/hexo-theme-melody)
* [Melody-Docment](https://molunerfinn.com/hexo-theme-melody-doc/)

进入`StaticWeb`将 Melody主题克隆下来

```
git clone -b master https://github.com/Molunerfinn/hexo-theme-melody themes/melody
```
并安装`jade`和`stylus renderer` 

```
npm install hexo-renderer-jade hexo-renderer-stylus
```
最后将`StaticWeb/_config.yml`中的`theme`改成`melody`

重新执行`hexo s`就可以看到新的主题样式了
![Melody](/img/ssl/hexo-index-page.png)


## 将Hexo部署到自己服务器

这里说明一下为什么部署到自己的服务器，是因为实在是伤不起`Github`、`Coding`这些网站了，实在是运行太慢了，半天都打不开。需要准备一下如下：

* 一台服务器(系统使用的是`centOS`)
* 域名（不强求）

### 安装工具
进入我们自己的服务器，安装`Git`和`Nginx`
为什么需要这两个呢？这里简单解释一下

* Git用来构建一个简单的代码仓库
* Nginx用来代理自己搭建好的网站

```
ssh root@IP //进入自己服务器，IP为你服务器IPv4地址,回车之后输入密码即可登录
// 进入之后，安装git
yum install git-core
// 安装Nginx
yum install -y nginx
// 启动Nginx
service nginx start
```
安装完成并且启动之后，就可以通过自己的ip或者域名访问了

### 构建Git仓库与网站存储

* 创建网站目录 

```
mkdir /www/blog 
```

* 创建Git仓库 
```
mkdir /www/warehouse/hexo
cd /www/warehouse/hexo
git init --bare hexo.git
```

###  使用 Git Hooks 实现自动项目部署

```
vim /var/blog/hexo.git/hooks/post-receive
// 进入后编辑如下
#!/bin/bash
git --work-tree=/www/blog --git-dir=/www/warehouse/hexo/hexo.git checkout -f
```
`post-receive`它运行在服务端而不是用户的本地机器，它在任何开发者推送代码时运行．
关于更多关于`Git Hook`可参考[使用 Git Hooks 实现自动项目部署](http://notes.11ten.net/apps-auto-deploy-with-git.html)

* 赋予可执行权限

```
chmod +x /www/warehouse/hexo/hexo.git/hooks/post-receive
```
## 配置Nginx
```
cd /etc/nginx/
vim nginx.conf
```
* 编辑`nginx.conf`

```
server_name  www.readdown.com;
#root         /usr/share/nginx/html;
root         /var/www/hexo;
```
* 保存退出后执行如下：

```
nginx s reload
```
* 再次修改本地`StaticWeb/_config.yml`

```
url: ip或域名（http://xxx.com）
...deploy:
  type: git
  repo: root@xxx.com:/var/blog/hexo
  branch: master
```
* 最后一次运行 

```
hexo clean
hexo g
hexo deploy
```
上传完成之后，就可以成功访问了,例如[我的博客](http://readdown.com/)

## 添加证书
我们想将我们的网站`http://`变成`https://`，那就需要向我们的服务器添加SSL证书．大概添加步骤如下：

1. 先打开[阿里云](https://www.aliyun.com/)，找到产品服务-安全－SSL证书，进入[SSL证书](https://yundun.console.aliyun.com/?spm=5176.12818093.recent.dcas.488716d0SPrrSr&p=cas#/overview/cn-hangzhou)

2. 点击`购买证书`，然后进入购买页面，我们选择个人免费版，可使用一年时间
![证书购买](/img/ssl/ssl_buy.png)

3. 购买完成后需进行一个个人认证申请，等几分钟状态就会从申请中变成已签发
![证书签发](/img/ssl/ssl_sign.png)

4. 点击`下载`，就会出现如下，可下载`Apache`、`Tomcat`、`Nginx`，我们这里下载`Nginx`的证书
![证书签发](/img/ssl/ssl_down.png)

５. 配置
```nginx
# HTTPS server
  server {
  listen 443;
  server_name localhost;
  ssl on;
  ssl_certificate cert.pem;
  ssl_certificate_key cert.key;
  ssl_session_timeout 5m;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
  ssl_ciphers ALL:!ADH:!EXPORT56:RC4+RSA:+HIGH:+MEDIUM:+LOW:+SSLv2:+EXP;
  ssl_prefer_server_ciphers on;
  location / {
			}
```
6. 配置完成之后会发现，如果我们访问`http://`不会自动转成`https://`，修改如下

```nginx
server {
 listen 80;
 server_name localhost;   #将localhost修改为您证书绑定的域名，例如：www.example.com。
rewrite ^(.*)$ https://$host$1 permanent;   #将所有http请求通过rewrite重定向到https。
 location / {
index index.html index.htm;
			}
		}
```

7. 另外
如果我们直接访问可能还是访问不了，因为https运行的端口是443，但是一般服务器会启动防火墙，不会自动开启`443`端口，所有我们需要将443端口开放

```
// 将443端口加入开放列表
firewall-cmd --zone=public --add-port=443/tcp --permanent
// 重新加载，不然仍然无法访问
firewall-cmd --reload
// 查询防火墙开发端口
firewall-cmd --zone=public --list-port
```

以上就是如何搭建一个简单的博客，并对网站添加SSL证书．