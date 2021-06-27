---
title: Android 音乐播放锁屏界面
date: 2019-12-06 14:58:00
tags:
  - view
categories: "Android"
categories:
  - "android"
tags: ["view"]
thumbnail: /img/top/LockScreen.png
---

> 如果写过`Android`相关的音乐播放器，我们都知道可以从锁屏界面控制音乐的播放、暂停、上／下一曲等操作，那如何打造一个自己应用的锁屏界面呢？

<!--more-->

![LockScreen](/img/lockscreen/lockscreen.jpg)

## 锁屏监听

如果想要进行锁屏展示，就需要对锁屏进行监听，那如何进行监听？

那就先需要一个BroadcastReceiver去接收系统发出的是否已经处于锁屏状态？如果锁屏，那么就启动自己的锁屏界面．	

```java
public class LockScreenReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (Intent.ACTION_SCREEN_OFF.equals(action)){
            Intent lockIntent = new Intent(context, LockScreenActivity.class);
            lockIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
            context.startActivity(lockIntent);
        }
    }
}
```

然后我们得运行一个Service，只有这样才能在APP运行期间进行监听是否锁屏了

```java
public class LockScreenService extends Service {

    private LockScreenReceiver mReceiver;

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        mReceiver = new LockScreenReceiver();
        IntentFilter filter = new IntentFilter();
        filter.addAction(Intent.ACTION_SCREEN_OFF);
        filter.addAction(Intent.ACTION_USER_PRESENT);
        registerReceiver(mReceiver,filter);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        unregisterReceiver(mReceiver);
    }
}
```

注意需要在`AndroidManifest`中加入
```xml
<service android:name=".base.service.LockScreenService"
            android:exported="false"/>

<receiver android:name=".base.service.NotificationClickReceiver"/>
```

## 绘制锁屏
我们这里是使用Activity作为锁屏界面，也就是我们这里的LockScreenActivity，Activity能够直接作为锁屏界面？当然是不能的，我们得为其赋予足够的权限

* 在`AndroidManifest`中增加锁屏所需的权限

```xml
<!--锁屏权限-->
<uses-permission android:name="android.permission.DISABLE_KEYGUARD"/>
```

* 给锁屏界面设置Flag，在onCreate()方法中添加如下代码

```java
Window window = getWindow();
window.addFlags(WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD|WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED);
```

其实为APP添加一个锁屏界面到这里基本已经完成了，但是这是不够的，在解锁的时候，我们发现这个锁屏界面不会跟随我们手指的移动进行滑动，所以我们还需要让我们的锁屏界面进行滑动．

## 滑动解锁
我们需要自定义一个`ViewGroup`，将我们自定义布局包裹起来，这里选择FrameLayout，实现将包裹内容可以滑动，所以这个自定义的`ViewGroup`只需要一个ChildView．

### 自定义View
重写其中的`onTouchEvent`方法，在进行滑动的时候跟着手指移动，在滑动到临界点的时候，将当前锁屏界面finish掉就行，实现代码如下．

```java
public class LockScreenView extends FrameLayout {
    private float mStartX;
    private View mMovieView;
    private int mWidth;

    private Handler mHandler;

    public LockScreenView(@NonNull Context context) {
        super(context);
    }

    public LockScreenView (@NonNull Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
    }

    public LockScreenView (@NonNull Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    public void setHandler(Handler handler) {
        mHandler = handler;
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        super.onLayout(changed, left, top, right, bottom);
        if (getChildCount() > 0) {
            mMovieView = getChildAt(0);
            mWidth = mMovieView.getWidth();
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        int action = event.getAction();
        float nx = event.getX();
        switch (action) {
            case MotionEvent.ACTION_DOWN:
                mStartX = nx;
                onAnimationEnd();
                break;
            case MotionEvent.ACTION_MOVE:
                handleMoveView(nx);
                break;
            case MotionEvent.ACTION_CANCEL:
            case MotionEvent.ACTION_UP:
                doTriggerEvent(nx);
                break;
        }
        return true;
    }

    private void handleMoveView(float x) {
        float moveX = x - mStartX;
        if (moveX < 0) {
            moveX = 0;
        }
        mMovieView.setTranslationX(moveX);
        float mWidthFloat = mWidth;
        if (getBackground() != null) {
            getBackground().setAlpha((int) ((mWidthFloat - mMovieView.getTranslationX()) / mWidthFloat * 200));
        }
    }

    private void doTriggerEvent(float x){
        float moveX = x- mStartX;
        if (moveX > (mWidth*0.4)){
            move(mWidth - mMovieView.getLeft(),true);
        }else {
            move(-mMovieView.getLeft(),false);
        }
    }

    private void move(float to, boolean exit){
        ObjectAnimator animator = ObjectAnimator.ofFloat(mMovieView,"translationX",to);
        animator.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
            @Override
            public void onAnimationUpdate(ValueAnimator animation) {
                if (getBackground()!=null){
                    getBackground().setAlpha((int) ((mWidth - mMovieView.getTranslationX()) / mWidth * 200));
                }
            }
        });
        animator.setDuration(250).start();
        if (exit){
            animator.addListener(new AnimatorListenerAdapter() {
                @Override
                public void onAnimationEnd(Animator animation) {
                    if (mHandler!=null){
                        mHandler.obtainMessage(LockScreenActivity.MSG_LAUNCH_HOME).sendToTarget();
                    }
                    super.onAnimationEnd(animation);
                }
            });
        }
    }
}
```
以上大概３个流程：

* onLayout中获取当前子View和它的宽
* onTouchEvent中滑动处理
* 当滑动到临界点的时候，就finish当前`LockScreenActivity`

### 屏蔽物理返回

我们还需将物理返回键屏蔽掉，才能在我们侧滑的时候不至于还没移动到临界点就被finish了．

```java
@Override
public void onBackPressedSupport() {
    
}
```

## 参考
[Android锁屏实现与总结](https://www.jianshu.com/p/6c3a6b0f145e)
