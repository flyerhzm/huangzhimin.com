---
layout: post
title: ruby rescue
categories:
- Ruby
---
ruby的异常处理和java很相似

{% highlight ruby %}
begin
  ...
rescue
  ...
end
{% endhighlight %}

rescue默认只会接受StandardError

{% highlight ruby %}
irb(main):001:0> begin
irb(main):002:1* 1 / 0
irb(main):003:1> rescue
irb(main):004:1> puts "divide 0"
irb(main):005:1> end
divide 0
{% endhighlight %}

但是像SyntaxError并不是继承StandardError的，就无法被resuce

{% highlight ruby %}
irb(main):001:0> begin
irb(main):002:1* eval("1 +")
irb(main):003:1> rescue
irb(main):004:1> puts "syntax error"
irb(main):005:1> end
SyntaxError: (eval):1:in `irb_binding': compile error
(eval):1: syntax error, unexpected $end
	from (irb):2
	from (irb):2
	from :0
{% endhighlight %}

这种情况必须指定相应的Error或者是所有异常的基类Exception

{% highlight ruby %}
irb(main):001:0> begin
irb(main):002:1* eval("1 +")
irb(main):003:1> rescue Exception
irb(main):004:1> puts "syntax error"
irb(main):005:1> end
syntax error
{% endhighlight %}

最后附上Exception Hierarchy

{% highlight ruby %}
Exception
 NoMemoryError
 ScriptError
   LoadError
   NotImplementedError
   SyntaxError
 SignalException
   Interrupt
 StandardError
   ArgumentError
   IOError
     EOFError
   IndexError
   LocalJumpError
   NameError
     NoMethodError
   RangeError
     FloatDomainError
   RegexpError
   RuntimeError
   SecurityError
   SystemCallError
   SystemStackError
   ThreadError
   TypeError
   ZeroDivisionError
 SystemExit
 fatal
{% endhighlight %}

