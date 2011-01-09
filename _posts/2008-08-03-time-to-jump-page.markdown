---
layout: post
title: 页面定时跳转
categories:
- html
---
页面定时跳转是指一个页面在显示了一定的时间之后自动跳转到另外一个页面，实现起来非常容易：

{% highlight html %}
<meta content="3;login.jsp" http-equiv="Refresh" />
{% endhighlight %}

以上这行代码实现了3秒之后自动跳转到login.jsp页面，只使用了html的meta标签，比用什么javascript方便多了呢！

