---
title: Flutter(二)-Hello World?
date: 2019-03-8 08:00:00
categories:
  - "android"
  - "flutter"
tags: ["flutter"]
thumbnail: /img/flutter/flutter-login.gif
---

> 在上一篇文章中以简单的方式对Flutter自己提供的演示进行了一个简单的分析，当然那是远远不够。本来打算为大家带来官网上的无限下拉刷新的案例，但是发现这里的有些东西实在是太超前了，作为Flutter入门篇，当然不能这么随意，以为了让大家都能够学有所得，所以今天给大家带来了自己手撸的一个登录。

<!--more-->

![登录演示](/img/flutter/flutter-login.gif)

# 简单分析布局
我们都知道，一个简单的登录需要至少需要3步：

* 输入账号
* 输入密码
* 点击登录

那么我们的布局也就至少需要3个`widget`，为什么说至少呢？因为往往布局使用的`widget`都是大于操作步骤的。这里跟大家分享我的布局大概有这么几个：

* 整个外层框框，就是那个淡红色的渐变底色，是一个容器`widget`，可以包裹里面的所有内容。
* 在这里面是一个纵向的布局`widget`，让所有的内容成纵向排列。
* 里面输入手机号和输入密码那里都是=容器，可以包裹输入框。为什么要使用这个容器呢，直接使用输入`widget`不好吗？这里容许我先买个关子~~
* 接下来就是一个按钮
* 最后就是显示文字的布局

# Scaffold
为什么要讲解这个呢？这是因为它是实现了`Mataril Design`的一种简单的“脚手架”，有些也叫“支架”，通过这个翻译也就知道了，其实它就是向我们提供了简单的框架，我们直接使用它就行了。那么问题来了，我们可不可以不使用它呢？当然是可以的，但是不建议这样做，因为我们后面需要使用的很多`widget`（比如`TextField`）必须要在它的支持下才能运行，不然就会报错了。

```java
class Scaffold extends StatefulWidget {
  /// Creates a visual scaffold for material design widgets.
  const Scaffold({
    Key key,
    this.appBar, //横向水平布局，通常显示在顶部（*）
    this.body, // 内容（*）
    this.floatingActionButton, //悬浮按钮，就是上图右下角按钮（*）
    this.floatingActionButtonLocation, //悬浮按钮位置
    //悬浮按钮在[floatingActionButtonLocation]出现/消失动画
    this.floatingActionButtonAnimator, 
    //在底部呈现一组button，显示于[bottomNavigationBar]之上，[body]之下
    this.persistentFooterButtons,
    //一个垂直面板，显示于左侧，初始处于隐藏状态（*）
    this.drawer,
    this.endDrawer,
    //出现于底部的一系列水平按钮（*）
    this.bottomNavigationBar,
    //底部持久化提示框
    this.bottomSheet,
    //内容背景颜色
    this.backgroundColor,
    //弃用，使用[resizeToAvoidBottomInset]
    this.resizeToAvoidBottomPadding,
    //重新计算布局空间大小
    this.resizeToAvoidBottomInset,
    //是否显示到底部，默认为true将显示到顶部状态栏
    this.primary = true,
    //
    this.drawerDragStartBehavior = DragStartBehavior.down,
  }) : assert(primary != null),
       assert(drawerDragStartBehavior != null),
       super(key: key);
```

从这里面，我们可以看出`Scaffold`提供了很多的方式方法，去实现`Mataril Design`的布局：

