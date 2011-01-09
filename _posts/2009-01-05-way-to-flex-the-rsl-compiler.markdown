---
layout: post
title: flex的RSL编译方式
categories:
- flex
---
flex编译出来swf文件往往很大，尤其有了图形界面，要想少于100K几乎是不可能的，但是在网页上加载这么大的flash又是很耗时的。

不过adobe提供了runtime share libraries机制，它允许客户端缓存flex类库，这样大大减少了网络数据的传输。

RSL分为两种，一种是签名的，只有Adobe的类库才能使用签名的方式，用的是framework_3.x.x.xxx.swz。只要客户端的flash版本大于等于9.0.115，就可以利用签名方式的RSL，类库将由flash来缓存；另一种是非签名的，用的是framework_3.x.x.xxx.swf。类库是由客户端的浏览器缓存的。

RSL的编译参数如下：

{% highlight bash %}
mxmlc test.mxml -runtime-shared-library-path=F:\FlashTools\flex3sdk\frameworks\libs\framework.swc,framework_3.1.0.2710.swz,,framework_3.1.0.2710.swf
{% endhighlight %}

本来test.mxml编译出来有140多K，现在只有50多K，减少了60%多哦！

