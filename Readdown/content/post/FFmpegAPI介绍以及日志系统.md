---
title: FFmpegAPI介绍以及日志系统
date: 2021-04-05 20:08:01
categories:
  - "ffmpeg"
tags: ["ffmpeg","log"]
thumbnail: /img/ffmpeg/ffmpeg-log.png
---

> 音视频的文章已经断更很久了，在这里说声抱歉。

不论是Android，还是现在国内很火的`HarmonyOS-鸿蒙系统`，其实都不能脱离音视频的范畴，`鸿蒙`也实现了对`FFmpeg`、`openGL`等音视频组件的支持。所以对于APP的开发人员，如果想深造的话，音视频不失为一条光明大道。

<!--more-->

# FFmpeg API

FFmpeg为了能够让更多的人使用它，所以它提供了很多API接口，方便开发人员直接使用，不需要再重新自己书写，可以点击下方的连接跳转到API接口文档地址

> http://ffmpeg.org/doxygen/trunk/index.html

对于`FFmpeg`的组成，在以前的博客也讲过，大致分为了以下几个部分：
* **libavcodec** 编解码库
* **libavfilter** 过滤器库
* **libavformat** I/O、复用以及解复用库
* **libdevice** 特殊设备复用/解复用库
* **libavutil** 公用工具库
* **libswresample** 音频重采样，格式转换和混合
* **libpostproc** 处理库
* **libswscals** 颜色转换和缩放库

对于我们今天所要讲述的FFmpeg的日志系统，是在`libavutil`库中，毕竟日志系统是个公共部分，在任何地方都可使用。

# 安装
要想使用`FFmpeg`就需要将其安装到本地，`FFmpeg`的安装是比较简单的，有两种方式：
* 直接使用编译完成的[【FFmpeg-Builds】](https://github.com/BtbN/FFmpeg-Builds/releases)解压到本地进行使用。
* 自行编译安装

第一种方式比较简单就相当于直接使用，我们这里使用第二种方式
* 先将[【FFmpeg源码】](http://ffmpeg.org/download.html)下载到本地
> http://ffmpeg.org/download.html
* 解压并进入ffmpeg目录
* 执行如下代码进行安装
```
./configure
make -j4
make install
```
安装完成之后就可以在以下目录中看到头文件和可执行文件了
`usr/local/include`
`usr/local/bin`

> <strong style="color: #e67e22">Notice：</strong> <span style="color: #e67e22; font-size:16px">第二种方式只适用于Linux和MacOS系统</span>

# FFmpeg 日志
日志是一个程序的基础，但是在代码过程中却一直离不开它。关于FFmpeg日志的定义位置：`libavutil/log.h`，可以打开如下链接进入。
> http://ffmpeg.org/doxygen/trunk/log_8h_source.html

关于日志的使用，我们在这里只讲解重要的三个函数。
* av_log_set_level
* av_log
* av_err2str

## av_log_set_level

通过名字就可以知道是设置日志的级别，等级的类型也定义在`log.h`中
* AV_LOG_QUIET 不打印错误
* AV_LOG_PANIC 奔溃错误
* AV_LOG_FATAL 致命错误
* `AV_LOG_ERROR` 普通错误
* `AV_LOG_WARNING` 警告
* `AV_LOG_INFO` 标准信息
* `AV_LOG_VERBOSE` 详细信息
* `AV_LOG_DEBUG` 调试信息，针对开发人员
* AV_LOG_TRACE 冗长的调试信息，针对开发人员

```
// level即为上述等级
 void  av_log_set_level（int level）;
```

> Notice:
> 等级级别按照上述顺序从高到低
> 设置了某个等级，只能打印当前等级级别以及比它高的级别日志信息

```
// 设置当前日志为标准打印信息
// 只能打印`AV_LOG_INFO`和`AV_LOG_INFO`之上的日志
av_log_set_level(AV_LOG_INFO);
```

## av_log
`av_log`打印日志，先看一下定义：
```
void av_vlog(void *avcl, int level, const char *fmt, va_list vl);
```
* avcl指向任意的指针结构，一般为NULL
* level与上述的等级级别一致
* fmt格式字符串
* fmt字符串引用的参数

举个栗子🌰
```
av_log(NULL,AV_LOG_INFO,"ffmpeg log can be used by %s\n","cimuboy");
```
这样就打印出了一个标准的输出日志。
> * 如果`av_log_set_level`中设置的等级级别比`AV_LOG_INFO`高的话，这条日志是不打印的。

## av_err2str
需要注意的是当前函数定义在`libavutil/error.h`中。
```
av_err2str(errnum)
```
需要传入的参数是一个错误类型的枚举，并返回一个错误字符串。
> 错误枚举不是随便填写的，是根据FFmpeg提供的某些API返回的。

```
int ret = avformat_open_input(&ctx,input,NULL,NULL);
if(ret<0){
	av_log(NULL,AV_LOG_ERROR,"can not open input file: %s\n",av_err2str(ret));
	return ret;
}
```
上述就表示，通过`avformat_open_input`（后面会介绍到）打开一个文件，但是文件打开失败，返回了一个错误的枚举类型，将这个枚举类型传入`av_err2str`,就可以直接返回一个错误的字符串，以供我们清楚这个错误是什么！

# 编译
了解完了具体的用法，肯定需要编译，这里我们以`linux`系统为例。

* 先写一个完整的日志打印，并命名为log.c:

```
#include<stdio.h>
#include<libavutil/log.h>
int main(int argc ,char *argv[])
{
	av_log_set_level(AV_LOG_INFO);
	av_log(NULL,AV_LOG_INFO,"ffmpeg log can be used by %s\n","cimuboy");
	return 0;
}
```
* 执行编译
```
gcc log.c -g -o log `pkg-config --libs libavutil`
```
* 输出结果
编译完成之后，就会多处一个`log`的文件，然后我们执行：
```
./log
```
就会得到一个输出的结果:
```
ffmpeg log can be used by cimuboy
```
> 如果使用的是mac系统，编译时将`gcc`替换为`clang`
```
clang log.c -g -o log `pkg-config --libs libavutil`
``` 
[代码下载](/code/ffmpeg/log.c)
