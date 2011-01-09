---
layout: post
title: Css消除Image点击后的虚线框
categories:
- css
---
网上很多文章关于这个问题都是说使用

{% highlight css %}
a img {border: 0}
{% endhighlight %}

其实这是不够的，应该还要加上

{% highlight css %}
outline: 0
{% endhighlight %}

对于通过a做成的button也同样适用

