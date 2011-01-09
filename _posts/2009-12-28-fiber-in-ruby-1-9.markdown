---
layout: post
title: Fiber in Ruby 1.9
categories:
- Ruby
---
Ruby 1.9新推出了Fiber这个新的概念，有人说它是轻量级的Thread，其实不然。它是一段代码块，可以停止、继续，可以有返回值、写入值，有多个Fiber时，它们的执行顺序是固定。它和Thread相似的是，它的执行不是线性的，它可以在中途停止，将控制权交给主程序或者是其它的Fiber，但是中控制权交接的过程是由你来控制的，而不是线程调度程序。所以有时候Fiber可以完成之前只能用Thread才能完成的任务（比如：Producer-Consumer）。

先来看看一个例子吧：

{% highlight ruby %}
require 'fiber'

fiber = Fiber.new do
  (1..3).each do |i|
    Fiber.yield(i)
  end
end

while fiber.alive?
  puts fiber.resume
end
{% endhighlight %}

运行结果是

{% highlight bash %}
1
2
3
1..3
{% endhighlight %}

首先，Fiber.new定义了一个Fiber，但是并不会执行，直到调用这个Fiber的resume方法，这个Fiber才会执行，并且当执行到Fiber.yield时停止，并且把yield的参数返回给主程序，同时将控制权将给主程序。然后主程序继续执行，调用这个Fiber的resume方法，这个Fiber从刚才停止的地方继续执行，直到Fiber.yield，以此类推。当这个Fiber执行完毕时，Fiber#alive?返回false，如果这个时候继续调用Fiber#resume，系统将抛出异常。

运行结果稍微与我们的预想有点偏差，我们并不需要最后一行1..3，原因是在调用三次Fiber#resume分别返回1、2、3，这个时候Fiber并没有执行完毕，所以Fiber#alive?仍然返回true，第四次调用Fiber#resume返回的这个Fiber block内的返回值，这里就是(1..3)，所以我们需要对程序做点小小的修改

{% highlight ruby %}
require 'fiber'

fiber = Fiber.new do
  (1..3).each do |i|
    Fiber.yield(i)
  end
end

loop do
  output = fiber.resume
  break unless fiber.alive?
  puts output
end
{% endhighlight %}

这下运行的结果就和预期一致了。

再来看看如何向Fiber写入数据

{% highlight ruby %}
require 'fiber'

fiber = Fiber.new do
  loop do
    input = Fiber.yield
    break if input.to_s.empty?
    puts input
  end
end

(1..3).each do |i|
  fiber.resume i
end
{% endhighlight %}

运行结果

{% highlight bash %}
2
3
{% endhighlight %}

这和从Fiber中读取数据是个相反的操作，通过给Fiber#resume传递参数将数据作为Fiber.yield的返回值传入Fiber。

你可能会很奇怪，为什么只打印了2和3，没有1呢？因为在第一次调用Fiber#resume的时候，Fiber还没有开始，resume的参数是传递给Fiber block的，当这个Fiber运行到Fiber.yield时，这个Fiber停止，然后第二次调用Fiber#resume的时候，将2传递了Fiber，并作为yield的返回值，所以打印了2，我们需要修改一下代码来打印1、2、3

{% highlight ruby %}
require 'fiber'

fiber = Fiber.new do |title|
  puts title
  loop do
    input = Fiber.yield
    break if input.to_s.empty?
    puts input
  end
end

fiber.resume 'title'
(1..3).each do |i|
  fiber.resume i
end
{% endhighlight %}

运行结果为

{% highlight bash %}
title
1
2
3
{% endhighlight %}

如果需要在两个Fiber之间切换的话，可以使用Fiber#transfer，用来实现Producer-Consumer。

