---
layout: post
title: Ruby1.9的中文问题
categories:
- Ruby
---
今天在ruby 1.9.1的环境下试了一下1.8.7下面写的一段代码，结果报错：syntax error, unexpected $end, expecting '}'，查看了一下代码，如下

{% highlight ruby %}
STATUS = {
  "400" => "在线",
  "300" => "离开",
  "600" => "繁忙",
  "0" => "脱机"
}
{% endhighlight %}

语法完全没有问题，判断是中文导致的问题，奇怪的是在1.8.7下面运行正常。google了一下，原来只要在文件开头加上coding就可以了

{% highlight ruby %}
#coding: utf-8
{% endhighlight %}

