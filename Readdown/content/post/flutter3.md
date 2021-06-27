---
title: Flutter(三)-如何实现登录动画效果
date: 2019-03-17 08:00:00
categories:
  - "android"
  - "flutter"
tags: ["flutter"]
thumbnail: /img/flutter/flutter-process.jpg
---

> 在上一篇的时候，我们讲解了怎么做一个登录界面，但是之后呢？完全是草草结尾的感觉嘛，这不，接下来就是给大家详细说说，这个登录里面不得鸟的故事。先来看一个登录的过程~~

<!--more-->

![登录失败](/img/flutter/flutter-login.gif)

# 分析
可能上面的`gif`图不是很真切，这上面展示了两个功能：	
* 颜色变换的闪屏页面
* 动画效果的登录页面

有没有感觉这样的登录好像还不错呢，哈哈哈，接下来就详细分析一下这其中的玄机~~

# 路由
一般我们的页面跳转都会涉及到路由，路由就是从一个页面跳转到另一个页面的过程，就比如Android中的`Activity`或IOS中的`ViewController`的跳转。

在Flutter中所以的路由都使用`Navigator`来进行管理的，换句话说它就是让这些本来相对独立的个体形成一个完美的整体。那么`Navigator`是直接管理的就是页面吗？当然不是，实际上它管理是`Route`对象，而且提供了管理堆栈的相关方法，比如：
* Navigator.push （入栈）
* Navigator.pop （出栈）

虽然能够直接创建一个`navigator`，但是呢，一般不建议这样直接使用，我们常常通过`WidgetsApp`或者`MaterialApp`去创建。还记得[第一篇](https://juejin.im/post/5c7b8f8fe51d456995151769)的时候，就跟大家提过，Flutter提供了许多widgets，可帮助您构建遵循`Material Design`的应用程序。Material应用程序以MaterialApp widget开始， 该widget在应用程序的根部创建了一些有用的widget，其中包括一个`Navigator`， 它管理由字符串标识的Widget栈（即页面路由栈）。Navigator可以让您的应用程序在页面之间的平滑的过渡。 所以我们的应用启动一般这样写：

```java
void main() {
	runApp(MaterialApp(home: MyAppHome()));
}
```
那么，`home`所指向的页面也就是我们栈中最底层的路由，那`MaterialApp`到底是怎么创建这个底层路由的呢？它遵循以下几个原则：
```java
const MaterialApp({
    Key key,
    this.navigatorKey,
    this.home,
    this.routes = const <String, WidgetBuilder>{},
    this.initialRoute,
    this.onGenerateRoute,
    this.onUnknownRoute,
    //省略无关代码
    ...
})
```

* 首先使用我们的`home`所指向的
* 如果失败，那么就会使用`routes`路由表
* 如果路由表为空，那么就会调用`onGenerateRoute`
* 如果以上所有都失败了，那么`onUnknownRoute`将会被调用

所以说如果要创建`Navigator`，那么以上四个必须有一个被使用。

## MaterialPageRoute
一般我们可以使用`MaterialPageRoute`去进行路由：
```java
Navigator.push(context, MaterialPageRoute<void>(
	builder: (BuildContext context) {
		return Scaffold(
			appBar: AppBar(title: Text('My Page')),
			body: Center(
				child: FlatButton(
					child: Text('POP'),
					onPressed: () {
						Navigator.pop(context);
					},
				),
			),
		);
	},
));
```
这种方式的就很明显了，它是使用一种`build`的方式去入栈（或者出栈）。如上可以看出，当我点击 `POP`按钮的时候又可以将这个页面进行出栈，又可以回到我们的`home`页面。但是，通常我们不这么去返回上一个页面，在[上一章](https://juejin.im/post/5c837d63f265da2de450aa79)的时候就使用`Scaffold`的`AppBar`中可以直接添加一个返回，究其根本这个返回最终也是调用的这个
```java
Navigator.pop(context);
```
当我们需要在返回的时候带一个返回值的时候，可以像如下的方式进行使用，那么这个时候就不能使用`Scaffold`的`AppBar`中的返回了，因为它是不会返回任何结果的。
```java
Navigator.pop(context, true);
```

## pushNamed
上面是通过一个动态的方式去进行路由，我们也可以使用一种静态的方式去路由，那就是`pushNamed`，从字面意思就是通过页面的名字进行路由的，那么这个名字是从哪里来的呢？这就需要使用我们上面在`MaterialApp`中的`routes`路由表了。

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
      home: Start(),
      debugShowCheckedModeBanner: false,
        routes:{
          "scaffold_page":(context)=>ScaffoldTest(),
          "snack_page":(context)=> SnackTest(),
          "login_page":(context)=> LoginPage(),
          "start_page":(context)=> Start(),
        }
    );
  }
}
```
```java
Navigator.pushNamed(context, "snack_page");
```
那么，我们能不能携带参数呢？当然是可以的咯

```java
void _showBerlinWeather() {
   Navigator.pushNamed(
     context,
     '/weather',
     arguments: <String, String>{
       'city': 'Berlin',
       'country': 'Germany',
     },
   );
}
```
也能携带一个自定义的对象进行遨游~~
```java
class WeatherRouteArguments {
  WeatherRouteArguments({ this.city, this.country });
  final String city;
  final String country;

