---
title: FFmpeg命令行入门基础
date: 2019-12-20 09:28:48
categories:
  - "ffmpeg"
tags: ["ffmpeg","codec"]
thumbnail: /img/ffmpeg/ffmpeg-codec.webp
---

> 在手机端越来越多的应用涉及到音视频，直播类、短视频类等等，大大小小都会涉及到音视频的处理工具，音视频的处理工具有很多，这里简单介绍一下全球知名的`FFmpeg`，FFmpeg是一个强大的音视频处理库，既可以使用它的API对音视频进行处理，也可以使用它提供的工具，如 ffmpeg, ffplay, ffprobe，来编辑你的音视频文件。

<!--more-->

## FFmpeg基本组成

* libavcodec： 提供了一系列编码器的实现。 
* libavformat： 实现在流协议，容器格式及其本IO访问。  
* libavutil： 包括了hash器，解码器和各利工具函数。   
* libavfilter： 提供了各种音视频过滤器。 
* libavdevice： 提供了访问捕获设备和回放设备的接口。   
* libswresample： 实现了混音和重采样。 
* libswscale： 实现了色彩转换和缩放工能。   

如果使用过FFmpeg都知道，FFmpeg都是以命令行代码执行的，如下：

```c
ffmpeg [global_options] {[input_file_options] -i input_url} ...
                         {[output_file_options] output_url} ...
```

```c
ffmpeg -i input.mp4 output.avi
```

`ffmpeg`是 FFmpeg源码编译后生成的一个可执行程序，可以作为命令工具使用。

## FFmpeg处理流程

![FFmpeg](/img/ffmpeg/ffmpeg-codec.webp)

* 对输入文件进行解封装    
* 对解封装后的音频和视频进行解码    
* 对解码后的音视频数据操作处理后编码 
* 对编码后的数据进行封装   
* 输出文件  

## FFmpeg简单命令

我们按使用目的可以将 FFMPEG 命令分成以下几类： 

* 基本信息查询命令 
* 录制    
* 分解/复用 
* 处理原始数据    
* 滤镜    
* 切割与合并 
* 图／视互转 
* 直播相关  

除了 FFMPEG 的基本信息查询命令外，其它命令都按下图所示的流程处理音视频。

### 查询参数

|      参数     |                  说明               |
|--------------| ----------------------------------- |
|      -version      |显示版本|
|      -formats      |显示可用的格式（包括设备|
|      -demuxers     |显示可用的demuxers|
|      -muxers       |显示可用的muxers|
|      -devices      |显示可用的设备|
|      -codecs       |显示libavcodec已知的所有编解码器|
|      -decoders     |显示可用的解码器|
|      -encoders     |显示所有可用的编码器|
|      -bsfs         |显示可用的比特流filter|
|      -protocols    |显示可用的协议|
|      -filters      |显示可用的libavfilter过滤器|
|      -pix_fmts     |显示可用的像素格式|
|      -sample_fmts  |显示可用的采样格式|
|      -layouts      |显示channel名称和标准channel布局|
|      -colors     | 显示识别的颜色名称|


### 主要参数

|      参数     |                  说明               |
|--------------| ----------------------------------- |
|      -f fmt        |强制输入或输出文件格式|
|      -i url        |输入文件的地址|
|      -y            |覆盖输出文件而不询问|
|      -n            |不要覆盖输出文件，如果指定的输出文件已经存在，请立即退出|
|-c [：stream_specifier] codec|选择一个编码器（当在输出文件之前使用）或解码器（当在输入文件之前使用时）用于一个或多个流|
|      -codec [：stream_specifier]       |同上|
|      -t duration   |当用作输入选项（在-i之前）时，限制从输入文件读取的数据的持续时间。当用作输出选项时（在输出url之前），在持续时间到达持续时间之后停止输出|
|      -ss position  |当用作输入选项时（在-i之前），在这个输入文件中寻找位置|
|      -aspect       |设置方面指定的视频显示宽高比|
|      -s            |设置窗口大小|
|      -r            |设置帧率|
|      -vn           |禁用视频录制|
|      -vcodec       |设置视频编解码器|
|      -vframes num  |设置要输出的视频帧的数量|
|-r [：stream_specifier]|设置帧率（Hz值，分数或缩写）|
|      -aframes      | 设置要输出的音频帧的数量|
|      -ar           |设置音频采样频率|
|      -ac           |设置音频通道的数量|
|      -an           |禁用录音|
|      -acodec       |设置音频编解码器|


