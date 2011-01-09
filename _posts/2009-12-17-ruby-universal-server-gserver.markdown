---
layout: post
title: ruby通用服务器gserver
categories:
- Ruby
---
之前随手翻了几页Programming Ruby 1.9，看到了gserver，查看ruby-doc，原来gserver是一个通用服务器的实现，提供了线程池管理，简单的日志和多服务器管理。

先看看怎么使用吧

{% highlight ruby %}
require 'gserver'

class TimeServer < GServer
  def initialize(port=10001, *args)
    super(port, *args)
  end

  def serve(io)
    io.puts(Time.now.to_i)
  end
end

server = TimeServer.new
server.audit = true

['INT', 'TERM'].each { |signal|
  trap(signal) { server.stop }
}
server.start.join
{% endhighlight %}

上面这段代码就是一个简单的tcp服务器，返回系统当前时间与1970年之间的秒数差。

其中3-11行是定义服务器，继承GServer，必须实现serve方法，来实现服务器的行为。

14行启动服务器的日志功能。

16-18行定义当前进程收到中断信号时，关闭服务器。

最后一行，启动服务器，并且保持当前进程active，直到服务器线程被关闭为止。

下一章将介绍gserver的源代码