## AppBar
 一般就用于`Scaffold.appBar`,是一个置于屏幕顶部的横向布局，为什么是横向呢？可以如下中看出：

 ![AppBar-横向布局](/img/flutter/flutter-appbar.jpg)

 我在它其中的`anctions`属性中设置了多个`widget`，然后就向这样后面那三就一溜的按顺序排好了。
 ```java
 AppBar(
    title: Text('Sample Code'),
    leading: IconButton(
        icon: Icon(Icons.view_quilt),
        tooltip: 'Air it',
        onPressed: () {},
    ),
    bottom: TabBar(tabs: tabs.map((e) => Tab(text: e)).toList(),controller: _tabController),
    actions: <Widget>[
        IconButton(
        icon: Icon(Icons.playlist_play),
        tooltip: 'Air it',
        onPressed: () {},
        ),
        IconButton(
        icon: Icon(Icons.playlist_add),
        tooltip: 'Restitch it',
        onPressed: () {},
        ),
        IconButton(
        icon: Icon(Icons.playlist_add_check),
        tooltip: 'Repair it',
        onPressed: () {},
        )
    ],
)
 ```

 对于上述中`leading`需要说明一下，一般我们用它来显示一个按钮去关闭当前页面或者打开一个`drawer`。有兴趣的可以去试试~~

 在`AppBar`众多的属性中，还有一个是我们比较常用的，那就是`bottom`，这个显示于工具栏的下方，注意不是屏幕底部哦！一般使用`TabBar`来实现一个页面包含中多个不同页面的切换。
 ![AppBar-使用tabBar](/img/flutter/flutter-tabbar.jpg)

 当然还有其他一些方式方法，这里就不多占用篇幅了，就简单聊聊：
 * `title`就是标题
 *  `drawer`抽屉，一般左侧打开，默认初始隐藏
 *  `centerTitle` 是否标题居中

 如果想看完整的实现方式，就[跟我来吧](https://github.com/AnJoiner/Flutter/blob/master/lib/tabbarroute.dart)！

 ## BottomNavigationBar

这个属性也是相当重要的，如果我们想要实现多个，不同页面的切换，就可以使用这个。咦？这个不是说过了么？

***
BottomNavigationBar与AppBar里面的TabBar是不同的，一个是用来显示于顶部，一个用来显示与底部
***

![BottomNavigationBar](/img/flutter/flutter-bottom.gif)

在我们国内的应用中很少向这样出现可以浮动选择项，所以如果想让你的App不进行浮动的话，可以使用里面的一个`type`属性。

```java
type: BottomNavigationBarType.fixed,
```
BottomNavigationBarType有两值，就是fixed，还有一个就是shifting，默认是shifting。这样设置之后仍然存在一个问题：就是选中的按钮的字体仍然会比未选中的大一点，有兴趣的可以自己去验证一下。

![BottomNavigationBar-选中](/img/flutter/flutter-bottom-type.gif)
那么这个问题改怎么办呢？很遗憾，在最新稳定版（Flutter Stable 1.2.1）SDK中并没有处理这个问题的方式方法。如果想要解决这个问题的话，更换Flutter SDK到最新的开发版本(Flutter Dev 1.3.8)，就可以使用它的属性去解决这个问题。

```java
selectedItemColor: colorRegular, //选中颜色
unselectedItemColor: colorBlack,//未选择颜色
selectedFontSize: 12,//选中字体大小
unselectedFontSize: 12,//未选中字体大小
```
## FloatingActionButton

个人觉得这个`FloatingActionButton`还是需要说明一下的，毕竟用的时候还是比较多的。`FloatingActionButton`是一个浮动按钮，也就是上面那个带“+”的按钮，这个可以用来添加，分享，或者是导航。可以与`Scaffold`中两个属性配合使用
* FloatingActionButtonLocation
* FloatingActionButtonAnimator

`FloatingActionButtonLocation`属性可以移动浮动按钮的位置，有如下几个位置可以移动：

```java
FloatingActionButtonLocation.endDocked //右侧bottomNagivationBar遮盖
FloatingActionButtonLocation.centerDocked //居中bottomNagivationBar上遮盖
FloatingActionButtonLocation.endFloat //bottomNagivationBar上方右侧显示
FloatingActionButtonLocation.centerFloat //bottomNagivationBar上方居中显示
```
自己可以试一试，这里就不一一演示，只演示一下这个`centerDocked`
![浮动居中](/img/flutter/flutter-floating.jpg)

`FloatingActionButtonAnimator`就是`FloatingActionButton`在出现位置`FloatingActionButtonLocation`的动画效果~~

需要注意以下几点：
* 如果一个页面有多个`FloatingActionButtonLocation`,那么就需要让每一个浮动按钮都有自己且唯一的`heroTag`。
* 如果`onPressed`返回了null，那么它将不会对你的触摸进行任何反应，不推荐这样去展示一个无任何响应的浮动按钮。

## SnackBar

经常在我们的应用中会使用到信息提示，那么我们就可以使用showSnackBar的方式去显示一个简短的提示，默认显示4s。
![SnackBar](/img/flutter/flutter-snackbar.jpg)

```
class SnackTest extends StatelessWidget{
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
          title: Text('Demo')
      ),
      body: Center(
        child: RaisedButton(
          child: Text('SHOW A SNACKBAR'),
          onPressed: () {
            Scaffold.of(context).showSnackBar(SnackBar(
              content: Text('Hello!'),
            ));
          },
        ),
      )
    );
  }
}
```
一般我们会向如上方式处理，但是可能会抛出一个`Scaffold.of() called with a context that does not contain a Scaffold.`的异常，也不会显示出`snackBar`。    
这是因为，`Scaffold.of()`所需的context是Scaffold的，并不是Scaffold上方的build(BuildContext context)中的，这两个并不是一个。

正确的方式是，创建自己的context：
```java
class SnackTest extends StatelessWidget{
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
          title: Text('Demo')
      ),
      body: Builder(
        // Create an inner BuildContext so that the onPressed methods
        // can refer to the Scaffold with Scaffold.of().
        builder: (BuildContext context) {
          return Center(
            child: RaisedButton(
              child: Text('SHOW A SNACKBAR'),
              onPressed: () {
                Scaffold.of(context).showSnackBar(SnackBar(
                  content: Text('Hello!'),
                ));
              },
            ),
          );
        },
      ),
    );
  }
}
```
当然还可以使用`GlobalKey`的方式：

```dart
class ScaffoldTestState extends State<ScaffoldTest> {
  final _scaffoldKey = GlobalKey<ScaffoldState>();
  
  void showSnackBar() {
    _scaffoldKey.currentState
        .showSnackBar(new SnackBar(content: Text("SnackBar is Showing!")));
  }
  
  return new Scaffold(
        key: _scaffoldKey,
        body: Center(
        child: RaisedButton(
          child: Text('SHOW A SNACKBAR'),
          onPressed: () {
            showSnackBar(),
            ));
          },
        ),
      )
    }
}
```

还有另一种也可以作为提示，就是bottomSheet:
![BottomSheet](/img/flutter/flutter-bottomsheet.jpg)
这个与`snackBar`的区别就是，虽然弹出了提示，但是不会自动消失，需要手动下拉才会消失。
```java
class SnackTest extends StatelessWidget{

  void showBottomSheet(BuildContext context) {
    Scaffold.of(context).showBottomSheet((BuildContext context) {
      return new Container(
        constraints: BoxConstraints.expand(height: 100),
        color: Color(0xFFFF786E),
        alignment: Alignment.center,
        child: new Text(
          "BottomSheet is Showing!",
          style: TextStyle(color: Color(0xFFFFFFFF)),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
          title: Text('Demo')
      ),
      body: Builder(
        // Create an inner BuildContext so that the onPressed methods
        // can refer to the Scaffold with Scaffold.of().
        builder: (BuildContext context) {
          return Center(
            child: RaisedButton(
              child: Text('SHOW A SNACKBAR'),
              onPressed: () {
                showBottomSheet(context);
              },
            ),
          );
        },
      ),
    );
  }
}
```

# 实现登录
前面讲了那么多都是为我们接下来的演示做准备的，那先来看看登录代码：
![登录演示](/img/flutter/flutter-login.jpg)
```java
class LoginPageState extends State<LoginPage> {
  Color colorRegular = Color(0xFFFF786E);
  Color colorLight = Color(0xFFFF978F);
  Color colorInput = Color(0x40FFFFFF);
  Color colorWhite = Colors.white;

  TextStyle defaultTextStyle =
  TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16);

  BorderRadius radius = BorderRadius.all(Radius.circular(21));


  void login() {
    
  }

  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    return new Scaffold(
      body: Container(
        constraints: BoxConstraints.expand(),
        decoration: BoxDecoration(
            gradient: LinearGradient(
                colors: [colorLight, colorRegular],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter)),
        child: Column(
          children: <Widget>[
            Container (
              margin: EdgeInsets.only(top: 110, bottom: 39, left: 24, right: 24),
              decoration: BoxDecoration(
                  borderRadius: BorderRadius.all(Radius.circular(21)), color: colorInput),
              child: TextField(
                decoration: InputDecoration(
                    contentPadding: EdgeInsets.symmetric(horizontal: 15,vertical: 9),
                    border: InputBorder.none,
                    hintText: "输入手机号",
                    hintStyle: TextStyle(color: Colors.white, fontSize: 16),
                    labelStyle: TextStyle(color: Colors.black, fontSize: 16)),
                maxLines: 1,
                cursorColor: colorRegular,
                keyboardType: TextInputType.phone,
              ),
            ),
            Container(
              margin: EdgeInsets.only(bottom: 58, left: 24, right: 24),
              decoration: BoxDecoration(
                  borderRadius: radius,
                  color: colorInput),
              child: TextField(
                decoration: InputDecoration(
                    contentPadding: EdgeInsets.symmetric(horizontal: 15,vertical: 9),
                    border: InputBorder.none,
                    hintText: "输入密码",
                    hintStyle: TextStyle(color: Colors.white, fontSize: 16),
                    labelStyle: TextStyle(color: Colors.black, fontSize: 16)),
                maxLines: 1,
                cursorColor: colorRegular,
                keyboardType: TextInputType.number,
                obscureText: true,
              ),
            ),
            Container(
              height: 42, width: 312,
              margin: EdgeInsets.only(left: 24, right: 24),
              decoration: BoxDecoration (
                  borderRadius: radius,
                  color: colorWhite),
              child: RaisedButton(onPressed: login,
                  elevation: 1,
                  highlightElevation: 1,
                  textColor: colorRegular,
                  shape: RoundedRectangleBorder(
                      borderRadius: radius
                  ),
                  child: new Text("立即登录", style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold),
                  )),
            ),
            Padding(
              padding: EdgeInsets.only(top: 10),
              child: Text(
                "登录/注册即代表您已同意《会员协议》",
                style: TextStyle(color: Colors.white, fontSize: 13),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

在上一章就讲过，如果在整个生命周期中，状态如果改变，那么我们就是用`StatefulWidget`来呈现，并且`StatefulWidget`的实现需要两步：一个是需要创建继承`StatefulWidget`的类；另一个就是创建继承`State`的类，一般在`State`中控制整个状态。所以此处就是如此：

```java
class LoginPage extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => LoginPageState();
}

