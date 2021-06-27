---
title: 编译Android使用的libx264并使用进行H.264编码
date: 2021-04-10 23:33:03
categories:
  - "codec"
tags: ["libx264"]
thumbnail: /img/top/H.264.jpg
---
![](/img/top/x264.jpg)
在日常的音视频开发中，我们经常使用`FFmpeg`，因为它确实好用呀，囊括了各种功能！但是有个很严重的问题，如果是编译在Android和IOS上使用，会造成APP的包很大。可以看我编译的FFmpeg在Android上的应用程式。

<!--more-->

> https://github.com/AnJoiner/FFmpegCommand

一般的`FFmpeg`编译之后也会有6～7M左右，再加上编译一些第三方音视频处理库的话（如：<span style="text-decoration: underline;">fdk-aac、mp3lame、libx264</span>等等），可能达到10多M，这样就造成了APP的臃肿，所以说对于APP上使用的应用程式应该秉承这样一个原则：
> 单一原则 - 一个类只应该有一个功能，这里需要引申一下，一个功能只引入一个三方库

所以即便FFmpeg很强大，但是如果只是处理单独的`H.264`编码视频，我们仅仅使用[libx264](https://www.videolan.org/developers/x264.html)就可以了。这也就是为什么我在APP上放弃使用`FFmpeg`而选择编译`libx264`的原因，尽管也能通过FFmpeg去使用libx264，而且还比单独使用libx264方便。

# libx264
`libx264`是支持H.264编码算法的一套程式，这套程式里提供了完整的对视频裸流处理成H.264压缩的算法。

注意：我这里所谓的视频裸流，不仅仅只是指常用的`YUV420`格式，还有一些其他格式，，这里粘贴一下`libx264`主要支持的视频裸流格式:
* `X264_CSP_I420` - YUV420
* `X264_CSP_NV21` - YUV420格式的一种，但是带一个y planar 和 一个打包带v+u，这种格式在Android上就是Camera的数据。
* `X264_CSP_I422` - YUV422
* `X264_CSP_I444` - YUV444
* `X264_CSP_RGB` - RGB格式

还有很多其他格式，基本支持市面上常用的所有格式，如果对于YUV不熟悉的童鞋可以看一下之前的[《Android音视频开发:踩一踩“门槛”》]({{< ref "basic-media.md" >}}) 

那接下来我们就来试试，如何将libx264交叉编译到`Android`上，以及使用编译的链接文件进行编码。

# 交叉编译
想要使用libx264我们得编译成在Android和IOS上能够使用的二进制文件:
* 后缀为.a格式的静态文件
* 后缀为.so格式的动态文件

> 注意：这里编译是在Linux和MacOS上执行，在Windows配置实在是比较麻烦，真心不如使用虚拟机安装一个ubuntu的Linux系统。

## 下载
下载的方式大概有如下两种:

* 可以直接官网的下载地址[直接进行下载](https://code.videolan.org/videolan/x264/-/archive/master/x264-master.tar.bz2)。
* 也可以打开Terminal，通过git将代码拷贝到本地
```
 git clone https://code.videolan.org/videolan/x264.git
```
解压之后大概的目录内容如下
![x264目录](/img/media/x264-dir.png)

## 编写脚本

进入上述解压之后的x264根目录，然后创建一个build_x264.sh(可以随便取名字，只要是.sh的文件就可)的可执行文件。然后贴上如下代码:
```
#!/bin/bash
// Android ndk位置
ANDROID_NDK=/home/c2yu/developer/android/sdk/ndk/android-ndk-r14b


function build_x264()
{
PREFIX=$(pwd)/android/$ANDROID_ABI
SYSROOT=$ANDROID_NDK/platforms/$ANDROID_API/$ANDROID_ARCH
TOOLCHAIN=$ANDROID_NDK/toolchains/$ANDROID_EABI/prebuilt/linux-x86_64/bin

CROSS_PREFIX=$TOOLCHAIN/$CROSS_COMPILE

echo "Compiling x264 for $ANDROID_ABI"
./configure \
    --prefix=$PREFIX \
    --disable-asm \
    --enable-static \
    --enable-shared \
    --enable-pic \
    --host=$HOST \
    --cross-prefix=$CROSS_PREFIX \
    --sysroot=$SYSROOT \
    
make clean
make -j4
make install
echo "The Compilation of x264 for $ANDROID_ABI is completed"
}

# armeabi-v7a
ANDROID_ABI=armeabi-v7a
ANDROID_API=android-14
ANDROID_ARCH=arch-arm
ANDROID_EABI=arm-linux-androideabi-4.9

HOST=arm-linux-androideabi
CROSS_COMPILE=arm-linux-androideabi-

build_x264

# arm64-v8a
ANDROID_ABI=arm64-v8a
ANDROID_API=android-21
ANDROID_ARCH=arch-arm64
ANDROID_EABI=aarch64-linux-android-4.9

HOST=aarch64-linux-android
CROSS_COMPILE=aarch64-linux-android-

build_x264
```
> 上述为在Linux上的脚本，需要注意
> * ANDROID_NDK 需要替换成你自己的android ndk路径。这里使用的是ndk-14b版本
> * 如果是MacOS需要将`TOOLCHAIN`后路径替换成`$ANDROID_NDK/toolchains/$ANDROID_EABI/prebuilt/darwin-x86_64/bin`

脚本编辑完成之后保存，然后在`Terminal`赋予可执行权限并编译：

```
cd xxx/x264  // 进入x264目录
sudo chmod +x build_x264.sh // 赋予可执行权限
./build_x264.sh //开始交叉编译
```
编译之后会在当前目录生成一个`android`文件夹，打开之后就会看到大概如下内容:
![](/img/media/x264-cross-compile.png)
任意打开一个文件夹，我们可以看到如下内容：
![](/img/media/x264-cross-compile2.png)

* `include`里面装的是头文件 - 后面会用到
* `bin` 里面装的是x264执行文件 - 终端使用，不用考虑
* `lib` 里面装的就是我们需要的.a和.so二进制文件 - 最终就是为了它		

![二进制文件](/img/media/x264-cross-complie-libs.png)

# 使用
虽然我们已经成功编译出了libx264的二进制文件，但是在Android上还是不能直接使用。因为还没有写编码程序。

在Android上使用大概有如下两种方式:
* 通过`cmake`的方式直接在Android Studio上使用
* `ndk-build`编译成可直接使用的动态链接文件。

下面会详细介绍这两种方式的使用方法。

## Cmake

1. 创建一个Android的原生项目(Native)，怎么创建？请参考[《Android音视频开发:音频非压缩编码和压缩编码》]({{< ref "audio-encod.md" >}}) ，里面介绍了如何创建一个Native项目。

2. 创建完成项目之后，将上述提到的`include`文件夹里面的头文件放入`cpp`这个文件夹下

![](/img/media/x264-android-cmake-project-dir.png)

> 请先忽略这个`h264-encode`的这个c++文件，在后面会介绍

3. 然后在`main`目录下创建`nativeLibs`文件夹，将`arm64-v8a`和`armeabi-v7a`的两个文件夹的内容拷贝进去，如上图那样。

4. 创建`h264-encode.cpp`的编码视频的处理程序。粘贴代码如下：

```c

#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include "android/log.h"

extern "C" {
#include "x264.h"
#include "jni.h"
}

#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG  , "h264-encode", __VA_ARGS__)
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO  , "h264-encode", __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR  , "h264-encode", __VA_ARGS__)

extern "C"
JNIEXPORT jint JNICALL
Java_com_coder_x264cmake_X264Encode_encode(
        JNIEnv *env, jobject thiz,
        jint width, jint height,
        jstring yuv_path, jstring h264_path, jint yuv_csp) {
    int ret = 0;
    // TODO: implement encode()
    if (width == 0 || height == 0) {
        LOGE("width or height cannot be zero!");
    }
    const char *yuv_file_path = env->GetStringUTFChars(yuv_path, JNI_FALSE);
    const char *h264_file_path = env->GetStringUTFChars(h264_path, JNI_FALSE);

    if (!yuv_file_path) {
        LOGE("yuv path cannot be null");
        return -1;
    }
    if (!h264_file_path) {
        LOGE("h264 path cannot be null");
        return -1;
    }
    // 打开yuv
    FILE *yuv_file = fopen(yuv_file_path, "rb");
    if (yuv_file == NULL) {
        LOGE("cannot open yuv file");
        return -1;
    }
    FILE *h264_file = fopen(h264_file_path, "wb");
    if (h264_file == NULL) {
        LOGE("cannot open h264 file");
        return -1;
    }
    // 设置x264处理的yuv格式默认为YUV420
    int csp = X264_CSP_I420;
    switch (yuv_csp) {
        case 0:
            csp = X264_CSP_I420;
            break;
        case 1:
            csp = X264_CSP_I422;
            break;
        case 2:
            csp = X264_CSP_I444;
            break;
        default:
            csp = X264_CSP_I420;
    }

    LOGI("the params is success:\n %dx%d %s %s:", width, height, yuv_file_path, h264_file_path);

    int frame_number = 0;
    // 处理h264单元数据
    int i_nal = 0;
    x264_nal_t *nal = NULL;
    // x264
    x264_t *h = NULL;
    x264_param_t *param = (x264_param_t *) malloc(sizeof(x264_param_t));
    x264_picture_t *pic_in = (x264_picture_t *) (malloc(sizeof(x264_picture_t)));
    x264_picture_t *pic_out = (x264_picture_t *) (malloc(sizeof(x264_picture_t)));

    // 初始化编码参数
    x264_param_default(param);
    param->i_width = width;
    param->i_height = height;
    param->i_csp = csp;
    // 配置处理级别
    x264_param_apply_profile(param, x264_profile_names[2]);
    // 通过配置的参数打开编码器
    h = x264_encoder_open(param);

    x264_picture_init(pic_out);
    x264_picture_alloc(pic_in, param->i_csp, param->i_width, param->i_height);
    // 编码前每一帧的字节大小
    int size = param->i_width * param->i_height;

    // 计算视频帧数
    fseek(yuv_file, 0, SEEK_END);
    switch (csp) {
        case X264_CSP_I444:
            // YUV444
            frame_number = ftell(yuv_file) / (size * 3);
            break;
        case X264_CSP_I422:
            // YUV422
            frame_number = ftell(yuv_file) / (size * 2);
            break;
        case X264_CSP_I420:
            //YUV420
            frame_number = ftell(yuv_file) / (size * 3 / 2);
            break;
        default:
            LOGE("Colorspace Not Support.");
            return -1;
    }
    fseek(yuv_file, 0, SEEK_SET);
    // 循环执行编码
    for (int i = 0; i < frame_number; i++) {
        switch (csp) {
            case X264_CSP_I444:
                fread(pic_in->img.plane[0], size, 1, yuv_file);
                fread(pic_in->img.plane[1], size, 1, yuv_file);
                fread(pic_in->img.plane[2], size, 1, yuv_file);
                break;
            case X264_CSP_I422:
                fread(pic_in->img.plane[0], size, 1, yuv_file);
                fread(pic_in->img.plane[1], size / 2, 1, yuv_file);
                fread(pic_in->img.plane[2], size / 2, 1, yuv_file);
                break;
            case X264_CSP_I420:
                fread(pic_in->img.plane[0], size, 1, yuv_file);
                fread(pic_in->img.plane[1], size / 4, 1, yuv_file);
                fread(pic_in->img.plane[2], size / 4, 1, yuv_file);
                break;
        }
        pic_in->i_pts = i;
        // 对每一帧执行编码
        ret = x264_encoder_encode(h, &nal, &i_nal, pic_in, pic_out);
        if (ret < 0) {
            LOGE("x264 encode error");
            return -1;
        }
        LOGI("encode frame:%5d", i);
        // 将编码数据循环写入目标文件
        for (int j = 0; j < i_nal; ++j) {
            fwrite(nal[j].p_payload, 1, nal[j].i_payload, h264_file);
        }
    }

    // 冲刷缓冲区，不执行可能造成数据不完整
    int i = 0;
    while (1) {
        ret = x264_encoder_encode(h, &nal, &i_nal, NULL, pic_out);
        if (ret == 0) {
            break;
        }
        LOGD("flush 1 frame");
        // 将编码数据循环写入目标文件
        for (int j = 0; j < i_nal; ++j) {
            fwrite(nal[j].p_payload, 1, nal[j].i_payload, h264_file);
        }
        i++;
    }

    x264_picture_clean(pic_in);
    x264_encoder_close(h);
    // 释放分配的空间
    free(pic_in);
    free(pic_out);
    free(param);
    // 关闭文件输入
    fclose(yuv_file);
    fclose(h264_file);

    return ret;
}
```

这段代码有点长，而且还是C语言相关代码，读不懂没有关系，将上述代码直接粘贴到你的项目中即可。

> 注意：
> 1. 当前程序只支持`YUV420`、`YUV422`以及`YUV444`三种裸流处理。
> 2. `Java_com_coder_x264cmake_X264Encode_encode`这个意思是指在`com.coder.x264cmake`的包名下的`X264Encode`类中的`encode`的方法。需要对应成你自己的完整路径。

5. 配置`CmakeLists.txt`，一定要注意这个的配置，稍微一点点配置错误，就会出现如下错误

![CmakeLists配置错误](/img/media/x264-android-cmake-error.png)

为了防止大家配置错误，我将CmakeLists.txt的配置粘贴如下：
```cmake
# For more information about using CMake with Android Studio, read the
# documentation: https://d.android.com/studio/projects/add-native-code.html

# Sets the minimum version of CMake required to build the native library.

cmake_minimum_required(VERSION 3.10.2)

# Declares and names the project.

project("x264cmake")

set( JNI_LIBS_DIR src/main/nativeLibs)
# Creates and names a library, sets it as either STATIC
# or SHARED, and provides the relative paths to its source code.
# You can define multiple libraries, and CMake builds them for you.
# Gradle automatically packages shared libraries with your APK.
add_library(
        h264
        STATIC
        IMPORTED
)
#
set_target_properties(
        h264
        PROPERTIES IMPORTED_LOCATION
        ${CMAKE_SOURCE_DIR}/${JNI_LIBS_DIR}/${CMAKE_ANDROID_ARCH_ABI}/libx264.a
)

include_directories(src/main/cpp)

add_library(
        h264-encode
        SHARED
        src/main/cpp/h264-encode.cpp
)

add_library(
        native-lib
        SHARED
        src/main/cpp/native-lib.cpp
)

# Searches for a specified prebuilt library and stores the path as a
# variable. Because CMake includes system libraries in the search path by
# default, you only need to specify the name of the public NDK library
# you want to add. CMake verifies that the library exists before
# completing its build.

find_library( # Sets the name of the path variable.
              log-lib

              # Specifies the name of the NDK library that
              # you want CMake to locate.
              log )

# Specifies libraries CMake should link to your target library. You
# can link multiple libraries, such as libraries you define in this
# build script, prebuilt third-party libraries, or system libraries.

target_link_libraries( # Specifies the target library.
                       h264-encode
                       h264
                       # Links the target library to the log library
                       # included in the NDK.
                       ${log-lib} )
```

6. 在`X264Cmake`中添加加载二进制库，并添加编码方法。
![编码方法](/img/media/x264-android-encode.png)

这样就可以直接运行了，如果出现错误，可以参考[X264Cmake](https://github.com/AnJoiner/X264Cmake)

> 注意：
> `X264Cmake`项目中assets目录下`test.yuv`文件由于太大，所以无法上传，可在终端通过下面命令将任意视频转为YUV420格式的裸流。
```
ffmpeg -i input.mp4 test.yuv
```


这里可能就会有人问了：
不是说不使用FFmpeg了吗？你这里怎么还自己用上了？
<br><b>注意：上文说的是在APP中使用的时候</b>

<span style="text-decoration: underline;">还有一个地方需要注意，当我们把mp4的视频文件转为yuv的时候，视频体积会增大数十倍，打个比方：就是1M的mp4视频，转成yuv的视频裸流后，视频大小大概是几百M。
而且yuv只有视频数据，音频内容被去掉了</span>

## ndk-build
通过ndk-build的方式，直接编译成动态链接文件，可以直接放在`jniLibs`目录下以供使用，就行正常的时候引入二进制文件一样。不需要再创建原生项目，也不需要配置`CmakeLists.txt`文件。
![OK](/img/emoji/ok_nice_strong.jpg)

1. 在`x264`下创建一个build文件夹，然后进入`build`文件夹，在创建一个`jni`文件夹。

![创建build文件](/img/media/x264-ndk-build-dir.png)

2. 进入`jni`文件夹，将上面用到的几个文件拷贝进当前目录。
* x264.h
* x264_config.h
* h264-encode.cpp

3. 在`jni`目录下创建`prebuilt`文件夹，将`Cmake`方式中`nativeLibs`下的内容全部拷入。

![](/img/media/x264-ndk-prebuit.png)

4. 在`jni`目录下创建`Android.mk`文件，并添加如下内容。

```
LOCAL_PATH := $(call my-dir)


include $(CLEAR_VARS)
LOCAL_MODULE := h264
LOCAL_SRC_FILES := prebuilt/$(TARGET_ARCH_ABI)/lib/libx264.a
include $(PREBUILT_STATIC_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := h264-encode
LOCAL_SRC_FILES :=h264-encode.cpp
                

# LOCAL_C_INCLUDES := /home/relo/coder/android/plugins/FFmpegCommand/ffmpeg-4.2.1
LOCAL_C_INCLUDES := ./

LOCAL_LDLIBS := -llog -ljnigraphics -lz -landroid -lm -pthread -L$(SYSROOT)/usr/lib
LOCAL_STATIC_LIBRARIES := h264

include $(BUILD_SHARED_LIBRARY)
```

5. 在`jni`目录下创建`Application.mk`文件，并添加如下内容。

```
APP_ABI := armeabi-v7a arm64-v8a
APP_PLATFORM := android-21
APP_OPTIM := release
APP_STL := stlport_static
```

6. 最终`jni`目录如下

![](/img/media/x264-ndk-build-jni.png)

7. 激动人心的时候来到了，编译我们的动态链接库
使用`Terminal`进入`jni`目录。
```
// 执行ndk-build
~/Library/Android/sdk/ndk/android-ndk-r14b/ndk-build 
```
如果出现如下提示就表示成功，如果不成功请在下方评论区留言。

![](/img/media/x264-ndk-build-success.png)

并且在`build`目录下，会出现`obj`和`libs`两个文件，`libs`下装的就是最终编译成功的动态链接库。
![](/img/media/x264-ndk-build-libs.png)

> 注意：
> 使用方式与`Cmake`方式一样，需要创建在`com.coder.x264cmake`的包名下的`X264Encode`类中的`encode`的方法。通过调用`encode`方法才能使用。

## 验证

如果需要验证你通过H.264编码的视频是否正确，可以通过`VLC`播放器进行播放。

> https://www.videolan.org/vlc/

![](/img/media/x264-vlc-h264.png)

还可以通过导入`mp4parser`的方式将h264转为mp4

1. 在module下导入`mp4parser`

```groovy
implementation 'com.googlecode.mp4parser:isoparser:1.1.22'
```

2. 然后新增将h264转为mp4的Java代码即可

```java
private void h264ToMp4(){
    H264TrackImpl h264Track;
    try {
        h264Track = new H264TrackImpl(new FileDataSourceImpl(h264Path));
    } catch (IOException e) {
        e.printStackTrace();
        return;
    }
    Movie movie = new Movie();
    movie.addTrack(h264Track);

    Container mp4file = new DefaultMp4Builder().build(movie);

    FileChannel fc = null;
    try {
        fc = new FileOutputStream(new File(mp4Path)).getChannel();
        mp4file.writeContainer(fc);
        fc.close();
    } catch (IOException e) {
       e.printStackTrace();
    }
}
```


## 结尾

1. 以上就是就是编译`libx264`并在Android上使用的全过程，如果有不正确地方请指出。

2. 最后还是像开篇说的那样，需要用到的一些库的时候，我们再通过编译的方式进行添加，这样可以让你的APP更加健康。

你的鼓励是我的动力，感谢支持🙏🙏🙏


