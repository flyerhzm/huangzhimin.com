---
layout: post
title: Safari video tag without referer header
categories:
- html5
- s3
---

We're building a website which needs to play video online, we know it's
pretty easy for modern browsers who support html5, like chrome and
safari, they all support video tag, which can play video files online
directly.

{% highlight html %}
<video controls>
  <source src="RESOURCE URL HERE" />
</video>
{% endhighlight %}

It's supposed to work for most cases, but our video resources are
uploaded to s3, and our s3 policy for video resources is only when HTTP
referer header is one of our websites, then the video resources can be
accessed, this is used to prevent our video resources to be played on
other website.

I noticed the videos are played welled on chrome, but not on safari,
after some time's digging, I found the chrome will send requests to
fetch video resources with expected http headers, including referer
header, but safari's video requests won't carry any http header, it
causes the video requests are refused by s3.

One solution is to use flash video player, which sends requests with
proper http headers, although flash is old, it's still installed on most
of computers, but it won't help on ios devices (iphone and ipad). So the
only way to make it work on ios is to change our s3 policy, allow the
special referer header "empty".
