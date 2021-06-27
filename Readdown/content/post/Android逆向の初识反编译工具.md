---
title: Android逆向-初识反编译工具
date: 2021-03-24 10:23:26
categories:
  - "android"
tags: ["逆向","反编译工具"]
thumbnail: /img/decompile/apktool_decode_apk.png
---

![](/img/decompile/apktool_decode_apk.png)
> 在不断对Android的学习过程中，我们常常肯定会想去研究一下那些大厂的代码是怎么写的，好不断的学习一些新的知识来让自己stronger。但是别人的代码都是打包好了的，怎么能够看得到呢？

<!--more-->

# 反编译伊始

什么叫做反编译？	
反编译就是将已编译好的程式还原到未编译的状态，也就是找出程序的源代码。

那怎么找出别人的代码呢？通常我们会用到3个工具

* Apktool	
* Dex2jar	
* Jd-Gui

下面我们就针对这三个工具进行介绍

# Apktool

Apktool是用来干嘛的？		
* 将资源文件还原成原始形式(9.png、AndroidManifest.xml)		
* 将Android的dex文件反编译为smali源码		
* 将反编译的资源重新编译成APK/JAR

所以Apktool不光能够拆解apk，还能加已经拆解的apk资源重新组装成apk。

## 安装Apktool

环境要求：JDK8

