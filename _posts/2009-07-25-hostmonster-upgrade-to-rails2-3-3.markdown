---
layout: post
title: Hostmonster升级到Rails2.3.3
categories:
- Hostmonster
- Rails
---
前两天Hostmonster把Rails升级到2.3.3，导致我的网站无法访问。查看日志，Dispatcher failed to catch: undefined method `read' for class `FCGI::Stream' (NameError)，给Hostmonster提交了ticket，到现在都还没有结果，没办法，只能靠自己了。

google了一下，可能是rack中的一段代码的问题。

首先，安装好自己的gem repository，并且在environment.rb中指定：

{% highlight bash %}
ENV['GEM_PATH'] = '/home7/huangzhi/ruby/gems:/usr/lib/ruby/gems/1.8'
{% endhighlight %}

然后，指定app的rails为2.3.3：

{% highlight bash %}
RAILS_GEM_VERSION = '2.3.3' unless defined? RAILS_GEM_VERSION
{% endhighlight %}

最后，修改gem中rack-1.0.0/lib/rack/handler/fastcgi.rb文件，将第7行注释掉

{% highlight bash %}
#  alias _rack_read_without_buffer read
{% endhighlight %}

OK，这样就可以顺利访问啦！

