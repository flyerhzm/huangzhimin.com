---
layout: post
title: autotest notify for Ubuntu
categories:
- Ruby
- Linux
---
一直很羡慕Mac下的growl，每次autotest都可以弹出个提示框，好眩。如今Ubuntu的用户也有了自己的通知系统notify OSD，赶紧用到自己的autotest上面。

google了一下，已经有人做了gem来调用ubuntu notify osd，http://github.com/stack/autotest-notify-osd

{% highlight bash %}
sudo gem install autotest-notify-osd
{% endhighlight %}

安装好这个gem之后，在~/.autotest下增加下面一行

{% highlight ruby %}
require 'autotest/notify-osd'
{% endhighlight %}

运行autotest，返回sh: notify-send: not found错误，原来少装了libnotify-bin

{% highlight bash %}
sudo apt-get install libnotify-bin
{% endhighlight %}

再次运行autotest，右上角显示所有的测试都通过，太cool了