class LoginPageState extends State<LoginPage> {

  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    return new Scaffold(
      body: Container(
      //省略代码
      ...
      )
    );
  }
}
```
并且当前登录界面是没有工具栏的，所以去掉了`AppBar`。将所有内容直接写在了`body`中。可以看到整个登录界面的背景是一个渐变，上面浅一点，下面深一点，所以就需要一个容器去包裹整个内容，并且这个容器可以实现背景颜色的渐变的，所以我选用了`Container`，因为它是所有容器布局中属性最全面的。

```
 Container({
    Key key,
    this.alignment,//子布局的排列方式
    this.padding,//内部填充
    Color color,//背景颜色
    Decoration decoration,  //用于装饰容器
    this.foregroundDecoration,//前景装饰
    double width, //容器宽
    double height, //容器高
    BoxConstraints constraints, //约束
    this.margin, //外部填充
    this.transform, //对容器进行变换
    this.child,
  })
```
提示：如果处于`body`下的`container`不论是否设置宽高，它将都会扑满全屏。

那么最外层的渐变我们就是使用`BoxDecoration`：
```java
const BoxDecoration({
    this.color,
    this.image, 图片
    this.border, //边框
    this.borderRadius, //圆角
    this.boxShadow, //阴影
    this.gradient, //渐变
    this.backgroundBlendMode, //背景模式，默认BlendMode.srcOver
    this.shape = BoxShape.rectangle, //形状
  }) : assert(shape != null),
       assert(
         backgroundBlendMode == null || color != null || gradient != null,
         'backgroundBlendMode applies to BoxDecoration\'s background color or '
         'gradient, but no color or gradient was provided.'
       );
