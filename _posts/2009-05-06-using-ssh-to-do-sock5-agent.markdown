---
layout: post
title: 用SSH做sock5代理
categories:
- Linux
---
在伟大的GFW之下，我的itunes再也无法订阅feedburner上的podcasts了，真的很无奈。

还好前不久在hostmonster上开通了SSH账号，于是开始翻墙

{% highlight bash %}
ssh -D8938 username@domain.com
{% endhighlight %}

于是，只要设置本地的Socks5代理为127.0.0.1:8938即可

再次下载到feedburner上的podcasts，太好了！

