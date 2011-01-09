---
layout: post
title: 给ImageSwitcher增加键盘响应
categories:
- Android
---
网上关于ImageSwitcher的例子都是通过Gallery来切换图片的。

我做了一个通过键盘左键/右键来切换图片的例子：

首先是定义键盘的监听器

{% highlight java %}
private View.OnKeyListener mKeyListener = new View.OnKeyListener() {
    @Override
    public boolean onKey(View v, int keyCode, KeyEvent event) {
        if (event.getAction() == KeyEvent.ACTION_DOWN) {
            switch (keyCode) {
            case KeyEvent.KEYCODE_DPAD_LEFT:
                showPrevious();
                break;
            case KeyEvent.KEYCODE_DPAD_RIGHT:
                showNext();
                break;
            default:
                break;
            }
        }
        return true;
    }
};
{% endhighlight %}

然后是绑定监听器

{% highlight java %}
mSwitcher.setOnKeyListener(mKeyListener);
mSwitcher.setFocusable(true);
{% endhighlight %}

特别注意第二句，mSwitcheer.setFocusable(true)，只有当mSwitcher获得焦点，键盘响应才有效果！

