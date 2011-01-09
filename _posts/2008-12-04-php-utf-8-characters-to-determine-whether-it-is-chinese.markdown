---
layout: post
title: php判断utf-8字符是否是中文？
categories:
- php
---
使用正则表达式，比如下面判断$username是否完全是中文：

{% highlight php %}
preg_match("/^[\x{4e00}-\x{9fa5}]+$/u", $username);
{% endhighlight %}

