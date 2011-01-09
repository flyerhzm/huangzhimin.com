---
layout: post
title: Ruby triple equal
categories:
- Ruby
---
今天读sexp_processor源代码，看到有多出调用 Class === Object 这样的语法，突然之间没想出来===是干嘛的了。网上搜索了一下，原来是判断后面这个对象是不是前面这个类的实例，比如

{% highlight ruby %}
>> Object === Object.new
=> true
{% endhighlight %}

这个和is_a?不就没区别了吗？

{% highlight ruby %}
>> Object.new.is_a? Object
=> true
{% endhighlight %}

google一把，好像是说===比is_a?更优雅，而且===被用在case...when的语法当中

{% highlight ruby %}
case shape
when Square, Rectangle
  # ...
when Triangle
  # ...
else
  # ...
end
{% endhighlight %}

上面这段代码摘自Programming Ruby

