---
title: 【转载】解决Hexo博客分页展示为HTML代码的问题
date: 2021-03-24 14:50:15
categories:
  - "blog"
tags: ["hexo"]
---

Hexo更新之后，首页的分页展示为HTML代码
<!--more-->
打开主题文件themes/你的主题/layout/_partial/pagination.ejs文件，修改代码：		
修改前：
```
<%- paginator({
    prev_text: "<i class='fa fa-angle-left'></i>",
    next_text: "<i class='fa fa-angle-right'></i>"
}) %>
```
修改后：
```
<%- paginator({
    prev_text: "<i class='fa fa-angle-left'></i>",
    next_text: "<i class='fa fa-angle-right'></i>",
    escape: false
}) %>
```
转载地址[【解决hexo博客分页展示为HTML代码的问题】](https://www.4spaces.org/hexo-paginator-html-escape/)