  bool get isGermanCapital {
    return country == 'Germany' && city == 'Berlin';
  }
}

void _showWeather() {
  Navigator.pushNamed(
    context,
    '/weather',
    arguments: WeatherRouteArguments(city: 'Berlin', country: 'Germany'),
  );
}
```

当然还有一些其他的方式：
1. pushReplacementNamed 和 pushReplacement 替换当前页面
2. popAndPushNamed  当前页面出栈，入栈新的页面
3. pushNamedAndRemoveUntil 和 pushAndRemoveUntil 入栈新页面并关闭之前的所有页面

# 动画
在前面`gif`图中我们可以看到在闪屏页在不同的时间颜色有不同的变化（图片模糊，效果不明显），还有点击登录的时候，按钮的样子也有变化，那么这个是怎么实现的呢？当然是我们的动画了~~

## AnimationController
`AnimationController`用来控制一个动画的正向播放、反向播放和停止动画等操作。在默认情况下`AnimationController`是按照线性进行动画播放的。
需要注意的是在使用`AnimationController`的时候需要结合`TickerProvider`，因为只有在`TickerProvider`下才能配置`AnimationController`中的构造参数`vsync`。`TickerProvider`是一个抽象类，所以我们一般使用它的实现类`TickerProviderStateMixin`和`SingleTickerProviderStateMixin`。

那么，这两种方式有什么不同呢？
如果整个生命周期中，只有一个`AnimationController`，那么就使用`SingleTickerProviderStateMixin`，因为此种情况下，它的效率相对来说要高很多。反之，如果有多个`AnimationController`，就是用`TickerProviderStateMixin`。

需要注意的是，如果`AnimationController`不需要使用的时候，一定要将其释放掉，不然有可能造成内存泄露。

```java
class StartState extends State<Start> with SingleTickerProviderStateMixin {

  AnimationController colorController;

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    colorController = new AnimationController(
        vsync: this, duration: new Duration(seconds: 3));
  }
  
  @override
  Widget build(BuildContext context) {
    return new Scaffold(
      body: Container(
      //省略部分代码
      ...
        ),
    );
  }

  @override
  void dispose() {
    // TODO: implement dispose
    colorController.dispose();
    super.dispose();
  }
}
```
## Animation
有了动画控制器之后，就需要我们的动画效果了哦。但是我们可以发现`Animation`本身是个抽象类，所以我们需要的是它的实现类。我们可以直接使用`Tween`或者它的子类去实现一个`Animation`，在`AnimationController`中提供了一个`drive`方法，这个是用来干什么的呢？这个是用来链接一个`Tween`到`Animation`并返回一个`Animation`的实例。
```java
Animation<Alignment> _alignment1 = _controller.drive(
  AlignmentTween(
    begin: Alignment.topLeft,
    end: Alignment.topRight,
  ),
);
```
为什么要使用`Tween`呢？`Tween`就是一个线性的插值器，可以实现一个完整的变化过程
```java
class Tween<T extends dynamic> extends Animatable<T> {
  Tween({ this.begin, this.end });
  T begin;
  T end;
  @protected
  T lerp(double t) {
    assert(begin != null);
    assert(end != null);
    return begin + (end - begin) * t;
  }
  @override
  T transform(double t) {
    if (t == 0.0)
      return begin;
    if (t == 1.0)
      return end;
    return lerp(t);
  }

