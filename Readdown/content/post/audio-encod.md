---
title: Android音视频开发:音频非压缩编码和压缩编码
date: 2020-01-19 08:50:56
categories:
  - "codec"
tags: ["audio"]
thumbnail: /img/top/audio-encode.jpeg
---

![](/img/top/audio-encode.jpeg)
> 音视频在开发中，最重要也是最复杂的就是编解码的过程，在上一篇的[《Android音视频开发:踩一踩“门槛”》](https://readdown.com/2020/01/11/basic-media/)中，我们说音频的编码根据大小划分有两种：压缩编码和非压缩编码，那到底是怎么实现的这两中编码的呢？这一次就详细了解Android中如何使用这两种方式进行音频编码

<!--more-->

## 前景提要

这里先回顾一下音频的压缩编码和非压缩编码:

* 非压缩编码：音频裸数据，也即是我们所说的PCM
* 压缩编码：对数据进行压缩，压缩不能被人耳感知到的冗余信号

因为非压缩编码实在是太大了，所以我们生活中所接触的音频编码格式都是压缩编码，而且是有损压缩，比如 MP3或AAC。     
那如何操作PCM数据呢？Android SDK中提供了一套对PCM操作的API：`AudioRecord` 和 `AudioTrack`；

由于`AudioRecord(录音)` 和 `AudioTrack(播放)`操作过于底层而且过于复杂，所以Android SDK 还提供了一套与之对应更加高级的API：`MediaRecorder(录音)`和`MediaPlayer(播放)`，用于音视频的操作，当然其更加简单方便。我们这里只介绍前者，通过它来实现对PCM数据的操作。

对于压缩编码，我们则通过`MediaCodec`和`Lame`来分别实现AAC音频和Mp3音频压缩编码。话不多说，请往下看！

## AudioRecord

由于`AudioRecord`更加底层，能够更好的并且直接的管理通过音频录制硬件设备录制后的PCM数据，所以对数据处理更加灵活，但是同时也需要我们自己处理编码的过程。

AudioRecord的使用流程大致如下：

* 根据音频参数创建`AudioRecord`
* 调用`startRecording`开始录制
* 开启录制线程，通过`AudioRecord`将录制的音频数据从缓存中读取并写入文件
* 释放资源

在使用`AudioRecord`前需要先注意添加`RECORD_AUDIO`录音权限。

### 创建AudioRecord

我们先看看`AudioRecord`构造方法

```java
public AudioRecord (int audioSource, 
                int sampleRateInHz, 
                int channelConfig, 
                int audioFormat, 
                int bufferSizeInBytes)
```
* audioSource，从字面意思可知音频来源，由`MediaRecorder.AudioSource`提供，主要有以下内容    

    ·  CAMCORDER 与照相机方向相同的麦克风音频源

    ·  DEFAULT  默认

    ·  MIC 麦克风音频源

    ·  VOICE_CALL 语音通话       

    这里采用`MIC`麦克风音频源

* sampleRateInHz，采样率，即录制的音频每秒钟会有多少次采样，可选用的采样频率列表为：8000、16000、22050、24000、32000、44100、48000等，一般采用人能听到最大音频的2倍，也就是44100Hz。

* channelConfig，声道数的配置，可选值以常量的形式配置在类AudioFormat中，常用的是CHANNEL_IN_MONO（单声道）、CHANNEL_IN_STEREO（双声道）

* audioFormat，采样格式，可选值以常量的形式定义在类AudioFormat中，分别为ENCODING_PCM_16BIT（16bit）、ENCODING_PCM_8BIT（8bit），一般采用16bit。

* bufferSizeInBytes，其配置的是AudioRecord内部的音频缓冲区的大小，可能会因为生产厂家的不同而有所不同，为了方便AudioRecord提供了一个获取该值最小缓冲区大小的方法`getMinBufferSize`。

```java
public static int getMinBufferSize (int sampleRateInHz, 
                int channelConfig, 
                int audioFormat)
```
在开发过程中需使用`getMinBufferSize`此方法计算出最小缓存大小。

### 切换录制状态

首先通过调用`getState`判断AudioRecord是否初始化成功，然后通过`startRecording`切换成录制状态

```kotlin
if (null!=audioRecord && audioRecord?.state!=AudioRecord.STATE_UNINITIALIZED){
    audioRecord?.startRecording()
}
```
### 开启录制线程

```kotlin
thread = Thread(Runnable {
   writeData2File()
})
thread?.start()
```
开启录音线程将录音数据通过AudioRecord写入文件

```
private fun writeData2File() {
    var ret = 0
    val byteArray = ByteArray(bufferSizeInBytes)
    val file = File(externalCacheDir?.absolutePath + File.separator + filename)

    if (file.exists()) {
        file.delete()
    } else {
        file.createNewFile()
    }
    val fos = FileOutputStream(file)
    while (status == Status.STARTING) {
        ret = audioRecord?.read(byteArray, 0, bufferSizeInBytes)!!
        if (ret!=AudioRecord.ERROR_BAD_VALUE || ret!=AudioRecord.ERROR_INVALID_OPERATION|| ret!=AudioRecord.ERROR_DEAD_OBJECT){
            fos.write(byteArray)
        }
    }
    fos.close()
}
```

### 释放资源
首先停止录制

```kotlin
if (null!=audioRecord && audioRecord?.state!=AudioRecord.STATE_UNINITIALIZED){
    audioRecord?.stop()
}
```
然后停止线程
```
if (thread!=null){
    thread?.join()
    thread =null
}
```
最后释放AudioRecord
```
if (audioRecord != null) {
    audioRecord?.release()
    audioRecord = null
}
```
通过以上一个流程之后，就可以得到一个非压缩编码的PCM数据了。

但是这个数据在音乐播放器上一般是播放不了的，那么怎么验证我是否录制成功呢？当然是使用我们的`AudioTrack`进行播放看看是不是刚刚我们录制的声音了。

[【完整代码-AudioRecord】](https://github.com/AnJoiner/MediaSeries/blob/master/Media01/app/src/main/java/com/coder/media/ui/activity/RecordActivity.kt)

## AudioTrack

由于`AudioTrack`是由Android SDK提供比较底层的播放API，也只能操作PCM裸数据，通过直接渲染PCM数据进行播放。当然如果想要使用`AudioTrack`进行播放，那就需要自行先将压缩编码格式文件解码。

AudioTrack的使用流程大致如下：

* 根据音频参数创建`AudioTrack`
* 调用`play`开始播放
* 开启播放线程，循环想`AudioTrack`缓存区写入音频数据
* 释放资源

### 创建AudioTrack

我们来看看`AudioTrack`的构造方法

```java
public AudioTrack (int streamType, 
                int sampleRateInHz, 
                int channelConfig, 
                int audioFormat, 
                int bufferSizeInBytes, 
                int mode, 
                int sessionId)
```

* streamType，Android手机上提供音频管理策略，按下音量键我们会发现由媒体声音管理，闹铃声音管理，通话声音管理等等，当系统有多个进程需要播放音频的时候，管理策略会决定最终的呈现效果，该参数的可选值将以常量的形式定义在类AudioManager中，主要包括以下内容：

    ·  STREAM_VOCIE_CALL：电话声音

    ·  STREAM_SYSTEM：系统声音

    ·  STREAM_RING：铃声

    ·  STREAM_MUSCI：音乐声

    ·  STREAM_ALARM：警告声
    
    ·  STREAM_NOTIFICATION：通知声

因为这里是播放音频，所以我们选择`STREAM_MUSCI`。

* sampleRateInHz，采样率，即播放的音频每秒钟会有多少次采样，可选用的采样频率列表为：8000、16000、22050、24000、32000、44100、48000等，一般采用人能听到最大音频的2倍，也就是44100Hz。

* channelConfig，声道数的配置，可选值以常量的形式配置在类AudioFormat中，常用的是CHANNEL_IN_MONO（单声道）、CHANNEL_IN_STEREO（立体双声道）

* audioFormat，采样格式，可选值以常量的形式定义在类AudioFormat中，分别为ENCODING_PCM_16BIT（16bit）、ENCODING_PCM_8BIT（8bit），一般采用16bit。

* bufferSizeInBytes，其配置的是AudioTrack内部的音频缓冲区的大小，可能会因为生产厂家的不同而有所不同，为了方便AudioTrack提供了一个获取该值最小缓冲区大小的方法`getMinBufferSize`。

* mode，播放模式，AudioTrack提供了两种播放模式，可选的值以常量的形式定义在类AudioTrack中，一个是MODE_STATIC，需要一次性将所有的数据都写入播放缓冲区中，简单高效，通常用于播放铃声、系统提醒的音频片段；另一个是MODE_STREAM，需要按照一定的时间间隔不间断地写入音频数据，理论上它可以应用于任何音频播放的场景。

* sessionId，AudioTrack都需要关联一个会话Id，在创建AudioTrack时可直接使用`AudioManager.AUDIO_SESSION_ID_GENERATE`，或者在构造之前通过`AudioManager.generateAudioSessionId`获取。

上面这种构造方法已经被弃用了，现在基本使用如下构造（最小skd 版本需要>=21）,参数内容与上基本一致：
```java
public AudioTrack (AudioAttributes attributes, 
                AudioFormat format, 
                int bufferSizeInBytes, 
                int mode, 
                int sessionId)
```

通过`AudioAttributes.Builder`设置参数streamType

```kotlin
var audioAttributes = AudioAttributes.Builder()
    .setLegacyStreamType(AudioManager.STREAM_MUSIC)
    .build()
```

通过`AudioFormat.Builder`设置channelConfig，sampleRateInHz，audioFormat参数

```kotlin
var mAudioFormat = AudioFormat.Builder()
    .setChannelMask(channel)
    .setEncoding(audioFormat)
    .setSampleRate(sampleRate)
    .build()
```
### 切换播放状态

首先通过调用`getState`判断AudioRecord是否初始化成功，然后通过`play`切换成录播放状态

```kotlin
if (null!=audioTrack && audioTrack?.state != AudioTrack.STATE_UNINITIALIZED){
    audioTrack?.play()
}
```

### 开启播放线程

开启播放线程
```kotlin
thread= Thread(Runnable {
    readDataFromFile()
})
thread?.start()
```
将数据不断的送入缓存区并通过AudioTrack播放

```
private fun readDataFromFile() {
    val byteArray = ByteArray(bufferSizeInBytes)


    val file = File(externalCacheDir?.absolutePath + File.separator + filename)
    if (!file.exists()) {
        Toast.makeText(this, "请先进行录制PCM音频", Toast.LENGTH_SHORT).show()
        return
    }
    val fis = FileInputStream(file)
    var read: Int
    status = Status.STARTING

    while ({ read = fis.read(byteArray);read }() > 0) {
        var ret = audioTrack?.write(byteArray, 0, bufferSizeInBytes)!!
        if (ret == AudioTrack.ERROR_BAD_VALUE || ret == AudioTrack.ERROR_INVALID_OPERATION || ret == AudioManager.ERROR_DEAD_OBJECT) {
            break
        }
    }
    fis.close()
}
```
### 释放资源

首先停止播放

```kotlin
if (audioTrack != null && audioTrack?.state != AudioTrack.STATE_UNINITIALIZED) {
    audioTrack?.stop()
}
```
然后停止线程
```
if (thread!=null){
    thread?.join()
    thread =null
}
```
最后释放AudioTrack
```
if (audioTrack != null) {
    audioTrack?.release()
    audioTrack = null
}
```
经过这样几个步骤，我们就可以听到刚刚我们录制的PCM数据声音啦！这就是使用Android提供的`AudioRecord`和`AudioTrack`对PCM数据进行操作。

但是仅仅这样是不够的，因为我们生活中肯定不是使用PCM进行音乐播放，那么怎么才能让音频在主流播放器上播放呢？这就需要我们进行压缩编码了，比如mp3或aac压缩编码格式。

[【完整代码-AudioTrack】](https://github.com/AnJoiner/MediaSeries/blob/master/Media01/app/src/main/java/com/coder/media/ui/activity/PlayActivity.kt)

## MediaCodec编码AAC

`AAC`压缩编码是一种高压缩比的音频压缩算法，AAC压缩比通常为18：1；采样率范围通常是8KHz～96KHz，这个范围比MP3更广一些（MP3的范围一般是：16KHz～48KHz），所以在16bit的采样格式上比MP3更精细。

方便我们处理AAC编码，Android SDK中提供了`MediaCodec`API，可以将PCM数据编码成AAC数据。大概需要以下几个步骤：

* 创建`MediaCodec`
* 为`MediaCodec`配置音频参数
* 启动线程，循环往缓冲区送入数据
* 通过`MediaCodec`将缓冲区的数据进行编码
* 释放资源

### 创建MediaCodec

通过`MediaCodec.createEncoderByType`创建编码MediaCodec

```kotlin
mediaCodec = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_AUDIO_AAC)
```


### 配置音频参数

```kotlin
// 配置采样率和声道数
mediaFormat = MediaFormat.createAudioFormat(MINE_TYPE,sampleRate,channel)
// 配置比特率
mediaFormat?.setInteger(MediaFormat.KEY_BIT_RATE,bitRate)
// 配置PROFILE，其中属AAC-LC兼容性最好
mediaFormat?.setInteger(MediaFormat.KEY_AAC_PROFILE, MediaCodecInfo.CodecProfileLevel.AACObjectLC)
// 最大输入大小
mediaFormat?.setInteger(MediaFormat.KEY_MAX_INPUT_SIZE, 10 * 1024)
    
mediaCodec!!.configure(mediaFormat,null,null,MediaCodec.CONFIGURE_FLAG_ENCODE)
mediaCodec?.start()

inputBuffers = mediaCodec?.inputBuffers
outputBuffers = mediaCodec?.outputBuffers
```

### 启动线程

启动线程，循环读取PCM数据送入缓冲区

```kotlin
thread = Thread(Runnable {
    val fis = FileInputStream(pcmFile)
    fos = FileOutputStream(aacFile)
    var read: Int
    while ({ read = fis.read(byteArray);read }() > 0) {
        encode(byteArray)
    }
})
thread?.start()
```

### AAC编码

将送入的PCM数据通过`MediaCodec`进行编码，大致流程如下：

* 通过可用缓存去索引，获取可用输入缓冲区
* 将pcm数据放入输入缓冲区并提交
* 根据输出缓冲区索引，获取输出缓冲区
* 创建输出数据`data`，并添加ADTS头部信息(有7byte)
* 将`outputBuffer`编码后数据写入`data`（data有7byte偏移）
* 将编码数据`data`写入文件
* 重复以上过程

```
private fun encode(byteArray: ByteArray){
    mediaCodec?.run {
        //返回要用有效数据填充的输入缓冲区的索引， -1 无限期地等待输入缓冲区的可用性
        val inputIndex = dequeueInputBuffer(-1)
        if (inputIndex > 0){
            // 根据索引获取可用输入缓存区
            val inputBuffer = this@AACEncoder.inputBuffers!![inputIndex]
            // 清空缓冲区
            inputBuffer.clear()
            // 将pcm数据放入缓冲区
            inputBuffer.put(byteArray)
            // 提交放入数据缓冲区索引以及大小
            queueInputBuffer(inputIndex,0,byteArray.size,System.nanoTime(),0)
        }
        // 指定编码器缓冲区中有效数据范围
        val bufferInfo = MediaCodec.BufferInfo()
        // 获取输出缓冲区索引
        var outputIndex = dequeueOutputBuffer(bufferInfo,0)
        
        while (outputIndex>0){
            // 根据索引获取可用输出缓存区
            val outputBuffer =this@AACEncoder.outputBuffers!![outputIndex]
            // 测量输出缓冲区大小
            val bufferSize = bufferInfo.size
            // 输出缓冲区实际大小，ADTS头部长度为7
            val bufferOutSize = bufferSize+7
            
            // 指定输出缓存区偏移位置以及限制大小
            outputBuffer.position(bufferInfo.offset)
            outputBuffer.limit(bufferInfo.offset+bufferSize)
            // 创建输出空数据
            val data = ByteArray(bufferOutSize)
            // 向空数据先增加ADTS头部
            addADTStoPacket(data, bufferOutSize)
            // 将编码输出数据写入已加入ADTS头部的数据中
            outputBuffer.get(data,7,bufferInfo.size)
            // 重新指定输出缓存区偏移
            outputBuffer.position(bufferInfo.offset)
            // 将获取的数据写入文件
            fos?.write(data)
            // 释放输出缓冲区
            releaseOutputBuffer(outputIndex,false)
            // 重新获取输出缓冲区索引
            outputIndex=dequeueOutputBuffer(bufferInfo,0)
        }
    }
}
```

### 释放资源
编码完成后，一定要释放所有资源，首先关闭输入输出流

```
fos?.close()
fis.close()
```

停止编码
```
if (mediaCodec!=null){
     mediaCodec?.stop()
}
```

然后就是关闭线程
```
if (thread!=null){
    thread?.join()
    thread =null
}
```
最后释放MediaCodec
```
if (mediaCodec!=null){
    mediaCodec?.release()
    mediaCodec = null

    mediaFormat = null
    inputBuffers = null
    outputBuffers = null
}
```

通过以上一个流程，我们就可以得到一个AAC压缩编码的音频文件，可以听一听是不是自己刚刚录制的。我听了一下我自己唱的一首歌，觉得我的还是可以的嘛，也不是那么五音不全～～

[【完整代码-MediaCodec】](https://github.com/AnJoiner/MediaSeries/blob/master/Media01/app/src/main/java/com/coder/media/codec/AACEncoder.kt)

## Android NDK

但是有个问题，毕竟AAC音频不是主流的音频文件呀，我们最常见的是MP3的嘛，可不可以将PCM编码成MP3呢？        
当然是可以的，但是Android SDK没有直接提供这样的API，只能使用Android NDK，通过交叉编译其他C或C++库来进行实现。

Android NDK 是由Google提供一个工具集，可让您使用 C 和 C++ 等语言实现应用。

Android NDK 一般有两个用途，一个是进一步提升设备性能，以降低延迟，或运行计算密集型应用，如游戏或物理模拟；另一个是重复使用您自己或其他开发者的 C 或 C++ 库。当然我们使用最多的应该还是后者。

想使用Android NDK调试代码需要以下工具：

* Android 原生开发套件 (NDK)：这套工具使您能在 Android 应用中使用 C 和 C++ 代码。
* CMake：一款外部编译工具，可与 Gradle 搭配使用来编译原生库。如果您只计划使用 ndk-build，则不需要此组件。
* LLDB：Android Studio 用于调试原生代码的调试程序。

可以进入Tools > SDK Manager > SDK Tools 选择  NDK (Side by side) 和 CMake 应用安装

![](/img/media/ndk-down)

在应用以上选项之后，我们可以看到SDK的目录中多了一个`ndk-bundle`的文件夹，大致目录结构如下

![](/img/media/ndk-bundle)

* ndk-build：该Shell脚本是Android NDK构建系统的起始点，一般在项目中仅仅执行这一个命令就可以编译出对应的动态链接库了，后面的编译mp3lame 就会使用到。

* platforms：该目录包含支持不同Android目标版本的头文件和库文件，NDK构建系统会根据具体的配置来引用指定平台下的头文件和库文件。

* toolchains：该目录包含目前NDK所支持的不同平台下的交叉编译器——ARM、x86、MIPS，其中比较常用的是ARM和x86。不论是哪个平台都会提供以下工具：      

    ·CC：编译器，对C源文件进行编译处理，生成汇编文件。

    ·AS：将汇编文件生成目标文件（汇编文件使用的是指令助记符，AS将它翻译成机器码）。

    ·AR：打包器，用于库操作，可以通过该工具从一个库中删除或者增加目标代码模块。

    ·LD：链接器，为前面生成的目标代码分配地址空间，将多个目标文件链接成一个库或者是可执行文件。

    ·GDB：调试工具，可以对运行过程中的程序进行代码调试工作。

    ·STRIP：以最终生成的可执行文件或者库文件作为输入，然后消除掉其中的源码。

    ·NM：查看静态库文件中的符号表。

    ·Objdump：查看静态库或者动态库的方法签名。


了解Android NDK 之后，就可新建一个支持C/C++ 的Android项目了：

* 在向导的 Choose your project 部分中，选择 Native C++ 项目类型。
* 点击 Next。
* 填写向导下一部分中的所有其他字段。
* 点击 Next。
* 在向导的 Customize C++ Support 部分中，您可以使用 C++ Standard 字段来自定义项目。使用下拉列表选择您想要使用哪种 C++ 标准化。选择 Toolchain Default 可使用默认的 CMake 设置。
* 点击 Finish，同步完成之后会出现如下图所示的目录结构，即表示原生项目创建完成

![](/img/media/native-project)

## 编译Lame

LAME是一个开源的MP3音频压缩库，当前是公认有损质量MP3中压缩效果最好的编码器，所以我们选择它来进行压缩编码，那如何进行压缩编码呢？主流的由两种方式：

* Cmake
* ndk-build

下面就详细讲解这两种方式

### Cmake编译Lame

配置Cmake之后可以直接将Lame代码运行于Android中

#### 准备

下载[Lame-3.100](https://sourceforge.net/projects/lame/files/lame/3.100/)并解压大概得到如下目录

![](/img/media/mp3-lame)

然后将里面的`libmp3lame`文件夹拷贝到我们上面创建的支持c/c++项目，删除其中的i386和vector文件夹，以及其他非.c 和 .h 后缀的文件

![](/img/media/mp3-lame-copy)

需要将以下文件进行修改，否则会报错      
* 将util.h中570行 
```
extern ieee754_float32_t fast_log2(ieee754_float32_t x)
```
替换成
```
extern float fast_log2(float x)
```
* 在id3tag.c和machine.h两个文件中，将`HAVE_STRCHR`和`HAVE_MEMCPY`注释

```c
#ifdef STDC_HEADERS
# include <stddef.h>
# include <stdlib.h>
# include <string.h>
# include <ctype.h>
#else

/*# ifndef HAVE_STRCHR
#  define strchr index
#  define strrchr rindex
# endif
 */
char *strchr(), *strrchr();

/*# ifndef HAVE_MEMCPY
#  define memcpy(d, s, n) bcopy ((s), (d), (n))
# endif*/
#endif
```

* 在fft.c中，将47行注释

```c
//#include "vector/lame_intrin.h"
```

* 将set_get.h中24行

```
#include <lame.h>
```
替换成

```
#include "lame.h"
```

#### 编写Mp3解码器

首先在自己的包下（我这里是`com.coder.media`，这个很重要，后面会用到），新建`Mp3Encoder`的文件，大概如下几个方法

* init，将声道，比特率，采样率等信息传入
* encode，根据init中提供的信息进行编码
* destroy，释放资源

```kotlin
class Mp3Encoder {

    companion object {
        init {
            System.loadLibrary("mp3encoder")
        }
    }

    external fun init(
        pcmPath: String,
        channel: Int,
        bitRate: Int,
        sampleRate: Int,
        mp3Path: String
    ): Int

    external fun encode()

    external fun destroy()
}
```

在cpp目录下新建两个文件

* mp3-encoder.h
* mp3-encoder.cpp

这两个文件中可能会提示错误异常，先不要管它，这是因为我们还没有配置`CMakeList.txt`导致的。

在`mp3-encoder.h`中定义三个变量
```c
FILE* pcmFile;
FILE* mp3File;
lame_t lameClient;
```

然后在`mp3-encoder.c`中分别实现我们在`Mp3Encoder`中定义的三个方法

首先导入需要的文件

```c
#include <jni.h>
#include <string>
#include "android/log.h"
#include "libmp3lame/lame.h"
#include "mp3-encoder.h"

#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG  , "mp3-encoder", __VA_ARGS__)
```

然后实现init方法

```c
extern "C" JNIEXPORT jint JNICALL
Java_com_coder_media_Mp3Encoder_init(JNIEnv *env, jobject obj, jstring pcmPathParam, jint channels,
                                     jint bitRate, jint sampleRate, jstring mp3PathParam) {
    LOGD("encoder init");
    int ret = -1;
    const char* pcmPath = env->GetStringUTFChars(pcmPathParam, NULL);
    const char* mp3Path = env->GetStringUTFChars(mp3PathParam, NULL);
    pcmFile = fopen(pcmPath,"rb");
    if (pcmFile){
        mp3File = fopen(mp3Path,"wb");
        if (mp3File){
            lameClient = lame_init();
            lame_set_in_samplerate(lameClient, sampleRate);
            lame_set_out_samplerate(lameClient,sampleRate);
            lame_set_num_channels(lameClient,channels);
            lame_set_brate(lameClient,bitRate);
            lame_init_params(lameClient);
            ret = 0;
        }
    }
    env->ReleaseStringUTFChars(mp3PathParam, mp3Path);
    env->ReleaseStringUTFChars(pcmPathParam, pcmPath);
    return ret;
}

```
这个方法的作用就是将我们的音频参数信息送入`lameClient`

需要注意我这里的方法`Java_com_coder_media_Mp3Encoder_init`中的`com_coder_media`需要替换成你自己的对应包名，下面的encode和destroy也是如此，切记！！！

实现通过`lame`编码encode

```c
extern "C" JNIEXPORT void JNICALL
Java_com_coder_media_Mp3Encoder_encode(JNIEnv *env, jobject obj) {
    LOGD("encoder encode");
    int bufferSize = 1024 * 256;
    short* buffer = new short[bufferSize / 2];
    short* leftBuffer = new short[bufferSize / 4];
    short* rightBuffer = new short[bufferSize / 4];

    unsigned char* mp3_buffer = new unsigned char[bufferSize];
    size_t readBufferSize = 0;

    while ((readBufferSize = fread(buffer, 2, bufferSize / 2, pcmFile)) > 0) {
        for (int i = 0; i < readBufferSize; i++) {
            if (i % 2 == 0) {
                leftBuffer[i / 2] = buffer[i];
            } else {
                rightBuffer[i / 2] = buffer[i];
            }
        }
        size_t wroteSize = lame_encode_buffer(lameClient, (short int *) leftBuffer, (short int *) rightBuffer,
                                              (int)(readBufferSize / 2), mp3_buffer, bufferSize);
        fwrite(mp3_buffer, 1, wroteSize, mp3File);
    }
    delete[] buffer;
    delete[] leftBuffer;
    delete[] rightBuffer;
    delete[] mp3_buffer;
}

```

最后释放资源

```
extern "C" JNIEXPORT void JNICALL
Java_com_coder_media_Mp3Encoder_destroy(JNIEnv *env, jobject obj) {
    LOGD("encoder destroy");
    if(pcmFile) {
        fclose(pcmFile);
    }
    if(mp3File) {
        fclose(mp3File);
        lame_close(lameClient);
    }
}
```

#### 配置Cmake

打开CPP目录下的CMakeList.txt文件，向其中添加如下代码
```
// 引入目录
include_directories(libmp3lame)
// 将libmp3lame下所有文件路径赋值给 SRC_LIST
aux_source_directory(libmp3lame SRC_LIST)

// 加入libmp3lame所有c文件
add_library(mp3encoder
        SHARED
        mp3-encoder.cpp ${SRC_LIST})
```
并且向`target_link_libraries`添加`mp3encoder`
```
target_link_libraries( 
        mp3encoder
        native-lib
        ${log-lib})
```

修改CMakeList.txt之后，点击右上角`Sync Now`就可以看到我们`mp3-encoder.cpp`和`mp3-encoder.h`中的错误提示不见了，至此已基本完成

然后在我们的代码中调用`Mp3Encoder`中的方法就可以将`PCM`编码成`Mp3`了

```
private fun encodeAudio() {
    var pcmPath = File(externalCacheDir, "record.pcm").absolutePath
    var target = File(externalCacheDir, "target.mp3").absolutePath
    var encoder = Mp3Encoder()
    if (!File(pcmPath).exists()) {
        Toast.makeText(this, "请先进行录制PCM音频", Toast.LENGTH_SHORT).show()
        return
    }
    var ret = encoder.init(pcmPath, 2, 128, 44100, target)
    if (ret == 0) {
        encoder.encode()
        encoder.destroy()
        Toast.makeText(this, "PCM->MP3编码完成", Toast.LENGTH_SHORT).show()
    } else {
        Toast.makeText(this, "Lame初始化失败", Toast.LENGTH_SHORT).show()
    }
}
```

[【完整代码-LameNative】](https://github.com/AnJoiner/MediaSeries/tree/master/LameNative)

### ndk-build编译Lame

ndk-build编译Lame，其实就是生成一个.so后缀的动态文件库供大家使用

* 首先在任何目录下创建`jni`文件夹

![](/img/media/ndk-jni)

* 将上面Android项目中cpp目录下修改好的libmp3lame、mp3-encoder.cpp和mp3-encoder.h拷贝至`jni`下

![](/img/media/ndk-jni-copy)

* 创建`Android.mk`文件

其中有几个重要配置说明如下

· LOCAL_PATH：=$（call my-dir），返回当前文件在系统中的路径，Android.mk文件开始时必须定义该变量。

· include$（CLEAR_VARS），表明清除上一次构建过程的所有全局变量，因为在一个Makefile编译脚本中，会使用大量的全局变量，使用这行脚本表明需要清除掉所有的全局变量        

· LOCAL_MODULE，编译目标项目名，如果是so文件，则结果会以lib项目名.so呈现

· LOCAL_SRC_FILES，要编译的C或者Cpp的文件，注意这里不需要列举头文件，构建系统会自动帮助开发者依赖这些文件。

· LOCAL_LDLIBS，所依赖的NDK动态和静态库。

· Linclude $(BUILD_SHARED_LIBRARY)，构建动态库

```
LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)
LOCAL_MODULE := mp3encoder

LOCAL_SRC_FILES := mp3-encoder.cpp \
                 libmp3lame/bitstream.c \
                 libmp3lame/psymodel.c \
                 libmp3lame/lame.c \
                 libmp3lame/takehiro.c \
                 libmp3lame/encoder.c \
                 libmp3lame/quantize.c \
                 libmp3lame/util.c \
                 libmp3lame/fft.c \
                 libmp3lame/quantize_pvt.c \
                 libmp3lame/vbrquantize.c \
                 libmp3lame/gain_analysis.c \
                 libmp3lame/reservoir.c \
                 libmp3lame/VbrTag.c \
                 libmp3lame/mpglib_interface.c \
                 libmp3lame/id3tag.c \
                 libmp3lame/newmdct.c \
                 libmp3lame/set_get.c \
                 libmp3lame/version.c \
                 libmp3lame/presets.c \
                 libmp3lame/tables.c \

LOCAL_LDLIBS := -llog -ljnigraphics -lz -landroid -lm -pthread -L$(SYSROOT)/usr/lib

include $(BUILD_SHARED_LIBRARY)
```

* 创建`Application.mk`

```
APP_ABI := all 
APP_PLATFORM := android-21
APP_OPTIM := release
APP_STL := c++_static
```

最终效果如下：

![](/img/media/ndk-jni-result)

最后在当前目录下以command命令运行`ndk-build`

```
/home/relo/Android/Sdk/ndk-bundle/ndk-build
```

如果不出意外，就可以在`jni`同级目录`libs`下面看到各个平台的so文件

![](/img/media/ndk-jni-libs)

将so文件拷贝至我们普通Android项目jniLibs下面，然后在自己的包下（我这里是`com.coder.media`），新建如上`Mp3Encoder`的文件，最后在需要使用编码MP3的位置使用`Mp3Encoder`中的三个方法就可以了。


![](/img/media/import-libmp3lame)

但是需要注意的是需要在app下的build.gradle配置与jniLibs下对应的APP_ABI


![](/img/media/ndk-app-abi)

[【完整代码-ndk-build】](https://github.com/AnJoiner/MediaSeries/tree/master/Media01)

到此音频非压缩编码和压缩编码基本讲解完毕了，如有不明白或者不正确的地方，请在下方评论区留言，望共勉之。

## 参考
[音视频开发进阶指南:基于Android与iOS平台的实践](https://book.douban.com/subject/30124646/)