### 分解与复用

#### 抽取音频流

```c
ffmpeg -i input.mp4 -acodec copy -vn out.aac
```

* acodec: 指定音频编码器，copy 指明只拷贝，不做编解码。
* vn: v 代表视频，n 代表 no 也就是无视频的意思。

#### 抽取视频流

```c
ffmpeg -i input.mp4 -vcodec copy -an out.h264
```

* vcodec: 指定视频编码器，copy 指明只拷贝，不做编解码。
* an: a 代表视频，n 代表 no 也就是无音频的意思。

#### 转格式

```c
ffmpeg -i out.mp4 -vcodec copy -acodec copy out.flv
```

上面的命令表式的是音频、视频都直接 copy，只是将 mp4 的封装格式转成了flv

#### 音视频合并

```c
ffmpeg -i out.h264 -i out.aac -vcodec copy -acodec copy out.mp4
```

### 处理原始数据

#### 提取YUV

```c
ffmpeg -i input.mp4 -an -c:v rawvideo -pixel_format yuv420p out.yuv
ffplay -s wxh out.yuv
```

* -c:v rawvideo 指定将视频转成原始数据
* -pixel_format yuv420p 指定转换格式为yuv420p

#### YUV转H264

```c
ffmpeg -f rawvideo -pix_fmt yuv420p -s 320x240 -r 30 -i out.yuv -c:v libx264 -f rawvideo out.h264
```

#### 提取PCM数据

```c
ffmpeg -i out.mp4 -vn -ar 44100 -ac 2 -f s16le out.pcm
ffplay -ar 44100 -ac 2 -f s16le -i out.pcm
```

#### PCM转WAV

```c
ffmpeg -f s16be -ar 8000 -ac 2 -acodec pcm_s16be -i input.raw output.wav
```

### 滤镜

在编码之前，ffmpeg可以使用libavfilter库中的过滤器处理原始音频和视频帧。 几个链式过滤器形成一个过滤器图形。 ffmpeg区分两种类型的过滤器图形：简单和复杂。

#### 加水印

```c
ffmpeg -i ss.mp4  -vf "movie=logo.png,scale=48:48[watermask];[in][watermask] overlay=30:20 [out]" water.mp4
```

-vf中的 movie 指定logo位置。scale 指定 logo 大小。overlay 指定 logo 摆放的位置

#### 删除水印

先通过 ffplay 找到要删除 LOGO 的位置

```c
ffplay water.mp4 -vf delogo=x=20:y=20:w=200:h=100:show=1
```

再使用delogo滤镜删除LOGO

```c
ffmpeg -i water.mp4 -vf delogo=x=20:y=20:w=200:h=100 output.mp4
```

#### 视频缩小一倍

```c
ffmpeg -i ss.mp4 -vf scale=iw/2:-1 scale.mp4
```

-vf scale 指定使用简单过滤器 scale，iw/2:-1 中的 iw 指定按整型取视频的宽度。 -1 表示高度随宽度一起变化

#### 视频裁剪

```
ffmpeg -i ss.mp4  -vf crop=in_w-200:in_h-200 -c:v libx264 -c:a copy -video_size 1280x720 vr_new.mp4
```

crop 格式：crop=out_w:out_h:x:y
  out_w: 输出的宽度。可以使用 in_w 表式输入视频的宽度。
  out_h: 输出的高度。可以使用 in_h 表式输入视频的高度。
  x : X坐标
  y : Y坐标
如果 x和y 设置为 0,说明从左上角开始裁剪。如果不写是从中心点裁剪。

