---
layout: post
title: 用css截取字符串
categories:
- css
---
一般网页上显示字符串有两种方式，一是通过程序语言，如php, java来截取，二是通过css来截取。前者的缺点是页面上字符缺失，不利于SEO，而且遇到中英文混合时，往往造成截取长度不同；css的缺点是有可能在页面上看到截取一半的字。不过总体还是css的优点占优。

下面是css截取字符串的代码：

{% highlight css %}
div {
  width:300px;
  white-space:nowrap;
  overflow:hidden;
  float:left;
  -o-text-overflow:clip;     /* for Opera */
  text-overflow:clip;        /* for IE */
}
{% endhighlight %}

如果你想在截取字符串之后加上...可以用以下的代码：

{% highlight css %}
div {
  width:300px;
  white-space:nowrap;
  overflow:hidden;
  float:left;
  -o-text-overflow:ellipsis;     /* for Opera */
  text-overflow:ellipsis;        /* for IE */
}
div:after {
  content:"...";   /* for Firefox */
}
{% endhighlight %}

