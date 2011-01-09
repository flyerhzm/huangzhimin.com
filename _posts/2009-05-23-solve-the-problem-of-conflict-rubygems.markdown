---
layout: post
title: 解决rubygems冲突的问题
categories:
- Ruby
- Hostmonster
---
在hostmonster上面手动编译了ruby和rubygems，不过今天在尝试rake gems:unpack的时候报错，说是调用了nil.version，一跟踪，原来是找不到gem的spec。不过明明是装好没问题的呀，奇怪了。于是去irb中尝试：

{% highlight ruby %}
require 'rubygems'
=> true
require 'spec'
=> no such file to load -- spec
{% endhighlight %}

看来是rubygems路径的问题。可能是和hostmonster默认的rubygems路径冲突了，于是在.bashrc中显示指定GEM_PATH

{% highlight bash %}
export GEM_HOME=$HOME/ruby/gems
export GEM_PATH=$GEM_HOME:/usr/lib/ruby/gems/1.8
{% endhighlight %}

重新在irb中执行require 'spec'返回true，执行rake gems:unpack也OK了！

