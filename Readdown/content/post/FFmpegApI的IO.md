---
title: FFmpegAPI的I/O
date: 2021-04-07 16:44:03
categories:
  - "ffmpeg"
tags: ["ffmpeg"]
thumbnail: /img/ffmpeg/ffmpeg-delete.png
---

在[《FFmpegAPI介绍以及日志系统》]({{< relref "FFmpegAPI介绍以及日志系统.md" >}})中我们了解到如何在`FFmpeg`中使用日志系统，这一小节我们来了解它的I/O处理。我们通过上面提到的[《FFmpegAPI介绍以及日志系统》]({{< relref "FFmpegAPI介绍以及日志系统.md" >}})知道关于I/O的操作是存在于`libformat`模块下。

<!--more-->
> http://ffmpeg.org/doxygen/trunk/group__lavf__io.html

打开上面的地址，我们就可以知道，关于I/O的操作被定义在了`libformat/avio.h`下

# 移动
想要使用`FFmpeg`移动文件，就需要使用下面的函数:
```
int avpriv_io_move(const char *url_src, const char *url_dst);
```
通过上面的函数，我们知道要移动文件，就需要传入两个地址：
* `url_src` 需要移动的源文件路径
* `url_dst` 移动后的目标文件路径

> 上述函数，有一个返回，如果返回值`>=0`就表示移动成功，反之移动失败

举个栗子🌰，我们编辑一个`move.c`
```
#include<stdio.h>
#include<libavformat/avio.h>
#include<libavutil/log.h>
int main(int argc ,char *argv[])
{
	int ret;
	av_log_set_level(AV_LOG_DEBUG);
	ret = avpriv_io_move("./mytest.txt","./mytest1.txt");
	if(ret<0)
	{
		av_log(NULL,AV_LOG_ERROR,"failed to move mytest.txt->mytest1.txt\n");
		return ret;
	}
	av_log(NULL,AV_LOG_INFO,"success to move mytest.txt->mytest1.txt\n");
	return 0;
}
```
上面代码的意思是:
* 在当前目录下将移动一个名为`mytest.txt`的文件
* 如果失败就打印错误日志，成功就打印成功的日志信息

进行编译之后就可以得到一个`move`的可执行文件
```
gcc move.c -g -o move `pkg-config --libs libavutil libavformat`
```
> mac系统需要将`gcc`替换为`clang`

![移动文件](/img/ffmpeg/ffmpeg-move.png)
可以看出，如果在当前目录下没有一个为`mytest.txt`的文件，执行时结果小于0，就打印了一个错误日志。反之，就将文件进行移动并打印正确信息。

> 其实这个移动操作也就是一个重命名，上述代码就实现了蒋`mytest.txt`重命名为`mytest1.txt`

# 删除
想要使用`FFmpeg`删除文件，就需要使用下面的函数:
```
int avpriv_io_delete(const char *url);
```
删除一个文件就需要传入一个源文件的路径，和移动类似，成功就返回一个`>=0`的值，反之就返回一个`<0`的值。
创建一个`delete.c`文件，并写入代码：
```
#include<stdio.h>
#include<libavformat/avio.h>
#include<libavutil/log.h>
int main(int argc ,char *argv[])
{
	int ret;
	av_log_set_level(AV_LOG_DEBUG);
	ret = avpriv_io_delete("./mytest.txt");
	if(ret<0)
	{
		av_log(NULL,AV_LOG_ERROR,"failed to delete mytest.txt\n");
		return ret;
	}
	av_log(NULL,AV_LOG_INFO,"success to delete mytest.txt\n");
	return 0;
}
```
编译生成可执行文件
```
gcc delete.c -g -o delete `pkg-config --libs libavutil libavformat`
```
执行删除文件操作
![删除文件](/img/ffmpeg/ffmpeg-delete.png)

上述演示与移动类似，当不存在需要删除的文件时，打印一个错误日志，反之删除文件并打印“删除成功”。

# 目录
在Linux系统上，我们在`Terminal`执行`ls`就可以查看当前目录下的文件以及文件夹
![LS目录列表](/img/ffmpeg/ffmpeg-ls.png)
像上面的这种ls命令，是否可以通过`FFmpeg`去实现呢？答案是肯定的，大概需要以下几个函数：

```
// 打开目录
int avio_open_dir(AVIODirContext **s, const char *url, AVDictionary **options)
// 读取每一条目录信息
int avio_read_dir(AVIODirContext *s, AVIODirEntry **next);
// 释放一条目录信息
void avio_free_directory_entry(AVIODirEntry ** entry);
// 关闭目录
int avio_close_dir(AVIODirContext **s);
```
简述一下获取目录流程：
* 先打开一个目录
* 逐条读取目录信息，操作之后在释放
* 关闭目录

代码如下:
```
#include<libavutil/log.h>
#include<libavformat/avio.h>
int main(int argc, char *argv[])
{
	int ret;
	AVIODirContext *ctx = NULL;
	AVIODirEntry *entry = NULL;
	av_log_set_level(AV_LOG_INFO);
	// 打开当前目录
	ret = avio_open_dir(&ctx,"./",NULL);
	if(ret<0)
	{
		av_log(NULL,AV_LOG_ERROR,"can not open dir:%s\n",av_err2str(ret));
		return -1;
	}
	while(1){
		// 读取目录
		ret = avio_read_dir(ctx,&entry);
		if(ret<0){
			av_log(NULL,AV_LOG_ERROR,"can not read dir :%s\n",av_err2str(ret));
			goto fail;
		}
		if(!entry){
			break;
		}
		// 打印目录信息
		av_log(NULL,AV_LOG_INFO,"size: %ld, name: %s, type: %s\n",entry->size, 
		entry->name,
		entry->type == 3?"dir":"file");
		// 释放
		avio_free_directory_entry(&entry);
	}
	ret = 0;
fail:
	// 关闭目录
	avio_close_dir(&ctx);
	return ret;
}
```

> <strong style="color: #e67e22">Notice：</strong> 
> `ctx`是`AVIODirContext`类型的上下文，在执行`avio_open_dir(&ctx,"./",NULL)`后被分配的一个句柄，执行完程序需要`avio_close_dir(&ctx)`去释放这个持有句柄。	
> 通过`avio_read_dir(ctx,&entry)`去读取一个目录后，也会让`entry`持有类型为`AVIODirEntry`的实例句柄，同样需要通过`avio_free_directory_entry(&entry)`释放。

编译并生成可执行文件
```
gcc dir.c -g -o dir `pkg-config --libs libavutil libavformat`
```
![获取当前目录文件](/img/ffmpeg/ffmpeg-dir.png)

这样就获取到了当前目录下的文件以及文件夹，不仅如此，我们还获取到了文件大小和类型。
以上就是`FFmpeg`对于`I/O`的简单操作，还有很多可以自己动手试一试！