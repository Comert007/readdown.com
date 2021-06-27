---
title: FFmpeg编译4.1.4并移植到Android
date: 2019-08-02 08:00:00
categories:
  - "ffmpeg"
tags: ["ffmpeg","编译"]
thumbnail: /img/ffmpeg/ffmpeg-build-copy2.png
---

> 在我们开发音视频的过程中，总是避免不了对音视频的操作，对音视频的操作最常用的就是`FFmpeg`了，但是有一个问题就是不能直接使用，所以得进行编译才能在移动端使用，下面就给大家介绍如何在`Android`中编译`FFmpeg`．

<!--more-->

## Android 编译FFmpeg

我们编译FFmpeg一般在Linux的系统上进行编译，当然windows也是可以的，这里讲解一下在Linux系统上编译。

1. 从官网下载[FFmpeg](http://ffmpeg.org/)（文档编辑时版本 ffmpeg-4.1.4）
2. 将下载下来的`ffmpeg`进行解压
3. 去Android官网下载[ndk](https://developer.android.google.cn/ndk/downloads/older_releases.html)（文档编辑时版本 ndk-14b）
4. 进入已解压的`ffmpeg`文件目录，修改`configure`文件




```
SLIBNAME_WITH_MAJOR='$(SLIBNAME).$(LIBMAJOR)'
LIB_INSTALL_EXTRA_CMD='$$(RANLIB) "$(LIBDIR)/$(LIBNAME)"'
SLIB_INSTALL_NAME='$(SLIBNAME_WITH_VERSION)'
SLIB_INSTALL_LINKS='$(SLIBNAME_WITH_MAJOR) $(SLIBNAME)'
```
替换成
```
SLIBNAME_WITH_MAJOR='$(SLIBPREF)$(FULLNAME)-$(LIBMAJOR)$(SLIBSUF)'
LIB_INSTALL_EXTRA_CMD='$$(RANLIB)"$(LIBDIR)/$(LIBNAME)"'
SLIB_INSTALL_NAME='$(SLIBNAME_WITH_MAJOR)'
SLIB_INSTALL_LINKS='$(SLIBNAME)'
```

5. 编写build_android.sh的可执行文件

```
#!/bin/bash
# 清空上次的编译
make clean
#你自己的NDK路径.
export NDK=/home/anjoiner/Documents/AnJoiner/ffmpeg/ndk
function build_android
{
echo "Compiling FFmpeg for $CPU"
./configure \
    --prefix=$PREFIX \
    --enable-neon \
    --enable-hwaccels \
    --enable-gpl \
    --enable-postproc \
    --enable-shared \
    --enable-jni \
    --enable-mediacodec \
    --enable-decoder=h264_mediacodec \
    --disable-static \
    --disable-doc \
    --enable-ffmpeg \
    --disable-ffplay \
    --disable-ffprobe \
    --enable-avdevice \
    --disable-doc \
    --disable-symver \
    --cross-prefix=$CROSS_PREFIX \
    --target-os=android \
    --arch=$ARCH \
    --cpu=$CPU \
    --enable-cross-compile \
    --sysroot=$SYSROOT \
    --extra-cflags="-Os -fpic $OPTIMIZE_CFLAGS" \
    --extra-ldflags="$ADDI_LDFLAGS" \
    $ADDITIONAL_CONFIGURE_FLAG
make clean
make
make install
echo "The Compilation of FFmpeg for $CPU is completed"
}

#armv8-a
ARCH=arm64
CPU=armv8-a
TOOLCHAIN=$NDK/toolchains/aarch64-linux-android-4.9/prebuilt/linux-x86_64
SYSROOT=$NDK/platforms/android-21/arch-$ARCH/
CROSS_PREFIX=$TOOLCHAIN/bin/aarch64-linux-android-
PREFIX=$(pwd)/android/$CPU
OPTIMIZE_CFLAGS="-march=$CPU"
build_android

#armv7-a
ARCH=arm
CPU=armv7-a
TOOLCHAIN=$NDK/toolchains/arm-linux-androideabi-4.9/prebuilt/linux-x86_64
SYSROOT=$NDK/platforms/android-21/arch-$ARCH/
CROSS_PREFIX=$TOOLCHAIN/bin/arm-linux-androideabi-
PREFIX=$(pwd)/android/$CPU
OPTIMIZE_CFLAGS="-mfloat-abi=softfp -mfpu=vfp -marm -march=$CPU "
build_android

#x86
ARCH=x86
CPU=x86
TOOLCHAIN=$NDK/toolchains/x86-4.9/prebuilt/linux-x86_64
SYSROOT=$NDK/platforms/android-21/arch-$ARCH/
CROSS_PREFIX=$TOOLCHAIN/bin/i686-linux-android-
PREFIX=$(pwd)/android/$CPU
OPTIMIZE_CFLAGS="-march=i686 -mtune=intel -mssse3 -mfpmath=sse -m32"
build_android

#x86_64
ARCH=x86_64
CPU=x86-64
TOOLCHAIN=$NDK/toolchains/x86_64-4.9/prebuilt/linux-x86_64
SYSROOT=$NDK/platforms/android-21/arch-$ARCH/
CROSS_PREFIX=$TOOLCHAIN/bin/x86_64-linux-android-
PREFIX=$(pwd)/android/$CPU
OPTIMIZE_CFLAGS="-march=$CPU -msse4.2 -mpopcnt -m64 -mtune=intel"
build_android
```

注意：当执行`./build_android.sh`的时候，出现权限不足，那么一定要给这个文件添加可执行权限

```
chmod 777 build_android.sh
```

这样就可以进行编译生成Android下的`ffmpeg`

如果在编译的时候出现如下问题：
```
ffbuild/common.mak:60: recipe for target 'libavformat/udp.o' failed
make: *** [libavformat/udp.o] Error 1
```

将`libavformat/udp.c` 第290~295行进行注释

```
//         mreqs.imr_multiaddr.s_addr = ((struct sockaddr_in *)addr)->sin_addr.s_addr;
//         if (local_addr)
//             mreqs.imr_interface= ((struct sockaddr_in *)local_addr)->sin_addr;
//         else
//             mreqs.imr_interface.s_addr= INADDR_ANY;
//         mreqs.imr_sourceaddr.s_addr = ((struct sockaddr_in *)&sources[i])->sin_addr.s_addr;
```

这样之后，基本就是ok的，在我们`ffmpeg`的文件夹下，会生成一个`ffmpeg/android/armv7-a`的文件目录，里面内容如下：

![](https://user-gold-cdn.xitu.io/2019/8/2/16c51b53b0a70d26?w=966&h=486&f=png&s=32269)

## 将编译后的ffmpeg移植到Android

### 准备

* 在任何地方新建一个`jni`的文件夹。 
* 将我们刚刚编译的`ffmpeg/android/armv7-a/include`下的所有文件拷贝进入`jni`文件夹。  
* 在`jni`下新建一个`prebuilt`的文件夹，将`ffmpeg/android/armv7-a/lib`下的so文件全部拷贝到`prebuilt`之下。 
* 然后将`ffmpeg/fftools`文件下的如下文件拷贝进入`jni`    
   *  cmdutils.c 
   *  cmdutils.h 
   *  config.h 
   *  ffmpeg_filter.c
   *  ffmpeg_hw.c
   *  ffmpeg_opt.c
   *  ffmpeg.c
   *  ffmpeg.h

### 修改ffmpeg文件

* 修改刚刚拷贝的`ffmpeg.c`文件，找到`int main(int argc, char **argv)`函数，将其替换为`int run(int argc, char **argv)`   
* 在修改后的`run(int argc, char **argv)` 末尾（retrun 之前）加上如上如下代码：
```
nb_filtergraphs = 0;
progress_avio = NULL;

input_streams = NULL;
nb_input_streams = 0;
input_files = NULL;
nb_input_files = 0;

output_streams = NULL;
nb_output_streams = 0;
output_files = NULL;
nb_output_files = 0;
```
* 并在`ffmpeg.h`文件末尾加上
```
int run(int argc, char **argv)；
```

* 再次打开`ffmpeg.c`文件，注释掉`run(int argc, char **argv)`下的所有`exit_program`函数，大致代码如下：
```
int run(int argc, char **argv)
{
    int i, ret;
    BenchmarkTimeStamps ti;

    init_dynload();

    register_exit(ffmpeg_cleanup);

    setvbuf(stderr,NULL,_IONBF,0); /* win32 runtime needs this */

    av_log_set_flags(AV_LOG_SKIP_REPEATED);
    parse_loglevel(argc, argv, options);

    if(argc>1 && !strcmp(argv[1], "-d")){
        run_as_daemon=1;
        av_log_set_callback(log_callback_null);
        argc--;
        argv++;
    }

#if CONFIG_AVDEVICE
    avdevice_register_all();
#endif
    avformat_network_init();

    show_banner(argc, argv, options);

    /* parse options and open all input/output files */
    ret = ffmpeg_parse_options(argc, argv);
    if (ret < 0);
        // exit_program(1);

    if (nb_output_files <= 0 && nb_input_files == 0) {
        show_usage();
        av_log(NULL, AV_LOG_WARNING, "Use -h to get full help or, even better, run 'man %s'\n", program_name);
        // exit_program(1);
    }

    /* file converter / grab */
    if (nb_output_files <= 0) {
        av_log(NULL, AV_LOG_FATAL, "At least one output file must be specified\n");
        // exit_program(1);
    }

//     if (nb_input_files == 0) {
//         av_log(NULL, AV_LOG_FATAL, "At least one input file must be specified\n");
//         exit_program(1);
//     }

    for (i = 0; i < nb_output_files; i++) {
        if (strcmp(output_files[i]->ctx->oformat->name, "rtp"))
            want_sdp = 0;
    }

    current_time = ti = get_benchmark_time_stamps();
    if (transcode() < 0);
        // exit_program(1);
    if (do_benchmark) {
        int64_t utime, stime, rtime;
        current_time = get_benchmark_time_stamps();
        utime = current_time.user_usec - ti.user_usec;
        stime = current_time.sys_usec  - ti.sys_usec;
        rtime = current_time.real_usec - ti.real_usec;
        av_log(NULL, AV_LOG_INFO,
               "bench: utime=%0.3fs stime=%0.3fs rtime=%0.3fs\n",
               utime / 1000000.0, stime / 1000000.0, rtime / 1000000.0);
    }
    av_log(NULL, AV_LOG_DEBUG, "%"PRIu64" frames successfully decoded, %"PRIu64" decoding errors\n",
           decode_error_stat[0], decode_error_stat[1]);
    if ((decode_error_stat[0] + decode_error_stat[1]) * max_error_rate < decode_error_stat[1]);
        // exit_program(69);

    // exit_program(received_nb_signals ? 255 : main_return_code);

     nb_filtergraphs = 0;
     progress_avio = NULL;

     input_streams = NULL;
     nb_input_streams = 0;
     input_files = NULL;
     nb_input_files = 0;

     output_streams = NULL;
     nb_output_streams = 0;
     output_files = NULL;
     nb_output_files = 0;
    

    return main_return_code;
}
```
### 新建ffmpeg-invoke

在`jni`文件下新建一个`ffmpeg-invoke.cpp`的c++文件，将如下代码写入

```
#include <jni.h>
#include <string.h>
#include "android/log.h"

#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, "ffmpeg-invoke", __VA_ARGS__)

extern "C"{
#include "ffmpeg.h"
#include "libavcodec/jni.h"
}

extern "C"
JNIEXPORT jint JNICALL
Java_com_coder_ffmpeg_jni_FFmpegCmd_run(JNIEnv *env, jclass type, jint cmdLen,
                                             jobjectArray cmd) {
    //set java vm
    JavaVM *jvm = NULL;
    env->GetJavaVM(&jvm);
    av_jni_set_java_vm(jvm, NULL);

    char *argCmd[cmdLen] ;
    jstring buf[cmdLen];

    for (int i = 0; i < cmdLen; ++i) {
        buf[i] = static_cast<jstring>(env->GetObjectArrayElement(cmd, i));
        char *string = const_cast<char *>(env->GetStringUTFChars(buf[i], JNI_FALSE));
        argCmd[i] = string;
        LOGD("argCmd=%s",argCmd[i]);
    }

    int retCode = run(cmdLen, argCmd);
    LOGD("ffmpeg-invoke: retCode=%d",retCode);

    return retCode;

}
```

需注意的是 `Java_com_coder_ffmpeg_jni_FFmpegCmd_run` 中 `com_coder_ffmpeg_jni`表示`FFmpegCmd`所在你Android项目的位置。


### 新建Android.mk

在`jni`文件夹下，新建`Android.mk`的文件，将如下代码拷贝，但是需要注意的是将 `LOCAL_C_INCLUDES`路径替换成你源码所在位置。

```
// 将此处的路径改为你ffmepg源码所在位置
LOCAL_C_INCLUDES := /home/anjoiner/Documents/AnJoiner/ffmpeg
```

```
LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)
LOCAL_MODULE :=  libavdevice
LOCAL_SRC_FILES := prebuilt/libavdevice.so
include $(PREBUILT_SHARED_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE :=  libavutil
LOCAL_SRC_FILES := prebuilt/libavutil.so
include $(PREBUILT_SHARED_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE :=  libswresample
LOCAL_SRC_FILES := prebuilt/libswresample.so
include $(PREBUILT_SHARED_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE :=  libswscale
LOCAL_SRC_FILES := prebuilt/libswscale.so
include $(PREBUILT_SHARED_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := libavcodec
LOCAL_SRC_FILES := prebuilt/libavcodec.so
include $(PREBUILT_SHARED_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := libavformat
LOCAL_SRC_FILES := prebuilt/libavformat.so
include $(PREBUILT_SHARED_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := libavfilter
LOCAL_SRC_FILES := prebuilt/libavfilter.so
include $(PREBUILT_SHARED_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := libpostproc
LOCAL_SRC_FILES := prebuilt/libpostproc.so
include $(PREBUILT_SHARED_LIBRARY)


include $(CLEAR_VARS)
LOCAL_MODULE := ffmpeg-invoke

LOCAL_SRC_FILES :=ffmpeg-invoke.cpp \
                 cmdutils.c \
                 ffmpeg_filter.c \
                 ffmpeg_opt.c \
                 ffmpeg_hw.c \
                 ffmpeg.c

// 将此处的路径改为你ffmepg源码所在位置
LOCAL_C_INCLUDES := /home/anjoiner/Documents/AnJoiner/ffmpeg

LOCAL_LDLIBS := -llog -ljnigraphics -lz -landroid -lm -pthread -L$(SYSROOT)/usr/lib
LOCAL_SHARED_LIBRARIES := libavdevice libavcodec libavfilter libavformat libavutil libswresample libswscale libpostproc

include $(BUILD_SHARED_LIBRARY)
```

### 新建Application.mk
在`jni`文件夹下，新建Application.mk并将如下代码拷贝进入

```
APP_ABI := armeabi-v7a
APP_PLATFORM := android-21
APP_OPTIM := release
APP_STL := stlport_static
```

![](https://user-gold-cdn.xitu.io/2019/8/2/16c51b6b3b271d36?w=1167&h=627&f=png&s=120251)

到此基本上的配置已经完成，然后在`jni`文件下运行`ndk-build`
```
/home/anjoiner/Documents/AnJoiner/build/jni# /home/anjoiner/Documents/AnJoiner/ffmpeg/ndk/ndk-build
```

当出现如下代码就表示成功了

```
[armeabi-v7a] SharedLibrary  : libffmpeg-invoke.so
[armeabi-v7a] Install        : libffmpeg-invoke.so => libs/armeabi-v7a/libffmpeg-invoke.so
[armeabi-v7a] Install        : libpostproc.so => libs/armeabi-v7a/libpostproc.so
[armeabi-v7a] Install        : libswresample.so => libs/armeabi-v7a/libswresample.so
[armeabi-v7a] Install        : libswscale.so => libs/armeabi-v7a/libswscale.so
```

## 测试
* 新建一个支持C++项目，注意包名需是上述`ava_com_coder_ffmpeg_jni_FFmpegCmd_run`中的`com.coder.ffmpeg`。
* 在`jni`的同级目录下，会生成一个`libs`的目录，将这个目录下的`armeabi-v7a`文件拷贝到你所在的Android项目中的`app/src/main/jniLibs`下
* 新建一个jni的文件目录，在此目录下新建一个`FFmpegCmd`
```
/**
 * @author: AnJoiner
 * @datetime: 19-7-30
 */
public class FFmpegCmd {
    static {
        System.loadLibrary("avdevice");
        System.loadLibrary("avutil");
        System.loadLibrary("avcodec");
        System.loadLibrary("swresample");
        System.loadLibrary("avformat");
        System.loadLibrary("swscale");
        System.loadLibrary("avfilter");
        System.loadLibrary("postproc");
        System.loadLibrary("ffmpeg-invoke");
    }

    private static native int run(int cmdLen, String[] cmd);

    public static int runCmd(String[] cmd){
        return run(cmd.length,cmd);
    }
}

```

拷贝进来`run`方法名会出现红色，不用管他,

* 在我们的`MainActivity`中进行调用，此方法是将音频进行剪切

```
public class MainActivity extends AppCompatActivity {

    // Used to load the 'native-lib' library on application startup.
    static {
        System.loadLibrary("native-lib");
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE},
                    100);
        }

        // Example of a call to a native method
        TextView tv = findViewById(R.id.sample_text);
        tv.setText(stringFromJNI());

        findViewById(R.id.btn_test).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                ffmpegTest();
            }
        });
    }

    /**
     * A native method that is implemented by the 'native-lib' native library,
     * which is packaged with this application.
     */
    public native String stringFromJNI();


    private void ffmpegTest() {
        new Thread() {
            @Override
            public void run() {
                long startTime = System.currentTimeMillis();
                String input =
                        Environment.getExternalStorageDirectory().getPath() + File.separator +
                                "DCIM" + File.separator + "test.mp3";
                String output =
                        Environment.getExternalStorageDirectory().getPath() + File.separator +
                                "DCIM" + File.separator + "output.mp3";

                String cmd = "ffmpeg -y -i %s -vn -acodec copy -ss %s -t %s %s";
                String result = String.format(cmd, input, "00:00:30", "00:00:40", output);
                FFmpegCmd.runCmd(result.split(" "));
                Log.d("FFmpegTest", "run: 耗时：" + (System.currentTimeMillis() - startTime));
            }
        }.start();


    }
```

如果上述步骤不出错，基本没什么问题，在资料的参考下，我也弄了好几天，但幸好结果还是好的～


## 使用 NDK-r20 编译FFmpeg
前面使用过老版本`NDK-r14b`编译`FFmpeg`，其实质是通过gcc去进行编译，但是最新的NDK版本中已经不使用gcc去编译，而是使用clang去进行编译．这里贴上最新配置文件代码

* 下载最新版本[NDK-r20](https://developer.android.com/ndk/downloads?hl=zh-cn)
* 下载[FFmpeg-4.2.1](https://www.ffmpeg.org/download.html#releases)

```
#!/bin/bash
# 清空上次的编译
make clean
#你自己的NDK路径.
export NDK=/home/anjoiner/Android/Sdk/ndk-bundle
TOOLCHAIN=$NDK/toolchains/llvm/prebuilt/linux-x86_64/
API=29

function build_android
{
echo "Compiling FFmpeg for $CPU"
./configure \
    --prefix=$PREFIX \
    --enable-neon \
    --enable-hwaccels \
    --enable-gpl \
    --enable-postproc \
    --enable-shared \
    --enable-jni \
    --enable-mediacodec \
    --enable-decoder=h264_mediacodec \
    --disable-static \
    --disable-doc \
    --enable-ffmpeg \
    --disable-ffplay \
    --disable-ffprobe \
    --enable-avdevice \
    --disable-doc \
    --disable-symver \
    --cross-prefix=$CROSS_PREFIX \
    --target-os=android \
    --arch=$ARCH \
    --cpu=$CPU \
    --cc=$CC
    --cxx=$CXX
    --enable-cross-compile \
    --sysroot=$SYSROOT \
    --extra-cflags="-Os -fpic $OPTIMIZE_CFLAGS" \
    --extra-ldflags="$ADDI_LDFLAGS" \
    $ADDITIONAL_CONFIGURE_FLAG
make clean
make 
make install
echo "The Compilation of FFmpeg for $CPU is completed"
}

#armv8-a
ARCH=arm64
CPU=armv8-a
CC=$TOOLCHAIN/bin/aarch64-linux-android$API-clang
CXX=$TOOLCHAIN/bin/aarch64-linux-android$API-clang++
SYSROOT=$NDK/toolchains/llvm/prebuilt/linux-x86_64/sysroot
CROSS_PREFIX=$TOOLCHAIN/bin/aarch64-linux-android-
PREFIX=$(pwd)/android/$CPU
OPTIMIZE_CFLAGS="-march=$CPU"
build_android

#armv7-a
ARCH=arm
CPU=armv7-a
CC=$TOOLCHAIN/bin/armv7a-linux-androideabi$API-clang
CXX=$TOOLCHAIN/bin/armv7a-linux-androideabi$API-clang++
SYSROOT=$NDK/toolchains/llvm/prebuilt/linux-x86_64/sysroot
CROSS_PREFIX=$TOOLCHAIN/bin/arm-linux-androideabi-
PREFIX=$(pwd)/android/$CPU
OPTIMIZE_CFLAGS="-mfloat-abi=softfp -mfpu=vfp -marm -march=$CPU "
build_android

#x86
ARCH=x86
CPU=x86
CC=$TOOLCHAIN/bin/i686-linux-android$API-clang
CXX=$TOOLCHAIN/bin/i686-linux-android$API-clang++
SYSROOT=$NDK/toolchains/llvm/prebuilt/linux-x86_64/sysroot
CROSS_PREFIX=$TOOLCHAIN/bin/i686-linux-android-
PREFIX=$(pwd)/android/$CPU
OPTIMIZE_CFLAGS="-march=i686 -mtune=intel -mssse3 -mfpmath=sse -m32"
build_android

#x86_64
ARCH=x86_64
CPU=x86-64
CC=$TOOLCHAIN/bin/x86_64-linux-android$API-clang
CXX=$TOOLCHAIN/bin/x86_64-linux-android$API-clang++
SYSROOT=$NDK/toolchains/llvm/prebuilt/linux-x86_64/sysroot
CROSS_PREFIX=$TOOLCHAIN/bin/x86_64-linux-android-
PREFIX=$(pwd)/android/$CPU
OPTIMIZE_CFLAGS="-march=$CPU -msse4.2 -mpopcnt -m64 -mtune=intel"
build_android
```

## 参考资料
[编译FFmpeg4.1.3并移植到Android app中使用（最详细的FFmpeg-Android编译教程）](https://blog.csdn.net/bobcat_kay/article/details/80889398)