```
提示：在对形状的处理中，以下是可以互换的：  
* CircleBorder === BoxShape.circle
* RoundedRectangleBorder == BoxShape.rectangle

所以从上可以完成我们的渐变：
```java
 decoration: BoxDecoration(
            gradient: LinearGradient(
                colors: [colorLight, colorRegular],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter)
        )
```

实现了渐变的过程，那么就是输入框，可以从设计上来说，这些内容都是纵向排列的，所以内容使用了布局`Column`，用于纵向布局，当然相对的横向布局`Row`。

```java
 Column({
    Key key,
    //主轴排列方式，这里的主轴就是纵向，实际就是纵向的布局方式
    MainAxisAlignment mainAxisAlignment = MainAxisAlignment.start, 
    //Column在主轴（纵向）占有的控件，默认尽可能大
    MainAxisSize mainAxisSize = MainAxisSize.max,
    //交叉轴排列方式，那么就是横向
    CrossAxisAlignment crossAxisAlignment = CrossAxisAlignment.center,
    //横向子widget的布局顺序
    TextDirection textDirection,
    //交叉轴的布局对齐方向
    VerticalDirection verticalDirection = VerticalDirection.down,
    TextBaseline textBaseline,
    List<Widget> children = const <Widget>[],
  })
```
在`Column`中包含了三个`Container`,前两个中是输入布局`TextField`，最后一个是`RaisedButton`。这里回答在文章开始开始的时候提出的问题：为什么要用`Container`去包裹`TextField`？

1. 需要实现圆角 (decoration)
2. 要实现间距 （marin 和 padding）

所有需要使用`Container`去完成这样的样式装饰。

`TextField`应该是我们比较常用的widget了：
```java
TextField(
    decoration: InputDecoration(
        contentPadding: EdgeInsets.symmetric(horizontal: 15,vertical: 9),
        border: InputBorder.none,
        hintText: "输入手机号",
        hintStyle: TextStyle(color: Colors.white, fontSize: 16),
        labelStyle: TextStyle(color: Colors.black, fontSize: 16)
    ),
    maxLines: 1,
    cursorColor: colorRegular,
    keyboardType: TextInputType.phone,
),
```
这里只是使用可`decoration`,对`TextField`装饰，比如其中的`contentPadding`，对内容留白填补。
`cursorColor`光标颜色，输入类型`keyboardType`，这里是手机号类型。此外还有很多的属性，这里就不一一赘述，可以自行到官网去查看。

最后被`container`包裹是的`RaisedButton`:

```java
RaisedButton(
    onPressed: login, 
    elevation: 1, 
    highlightElevation: 1,
    textColor: colorRegular,
    shape: RoundedRectangleBorder(
        borderRadius: radius
    ),
    child: new Text("立即登录", style: TextStyle(
        fontSize: 15,
        fontWeight: FontWeight.bold),
))
```
# 我也修饰一下
* 到处登录界面的布局就算完成了，然后运行之后就会出现在文章开头的登录界面，但是当我们点击`TextField`进行输入的时候，会发现整个布局会被顶上去了，这是为什么呢？。
***
答：这是因为`Scaffold`会填充整个可用空间，当软键盘从`Scaffold`布局中出现，那么在这种情况下，可用空间变少`Scaffold`就会重新计算大小，这也就是为什么`Scaffold`会将我们的布局全部上移的根本原因，为了避免这种情况，可以使用`resizeToAvoidBottomInset`并将其
 置为`false`就可以了。
***


* 怎么去掉屏幕右上角的`debug`标签？

答：将MaterialApp中的`debugShowCheckedModeBanner`置为false
```java
class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primaryColor: Color(0xFFFF786E),
        primaryColorLight: Color(0xFFFF978F),
        accentColor: Color(0xFFFFFFFF)
      ),
      home: LoginPage(),
      debugShowCheckedModeBanner: false,
    );
  }
}
```

* 怎么让状态栏显示沉浸式，不出现灰蒙蒙的赶脚呢？

```java
 runApp(new MyApp());
  if (Platform.isAndroid) {
    // 以下两行 设置android状态栏为透明的沉浸。
    //写在组件渲染之后，是为了在渲染后进行set赋值，
    //覆盖状态栏，写在渲染之前MaterialApp组件会覆盖掉这个值。
    SystemUiOverlayStyle systemUiOverlayStyle = 
    SystemUiOverlayStyle(statusBarColor: Colors.transparent);
    SystemChrome.setSystemUIOverlayStyle(systemUiOverlayStyle);
  }
```

最后给大家推荐一本Flutter书，详细介绍了Flutter的使用方式方法，都提供了演示案例：[Flutter实战](https://book.flutterchina.club/):
![Flutter实战](https://user-gold-cdn.xitu.io/2019/3/9/16962956e77303bc?w=500&h=691&f=png&s=56679)