  @override
  String toString() => '$runtimeType($begin \u2192 $end)';
}
```
`Tween`的构造提供了两个参数，一个开始`bengin` ，一个结束`end`，就是说让动画可以在这个区间内进行变化，当然它也提供了很多子类，比如：`ColorTween`、`SizeTween`、`IntTween`和`CurveTween`等等
* `ColorTween` 可以实现两个颜色的变化
* `SizeTween` 可以实现两个`size`的变化
* `IntTween` 可以实现两个int 值之间的变化
* `CurveTween` 可以实现动画非线性变化

## CurvedAnimation
`CurvedAnimation`就是将一个曲线（非线性）变化应用到另一个动画，如果想使用 `Curve`应用到`Tween`就可以直接使用上面所说的`CurveTween`，可以不`CurvedAnimation`。

```java
final Animation<double> animation = CurvedAnimation(
  parent: controller,
  curve: Curves.ease,
);
```
这里需要两个参数一个是动画控制，也就是我们的`AnimationController`，另一个就是`curve`，它描述了到底是按照什么样的曲线进行变化的。在`Curves`中提供了很多的变化过程，有兴趣的童鞋可以自己去研究一下~~

![动画关系](/img/flutter/flutter-process.jpg)
这里总结一下：

* AnimationController 控制整个动画的播放，停止等操作
* Tween 动画的变化区间
* CurvedAniamtion 控制动画按照非线性进行变化


# 闪屏动画实现
要实现一个动画的，首先肯定需要上面所说的`AniamtionController` 和 `Animation`，有这个还不够，还需要一个可以根据
在闪屏页面中，我们的动画是颜色根据时间不同的进行变化，那肯定会用到我们的`Tween`，这里是颜色的变化，所以使用到了`ColorTween`。
```java
 @override
  void initState() {
    // TODO: implement initState
    super.initState();
    colorController = new AnimationController(
        vsync: this, duration: new Duration(seconds: 3));

    colorAnimation = colorController
        .drive(ColorTween(begin: Color(0xFFFF786E), end: Color(0xFFFFA07A)));
}
```
一般我们对AniamtionController和Animation的初始化在`initState()`方法中，然后就需要在动画的运行过程中将`widget`进行更新，就会使用到我们的`setState()`
```java
colorAnimation = colorController
        .drive(ColorTween(begin: Color(0xFFFF786E), end: Color(0xFFFFA07A)))
          ..addListener(() {
            setState(() {});
          });

```
那么接下来就是让整个动画跑起来了~~
```java
Future<Null> playAnimation() async {
  try {
    await colorController.forward();
    await colorController.reverse();
  } on TickerCanceled {}
}
```
这里使用到了`dart`语言中的异步，有两个特点：

* `await `返回一定是`Future`，如果不是会报错
* `await ` 所在的方法必须在有`async`标记的函数中运行。

上面的意思就是让动画先正向进行，然后在反向进行~~		
但是发现动画写完之后运行，但是没有任何作用，这是因为你没有将动画的变化应用到`widget`上
```java
@override
  Widget build(BuildContext context) {
    return new Scaffold(
      body: Container(
        decoration: BoxDecoration(color: colorAnimation.value),
        child: Center(
        ...
        //省略无关代码
        ),
     ),
   );
}
```
在上述代码中的`BoxDecoration(color: colorAnimation.value)`就是将颜色的值作用于整个`Container`上，所以颜色就随之变化而变化。

在动画结束的时候不是要进行路由跳转到下一个页面的嘛？这就需要在对动画的监听，当动画结束的时候就进行跳转，就需要修改`colorAnimation`

```java
colorAnimation = colorController
        .drive(ColorTween(begin: Color(0xFFFF786E), end: Color(0xFFFFA07A)))
          ..addListener(() {
            if (colorController.isDismissed) {
              Navigator.pushAndRemoveUntil(context,
                  new MaterialPageRoute(builder: (context) {
                return LoginPage();
              }), ModalRoute.withName("start_page"));
            }
            setState(() {});
          });
