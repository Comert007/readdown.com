---
title: Flutter(一)-你入门了没？
date: 2019-03-03 08:00:00
categories:
  - "android"
  - "flutter"
tags: ["flutter"]
thumbnail: /img/top/basic-media.png
---


> 距离Google发布Flutter已经有很长一段时间了，又是一门新的技术，那么我们到底是学呢还是学呢还是学呢？不要问我，我不知道，鬼特么知道我这辈子还要学习多少东西。其实新技术的出现也意味着，老技术会面临淘汰危机，而你将面临着失业危机。用一句话来说：你永远不知道意外和惊喜哪个先来~~

<!--more-->

## 环境搭建

Flutter的安装就不在这里演示了，可以从下面几个网站上学习安装。
* [Flutter官网](https://flutter.dev/)
* [Flutter中文网](https://flutterchina.club/) 
* [Flutter社区](https://flutter-io.cn/docs/get-started/install)

这些网站也通过丰富的`Flutter`学习资料

## Flutter的第一个应用
在创建一个`Flutter`应用后，我们可以看到如下的demo代码。（其中注释是个人翻译，如有不正确请谅解）
```java
import 'package:flutter/material.dart';

//应用启动
void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  // 这个App的根Widget
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo', //应用名
      theme: ThemeData(
        // 这个应用的主题
        //
        // 你用 "flutter run"运行这个应用，你将看到一个蓝色的ToolBar。
        // 你也可以改变下面primarySwatch 的值，从Colors.blue变成 Colors.green。
        // 然后执行 "hot reload" ，可以看到计数器并没有恢复初始状态0，这个应用也并没有重启。
        primarySwatch: Colors.blue,
      ),
      home: MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  MyHomePage({Key key, this.title}) : super(key: key);

  // 我们可以知道这个MyHomePage 的 widget 是这个应用的首页，而且它是有状态的，
  //这就意味着下面定义的State对象中的字段能够影响应用的显示。

 //这个类是这个状态的配置类，它所持有的这个title值是其父类提供的，
 //被创建状态的方法使用，在Widget的子类中总是被标记为“final”

  final String title;

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      // 回调setState去告诉Flutter framework 已经有一些状态发生了改变，
      // 让下面这个返回Widget的build方法去展示更新的内容。当然，如果我们没有回调
      // 这个setState，那么build方法也不会被调用，也就不会有什么更新展示。
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    // 这个方法在每次setState的时候被调用，例如上面的_incrementCounter方法。
    //
    // Flutter framework 是被优化过的，所以它的重新运行build方法是非常快速的，只需要
    // 运行你需要更新的内容，不需要去分别所有的widgets的实例。
    return Scaffold(
      appBar: AppBar(
        // 我们能够使用在App.build方法中创建的值，并且赋值
        // Here we take the value from the MyHomePage object that was created by
        // the App.build method, and use it to set our appbar title.
        title: Text(widget.title),
      ),
      body: Center(
        // Center是一个布局Widget，它提供一个child 并且规定了只能居于父类的正中心
        child: Column(
          // Column 也是一个布局Widget，它有一系列的子布局并且这些子布局都是垂直方向的。
          // 默认情况下，Column会调整它自己的大小去适应子级的横向大小。
          //
          // 调用 "debug painting"可以看每一个widget的线框
          //
          // Column 有大量的属性去控制自己的大小和它子级的位置，这里使用了mainAxisAlignment
          // 让其子布局内容是垂直方向排列。
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(
              'You have pushed the button this many times:',
            ),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.display1,
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: Icon(Icons.add),
      ), // This trailing comma makes auto-formatting nicer for build methods.
    );
  }
}

```
### 运行Flutter
> 我使用的是`Android Studio` 创建的`Flutter`应用，可以看到如下所示的编译界面

![图片来自网络](https://user-gold-cdn.xitu.io/2019/3/3/16942a8bec851ea7?w=862&h=190&f=png&s=29763)
* 点击`Run` （就是那个绿色的三角）之后我们可以看到如下运行结果：

![](https://user-gold-cdn.xitu.io/2019/3/3/16942a8be8716350?w=350&h=623&f=png&s=12616)
* 点击蓝色的`“+” `号我们可以看到，中间的数字一直在增加，所以demo给我的是一个简单计数器的实现

## Demo分析
我们从官网知道`Flutter`是用`Dart`语言进行编码的，我们是不是需要单独去学习掌握这门语言呢？在我看来是不需要的，因为单独去学习一门新的语言的过程是很枯燥的，我们可以从Demo中去学习，这样更高效一些。所以我们来分析一下上述例子给了我们一个怎样的知识点。
```java
import 'package:flutter/material.dart';

void main() => runApp(MyApp());
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}
```
通过上述代码我们知道：
* 首先导入了一个叫做`material`的`dart`文件。
* 通过一个`main()`方法调用了`MyApp`的一个类。
* 这个MyApp就是这个应用的入口。（根据`runApp`可知）

对于一个Flutter小白就会有疑问了：
* 为什么要导入`material`的文件呢?
遇到这样不明白的地方，我们就可以去官网查资料了，官网给的回答如下：

***
Flutter提供了许多`widgets`，可帮助您构建遵循`Material Design`的应用程序。Material应用程序以`MaterialApp` widget开始， 该widget在应用程序的根部创建了一些有用的widget，其中包括一个Navigator， 它管理由字符串标识的Widget栈（即页面路由栈）。Navigator可以让您的应用程序在页面之间的平滑的过渡。 是否使用MaterialApp完全是可选的，但是使用它是一个很好的做法。
***
也就是说主要是为了向开发者提供已经实现好了的`material`设计风格，我们可以进入（Windows下`Ctrl +鼠标左键`，Mac下`Command+鼠标左键` ）`material.dart`源码，可以发现如下：

```java
library material;

export 'src/material/about.dart';
export 'src/material/animated_icons.dart';
...
// 很多，这里就不占用大量篇幅
export 'widgets.dart';
```
从官网我们知道已经有大量的`widgets`供给我们使用，那么这些在哪里呢？
当然就是上面的`widgets.dart`文件了，我们进入这个文件中可以看到内容大致如下：
```java
export 'src/widgets/animated_cross_fade.dart';
...
export 'src/widgets/framework.dart';
...
export 'src/widgets/will_pop_scope.dart';
```
也是不同的`dart`文件，我们进入第一个`animated_cross_fade`：
```java
class AnimatedCrossFade extends StatefulWidget {
/// Creates a cross-fade animation widget.
	...
}
```
从给的注释可以知道，这就是一个带淡入淡出动画的`Widget`，这个`Widget`继承自`StatefulWidget `，可以看到`StatefulWidget`也就是继承自`Widget`
```java
abstract class StatelessWidget extends Widget {
  /// Initializes [key] for subclasses.
  const StatelessWidget({ Key key }) : super(key: key);

  /// Creates a [StatelessElement] to manage this widget's location in the tree.
  ///
  /// It is uncommon for subclasses to override this method.
  @override
  StatelessElement createElement() => StatelessElement(this);

  @protected
  Widget build(BuildContext context);
}


abstract class StatefulWidget extends Widget {
  /// Initializes [key] for subclasses.
  const StatefulWidget({ Key key }) : super(key: key);

  /// Creates a [StatefulElement] to manage this widget's location in the tree.
  ///
  /// It is uncommon for subclasses to override this method.
  @override
  StatefulElement createElement() => StatefulElement(this);
  @protected
  State createState();
}
```
到此我们惊奇的发现，Demo代码中的`MyApp`继承的`StatelessWidget`原来也在这里，但是`MyHomePage `却继承自`StatefulWidget `，这是为什么呢？这就会引出第二个问题：
* `StatelessWidget`和`StatefulWidget` 的区别是什么呢？
***
`StatefulWidget`可以拥有状态，这些状态在widget生命周期中是可以变的，而`StatelessWidget`是不可变的。
`StatefulWidget`至少由两个类组成：

* 一个StatefulWidget类。
* 一个 State类； StatefulWidget类本身是不变的，但是 State类中持有的状态在widget生命周期中可能会发生变化。

`StatelessWidget`用于不需要维护状态的场景，它通常在build方法中通过嵌套其它`Widget`来构建UI，在构建过程中会递归的构建其嵌套的`Widget`
***
这也就是为什么MyApp是继承自`StatelessWidget` 而 MyHomePage 继承自`StatefulWidget`:
 * MyApp中不需要更改状态，仅仅嵌套一个MyHomePage 的`Widget`
 * 而MyHomePage 要继承`StatefulWidget`的原因是：通过点击`+`去增加数字大小，改变了显示的状态，所以需要继承`StatefulWidget`。

### 分析执行方式
我们回到 MyApp这个类的`build`方法中，可以看到它返回了一个`MaterialApp`的一个Widget，在前面说过，Material Design的应用是以`MaterialApp` widget开始的，所以返回了一个`MaterialApp`
```java
return MaterialApp(
      title: 'Flutter Demo', //应用名
      theme: ThemeData(
        primarySwatch: Colors.blue, // 主题色
      ),
      home: MyHomePage(title: 'Flutter Demo Home Page'), // 首页
    );
```
从上可以知道由于计数是一个可变的更新状态，那么就需要两个类去实现：
* 一个继承自`StatefulWidget`, 就是我们的`MyHomePage`
* 一个继承自`State`用于维护这个状态，也就是我们的`_MyHomePageState `

```java
class MyHomePage extends StatefulWidget {
  MyHomePage({Key key, this.title}) : super(key: key);

  // 我们可以知道这个MyHomePage 的 widget 是这个应用的首页，而且它是有状态的，
  //这就意味着下面定义的State对象中的字段能够影响应用的显示。

 //这个类是这个状态的配置类，它所持有的这个title值是其父类提供的，
 //被创建状态的方法使用，在Widget的子类中总是被标记为“final”

  final String title;

  @override
  _MyHomePageState createState() => _MyHomePageState();
}
```
`MyHomePage `这个类里面没有太多内容：
* 通过构造方法将title值传入
* 通过`createState` 返回了一个`_MyHomePageState `的有状态的`State`

到此处我们知道了实际上对数据的操作肯定就在`_MyHomePageState`中：
```java
class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      // 回调setState去告诉Flutter framework 已经有一些状态发生了改变，
      // 让下面这个返回Widget的build方法去展示更新的内容。当然，如果我们没有回调
      // 这个setState，那么build方法也不会被调用，也就不会有什么更新展示。
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    // 这个方法在每次setState的时候被调用，例如上面的_incrementCounter方法。
    //
    // Flutter framework 是被优化过的，所以它的重新运行build方法是非常快速的，只需要
    // 运行你需要更新的内容，不需要去分别所有的widgets的实例。
    return Scaffold(
      appBar: AppBar(
        // 我们能够使用在App.build方法中创建的值，并且赋值
        title: Text(widget.title),
      ),
      body: Center(
        // Center是一个布局Widget，它提供一个child 并且规定了只能居于父类的正中心
        child: Column(
          // Column 也是一个布局Widget，它有一系列的子布局并且这些子布局都是垂直方向的。
          // 默认情况下，Column会调整它自己的大小去适应子级的横向大小。
          //
          // 调用 "debug painting"可以看每一个widget的线框
          //
          // Column 有大量的属性去控制自己的大小和它子级的位置，这里使用了mainAxisAlignment
          // 让其子布局内容是垂直方向排列。
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(
              'You have pushed the button this many times:',
            ),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.display1,
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: Icon(Icons.add),
      ), // This trailing comma makes auto-formatting nicer for build methods.
    );
  }
```
可以看出这里提供了两个方法：`build`和`_incrementCounter`，我们已经知道一般`Widget`里面的`build`方法返回的是一个页面布局。

`_incrementCounter`的实现内容很简单：
就是使用`setState`方法去自增这个`_counter`，但此处一点要注意，更改状态一定要使用 `setState`，如果不调用 `setState`将不会有任何的改变，即使你自增了这个`_counter`。（可以自己尝试一下）

我们从注释中可知，这个build方法在每次更新状态（`setState`）的时候进行调用，我们在`build`的方法中增加一行打印的代码进行验证：


```java
@override
  Widget build(BuildContext context) {
    print("build again");
    return Scaffold(
		...
	);
```
发现果然是每一次点击`+`就会调用一次`build`方法，那这就会引出一个问题：这样每一次都进行更新，会影响新能吗？
***
Flutter framework 被优化于快速重启运行，只需要运行你需要更新的内容，不需要去分别重新构建所有的widgets的实例。
***
所以完全不必担心这个每次都执行`build`方法会影响性能。

从整体的布局我们知道，build返回了一个`Scaffold`的widget：
```java
class Scaffold extends StatefulWidget {
  /// Creates a visual scaffold for material design widgets.
  const Scaffold({
    Key key,
    this.appBar,
    this.body,
    this.floatingActionButton,
    this.floatingActionButtonLocation,
    this.floatingActionButtonAnimator,
    this.persistentFooterButtons,
    this.drawer,
    this.endDrawer,
    this.bottomNavigationBar,
    this.bottomSheet,
    this.backgroundColor,
    this.resizeToAvoidBottomPadding,
    this.resizeToAvoidBottomInset,
    this.primary = true,
    this.extendBody = false,
    this.drawerDragStartBehavior = DragStartBehavior.down,
  }) : assert(primary != null),
       assert(extendBody != null),
       assert(drawerDragStartBehavior != null),
       super(key: key);

```
可以知道，这个也是继承于`StatefulWidget `，里面有很多可以设置的初始值，这里使用到了三个：
* appBar-布局标题栏
* body-内容显示区域
* floatingActionButton-浮动按钮
```java
return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(
              'You have pushed the button this many times:',
            ),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.display1,
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: Icon(Icons.add),
      ), // This trailing comma makes auto-formatting nicer for build methods.
    );
```
将从`MyApp`携带的title赋值给`appBar`的title，让其显示在界面顶端。内容（`body`）使用了一个`Center`居中布局，让其child（也是一个widget）只能显示在当前正中位置。
```java
class Center extends Align {
  /// Creates a widget that centers its child.
  const Center({ Key key, double widthFactor, double heightFactor, Widget child })
    : super(key: key, widthFactor: widthFactor, heightFactor: heightFactor, child: child);
}
```
紧接着返回了一个`Column`的child，这个widget 是纵向排列，可有有一系列的子集，所以在`Column` 布了两个`Text`，一个显示固定文本，一个显示可变的文本：
```java
class Column extends Flex {
  Column({
    Key key,
    MainAxisAlignment mainAxisAlignment = MainAxisAlignment.start,
    MainAxisSize mainAxisSize = MainAxisSize.max,
    CrossAxisAlignment crossAxisAlignment = CrossAxisAlignment.center,
    TextDirection textDirection,
    VerticalDirection verticalDirection = VerticalDirection.down,
    TextBaseline textBaseline,
    List<Widget> children = const <Widget>[],
  }) : super(
    children: children,
    key: key,
    direction: Axis.vertical,
    mainAxisAlignment: mainAxisAlignment,
    mainAxisSize: mainAxisSize,
    crossAxisAlignment: crossAxisAlignment,
    textDirection: textDirection,
    verticalDirection: verticalDirection,
    textBaseline: textBaseline,
  );
}
```
需要注意的是，对变量的占位符使用的`$`符号，就跟java中使用`%`是一样的。
最后一个就是我们点击事件的按钮`floatingActionButton`，通过`onPressed`去调用`_incrementCounter`方法实现自增计数。
整个运行的流程就到这里算是讲完了。

## Hot Reload（热加载）
在文章开始的时候我们知道，我们有一个一道雷一样的图标，那就是`Hot Reload`，这个怎么个意思呢？就是说你如果更新了你的代码，不用重新运行整个都重新运行，直接使用这个就可以了，可以很迅速的将你更新的内容重新显示。
在这里有一个很有意思的事情：
我们点击`+`让计数器显示到1，然后将主题的颜色改成绿色：`primarySwatch: Colors.green,`
```java

class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
       // 主题从蓝色更改为绿色
        primarySwatch: Colors.green,
      ),
      home: MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}
```
然后点击`hot reload` 会发现，我们的主题更改为绿色了，但是我的计数器显示的数字仍然是1，并没有变成0。这也印证了上面的那句话，`hot reload`只会更改所需要更改的内容，不会影响全部。

## 总结
这里在做一个总结，希望对才你有所帮助
* 在`flutter`中，绝大部分可使用的内容都是`widget`
* 如果只是显示内容，不涉及更改状态，就是用`StatelessWidget`；如果涉及状态的变更就是用`StatefulWidget`
* `StatefulWidget`的实现需要两步：一个是需要创建继承`StatefulWidget`的类；另一个就是创建继承`State`的类，一般在State中控制整个状态。
* 更新状态一定要调用`setState`方法，不然不会起作用
* `hot reload`只会影响更改的内容