```
java --version // 验证是否安装jdk
```
Windows和MacOs安装JDK这里就不再赘述，可以查看此处[Win10安装JDK及配置环境变量的方法](https://blog.csdn.net/qq_35246620/article/details/61208961)和[Mac安装JDK及环境变量配置](https://www.jianshu.com/p/194531d106ae)。在Linux上可以使用如下命令进行安装

```
// ubuntu上安装方式
sudo apt-get install openjdk-8-jre
// centos 上安装方式
sudo yum install openjdk-8-jre
```

## Windows:	
1. 下载[apktool脚本](https://raw.githubusercontent.com/iBotPeaches/Apktool/master/scripts/windows/apktool.bat)并保存为apktool.bat，[【直接下载】](/tools/decompile/windows/apktool.bat)	
2. 下载[apktool工具](https://bitbucket.org/iBotPeaches/apktool/downloads/)并重命名保存为apktool.jar，[【直接下载】](/tools/decompile/windows/apktool.jar)		
3. 将`apktool.bat`和`apktool.jar`放在同一个文件夹下面(C://Windows)		
4. 如果你放的文件不是在(C://Windows)下需要进行配置环境变量	

## Linux：
1. 下载[apktool脚本](https://raw.githubusercontent.com/iBotPeaches/Apktool/master/scripts/linux/apktool)并保存为apktool，[【直接下载】](/tools/decompile/linux/apktool)	
2. 下载[apktool工具](https://bitbucket.org/iBotPeaches/apktool/downloads/)并重命名保存为apktool.jar，[【直接下载】](/tools/decompile/linux/apktool.jar)		
3. 将`apktool`和`apktool.jar`放在同一个文件夹下面`/usr/local/bin`	
```
sudo mv apktool /usr/local/bin
sudo mv apktool.jar /usr/local/bin
```
4. 给`apktool`和`apktool.jar`赋予可执行权限		
```
sudo chmod +x apktool
sudo chmod +x apktool.jar
```

## MacOs：
1. 下载[apktool脚本](https://raw.githubusercontent.com/iBotPeaches/Apktool/master/scripts/osx/apktool)并保存为apktool，[【直接下载】](/tools/decompile/macos/apktool)	
2. 下载[apktool工具](https://bitbucket.org/iBotPeaches/apktool/downloads/)并重命名保存为apktool.jar，[【直接下载】](/tools/decompile/macos/apktool.jar)		
3. 将`apktool`和`apktool.jar`放在同一个文件夹下面`/usr/local/bin`
```
sudo mv apktool /usr/local/bin
sudo mv apktool.jar /usr/local/bin
```
4. 给`apktool`和`apktool.jar`赋予可执行权限		
```
sudo chmod +x apktool
sudo chmod +x apktool.jar
```

## 使用Apktool

使用就比较简单了，直接执行如下命令就可以进行反编译
```
apktool d bar.apk //直接解码
apktool d bar.apk -o baz //解码到baz的文件夹中
```

![apktool反编译过程](/img/decompile/apktool_decode_apk.png)

![apktool反编译结果](/img/decompile/apktool_decode_result.png)

Apktool既然能够进行反编译，那也能重新编译成Apk文件
```
apktool b bar // 在父目录执行building
apktool b . // 在当前bar目录执行building
apktool b bar -o new_bar.apk //  在父目录执行building并生成名为new_bar的apk文件
```
生成的文件就在/dist下		
![apktool重新编译结果](/img/decompile/apktool_build_result.png)

## 有什么用？

使用`apktool`大概有如下作用:	
* 查看AndroidManifest文件内容，知道每一个Activity的绝对路径，方便后面查看代码快速定位		
* 拿到完整的资源文件(assest、drawable、resouces...目录下的文件)		
* 如果我们熟悉smali语法的话，还可以将别人的代码进行修改然后重新打包成apk（比如破解会员验证），在后期的更新文章中会逐步为大家解答。

通过如上方法，我们就破解了一个简单的APK，但是仍然有一个问题：我想看源代码怎么办？这就需要使用Dex2jar和Jd-Gui了。

# Dex2jar

这个工具有什么用呢？其实从名字上就可以知道，它的作用就是将dex文件转成jar。

为什么要转成jar呢？		
这个其实是方便我们通过Jd-Gui进行查看代码了~		

## 安装

1. 可通过[dex2jar-github](https://github.com/pxb1988/dex2jar/releases)进行下载，当然也可以通过本站提供[下载链接](/tools/decompile/dex-tools-2.1-SNAPSHOT.zip)进行下载

2. 将下载的压缩包进行解压，大致目录如下，其中`d2j-dex2jar.bat`供Windows使用，而`d2j-dex2jar.sh`供Linux和MacOs使用

![dex2jar工具目录](/img/decompile/dex2jar_pkg.png)


## 使用

环境要求：JDK7以上
安装方式在上方已有介绍

```shell
// For Linux, Mac OSX, Cygwin
sh /home/panxiaobo/dex2jar-version/d2j-dex2jar.sh /home/panxiaobo/bar.apk
// For Windows
C:\dex2jar-version\d2j-dex2jar.bat bar.apk
```
执行完如上命令后就会在apk旁边生成一个jar文件，接下来就是通过工具查看jar文件里面的java代码了。查看代码的工具有很多，大概有如下：
* [Jd-Gui](http://java-decompiler.github.io/)
* [JAD](https://varaneckas.com/jad/)
* [Procyon](https://github.com/mstrobel/procyon)

# Jd-Gui

我们这里使用这个工具来查看源代码，因为它比较方便：开箱即用

## 安装以及使用
可用通过[官网](http://java-decompiler.github.io/)进行下载，也可以使用本站提供的下载地址进行下载
* [Windows-jd-gui](/tools/decompile/windows/jd-gui-1.6.6.jar) 、 [Windows-jd-gui-mini](/tools/decompile/windows/jd-gui-1.6.6-mini.jar)
* [Linux-deb-jd-gui](/tools/decompile/linux/jd-gui-1.6.6.deb) 、 [Linux-rpm-jd-gui](/tools/decompile/linux/jd-gui-1.6.6.rpm)
* [MacOS-jd-gui](/tools/decompile/macos/jd-gui-osx-1.6.6.tar)

![jd-gui可下载列表](/img/decompile/jd-gui_installer.png)

安装成功之后打开Jd-Gui，然后dex2jar生成的jar文件拖入进去，就可以查看代码了，是不是超简单~~

![jd-gui查看源码](/img/decompile/jd-gui_open_file.png)

看了这么多，你不亲自动手练习一下吗？