```
这里需要注意的是，在判断结束的时候，这里使用的是`colorController.isDismissed`，没有使用`colorController.isCompleted`是因为在正向动画完成的时候就会调用，还没让这个动画流程运行完成~~



如果需要完整代码，就可以来[这儿](https://github.com/AnJoiner/Flutter/blob/master/lib/start.dart)。

# 登录动画实现
这里和上面是一样的实现动动画，但是直接使用的是`Tween`，而且使用了另一种将`Tween`关联到Animation的方式，而且使用
```java
@override
void initState() {
  // TODO: implement initState
  super.initState();
  _animationController = new AnimationController(
      vsync: this, duration: new Duration(milliseconds: 1500));

  _buttonLengthAnimation = new Tween<double>(
    begin: 312.0,
    end: 42.0,
  ).animate(new CurvedAnimation(
      parent: _animationController, curve: new Interval(0.3, 0.6)))
    ..addListener(() {
      if (_buttonLengthAnimation.isCompleted) {
        if(isLogin){
          Navigator.pushNamedAndRemoveUntil(context, "snack_page",ModalRoute.withName('login_page'));
        }else{
          showTips("登录失败");
        }
      }
      setState(() {});
    });
}
```
这里有一点需要注意，使用的`curve`是`Interval`，这个的作用就是根据你提供的时间区间进行动画展示。就如上面定的动画时间大小是1500ms，那么只有在1500\*0.3 = 500 ms的时候开始，并在1500\*0.6=900ms的时候完成。

那么接下来就直接看改变动画的对`widget`处理
```java
InkWell(
  onTap: login,
  child: Container(
     margin: EdgeInsets.only(top: 30),
     height: 42,
     width: _buttonLengthAnimation.value,
     decoration:BoxDecoration(borderRadius: radius, color: colorWhite),
     alignment: Alignment.center,
     child: _buttonLengthAnimation.value > 75? new Text("立即登录",
            style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.bold,
            color: colorRegular))
            : CircularProgressIndicator( valueColor:
                  new AlwaysStoppedAnimation<Color>(colorRegular),
                  strokeWidth: 2,
            ),
    ),
),
```
① 当点击登录按钮后，动画开始进行，并且对这个按钮的宽度就开始进行变化
```java
 width: _buttonLengthAnimation.value,
```
② 当动画的值还大于75的时候，中间就显示`Text`，但是如果小于或等于75的时候，那它的child就是一个就是一个圆形的进度`CircularProgressIndicator`
```java
child: _buttonLengthAnimation.value > 75? new Text("立即登录",
            style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.bold,
            color: colorRegular))
            : CircularProgressIndicator( valueColor:
                  new AlwaysStoppedAnimation<Color>(colorRegular),
                  strokeWidth: 2,
            ),
    ),
```
其实这就是整个动画的过程，只是其中我做了一个对动画运行的判断，当登录失败，就让动画按钮回到最初的状态，并提示登录失败。如果登录成功，就直接跳转到新的页面~~

# 总结
在这里规整一下，方便大家整理记忆

* 路由有很多中方式，可以根据不同的情况进行选择，一般常用的就是`push`和`pushNamed`，如果是`pushNamed`那么一定要在`MaterialApp`中设置路由表。
* 动画的使用一般需要跟`TickerProvider`配合使用，如果在`State`中就可以直接使用它的实现类`SingleTickerProviderStateMixin`或`TickerProviderStateMixin`。
* 如果只有一个`AnimationController`就是用`SingleTickerProviderStateMixin`，反之，使用`TickerProviderStateMixin`。
* 动画的建立跟`AnimationController`、`Tween`或`CurveAnimation`有关。
* `AnimationController`在不需要的时候一定要进行释放`dispose`，不然可能会造成内存溢出。