#### 倍速播放

```c
ffmpeg -i ss.mp4 -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" -map "[v]" -map "[a]" speed2.0.mp4
```

* -filter_complex 复杂滤镜，[0:v]表示第一个（文件索引号是0）文件的视频作为输入。setpts=0.5*PTS表示每帧视频的pts时间戳都乘0.5 ，也就是差少一半。[v]表示输出的别名。音频同理就不详述了。     	
* map 可用于处理复杂输出，如可以将指定的多路流输出到一个输出文件，也可以指定输出到多个文件。"[v]" 复杂滤镜输出的别名作为输出文件的一路流。上面map的用法是将复杂滤镜输出的视频和音频输出到指定文件中。

#### 对称视频

```c
ffmpeg  -i ss.mp4 -filter_complex "[0:v]pad=w=2*iw[a];[0:v]hflip[b];[a][b]overlay=x=w" duicheng.mp4
```

* hflip 水平翻转
* vflip 垂直翻转

#### 画中画

```c
ffmpeg -i ss.mp4 -i test2.mp4 -filter_complex "[1:v]scale=w=90:h=160:force_original_aspect_ratio=decrease[ckout];[0:v][ckout]overlay=x=W-w-10:y=0[out]" -map "[out]" -movflags faststart new.mp4
```

### 音视频的拼接与裁剪

### 裁剪

```c
ffmpeg -i ss.mp4 -ss 00:00:00 -t 10 s3.mp4
```

* -ss 指定裁剪的开始时间，精确到秒    
* -t 被裁剪后的时长。   

### 合并

首先创建一个 inputs.txt 文件，文件内容如下：

```c
file '1.flv'
file '2.flv'
file '3.flv'
```

然后执行下面的命令：

```c
ffmpeg -f concat -i inputs.txt -c copy output.flv
```

### hls切片

```c
ffmpeg -i ss.mp4 -c:v libx264 -c:a libfdk_aac -strict -2 -f hls  out.m3u8
```

* -strict -2 指明音频使有AAC。     
* -f hls 转成 m3u8 格式。

### 视频图片互转

#### 视频转JPEG

```c
ffmpeg -i ss.mp4 -r 1 -f image2 image-%3d.jpeg
```

#### 视频转GIF

```c
ffmpeg -i ss.mp4 -ss 00:00:00 -t 10 out.gif
```

#### 图片转视频

```c
ffmpeg  -f image2 -i image-%3d.jpeg images.mp4
```

### 直播相关

启动本地推流服务器

```c
nginx.exe -c conf\nginx-win-rtmp.conf
```

#### 推流

```c
ffmpeg -re -i out.mp4 -c copy -f flv rtmp://localhost/live/room
eg:
ffmpeg -re -i orange.mp4 -c copy -f flv rtmp://localhost/live/room
ffplay rtmp://localhost/live/room
```

#### 拉流保存

```c
ffmpeg -i rtmp://server/live/streamName -c copy dump.flv
```

#### 转流

```c
ffmpeg -i rtmp://server/live/originalStream -c:a copy -c:v copy -f flv rtmp://localhost/live/room
```

#### 实时推流

```c
ffmpeg -framerate 15 -f avfoundation -i "1" -s 1280x720 -c:v libx264  -f  flv rtmp://localhost/live/room
```
注意 `avfoundation` 是mac所支持的设备,如果适用其他的设备需要先查询可用设备列表.

例如:
```c
// 展示可用设备列表
ffmpeg -list_devices true -f dshow -i dummy
// 启用推流设备
ffmpeg -f dshow -i video="CyberLink Webcam Splitter 6.0":audio="麦克风阵列 (Realtek High Definition Audio)" -vcodec libx264 -acodec copy -f flv "rtmp://localhost/live/home"
// ffmpeg -f dshow -i video="HP Truevision HD":audio="麦克风阵列 (Realtek High Definition Audio)" -vcodec libx264 -acodec copy -f flv "rtmp://localhost/live/home"
```