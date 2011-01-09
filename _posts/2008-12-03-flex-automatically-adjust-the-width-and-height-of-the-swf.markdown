---
layout: post
title: Flex自动调整swf的宽度和高度
categories:
- flex
---
Flex应用的宽度和高度可以通过mx:Applicaton的width和height来调整，但是用FB创建的html调用是写死了宽度和高度，如：

{% highlight javascript %}
AC_FL_RunContent(
  “src”, “test”,
  “width”, “600”,
  “height”, “300”,
  ...
}
{% endhighlight %}

这样的话，要是swf应用的宽度或高度调整了，页面上会出现滚动条。要是希望能够动态调整宽度和高度，只需要修改html中的参数：

{% highlight javascript %}
AC_FL_RunContent(
  “src”, “test”,
  “width”, “100%”,
  “height”, “100%”,
  ...
}
{% endhighlight %}

这样只需在Flex中调整mx:Application的width和height即可

