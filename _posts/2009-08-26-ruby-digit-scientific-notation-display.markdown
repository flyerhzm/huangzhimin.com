---
layout: post
title: ruby数字的科学记数法显示
categories:
- Ruby
---
当网页需要显示很长的数字时，比如：100000000, 0.00000001，有时候会影响页面布局，而且也不方便阅读。改用科学记数法就会方便很多，比如：1e+08, 1e-08。ruby和其它语言一样，可以通过String的format来格式化数字。

{% highlight ruby %}
def number_to_scientific(num)
  "%g" % num
end

>> number_to_scientific(100000000)
=> "1e+08"
>> number_to_scientific(0.000000001)
=> "1e-09"
{% endhighlight %}

