---
layout: post
title: How I find out a memory leak in grape
categories:
- ruby
---

I'm helping my customer build a high performance api service these
weeks, we are close to release, but when I did load test this Wednesday,
I found the memory kept growing when I sent traffic and never went down,
it was obviously a memory leak.

Lucky is I can reproduce the memory leak on my local machine, so I can
detect it easily. Our api service is simple, only contains model layer
(AR and redis) and api layer (based on [grape][0]). At first, I disabled
model layer, but memory leak was still there, so I was pretty sure the
leak was in api layer.

Memory leak is always not easy to find, especially when I'm not sure
where it is, in my own code or some dependent libraries I used. I need
some tools' help.

First, I used [heap_dump][1] to dump the ruby heap memory after sending
10 minutes' traffic, and searched the keywords used in our repository, I
noticed every request path string resided in memory, why? Was there an
array or hash used them? heap_dump can't answer me.

Then I tried ruby 1.9.3 ObjectSpace to find more info. I changed
Grape::API.call behavior, printing live objects for each request.

{% highlight ruby %}
def call_with_gc(env)
  GC.start
  result = call_without_gc(env)
  p ObjectSpace.count_objects
  result
end
{% endhighlight %}

The followings are parts of the result

{% highlight bash %}
{:TOTAL=>331126, :FREE=>218067, :T_OBJECT=>3339, :T_CLASS=>3394, :T_MODULE=>474, :T_FLOAT=>195, :T_STRING=>55324, :T_REGEXP=>1135, :T_ARRAY=>20188, :T_HASH=>926, :T_STRUCT=>125, :T_BIGNUM=>22, :T_FILE=>4, :T_DATA=>16011, :T_MATCH=>13, :T_COMPLEX=>1, :T_RATIONAL=>33, :T_NODE=>11273, :T_ICLASS=>602}
[23153:INFO] 2012-12-16 21:59:55 :: Status: 200, Content-Length: 19, Response Time: 42.43ms
{:TOTAL=>331126, :FREE=>218066, :T_OBJECT=>3339, :T_CLASS=>3394, :T_MODULE=>474, :T_FLOAT=>195, :T_STRING=>55325, :T_REGEXP=>1135, :T_ARRAY=>20188, :T_HASH=>926, :T_STRUCT=>125, :T_BIGNUM=>22, :T_FILE=>4, :T_DATA=>16011, :T_MATCH=>13, :T_COMPLEX=>1, :T_RATIONAL=>33, :T_NODE=>11273, :T_ICLASS=>602}
[23153:INFO] 2012-12-16 21:59:56 :: Status: 200, Content-Length: 20, Response Time: 43.29ms
{:TOTAL=>331126, :FREE=>218065, :T_OBJECT=>3339, :T_CLASS=>3394, :T_MODULE=>474, :T_FLOAT=>195, :T_STRING=>55326, :T_REGEXP=>1135, :T_ARRAY=>20188, :T_HASH=>926, :T_STRUCT=>125, :T_BIGNUM=>22, :T_FILE=>4, :T_DATA=>16011, :T_MATCH=>13, :T_COMPLEX=>1, :T_RATIONAL=>33, :T_NODE=>11273, :T_ICLASS=>602}
[23153:INFO] 2012-12-16 21:59:57 :: Status: 200, Content-Length: 20, Response Time: 45.74ms
{% endhighlight %}

As you can see, every request, there was a string couldn't be garbage
collected, but I still didn't know where it was. I commented my logic
code in api layer, just returned an empty json, and string leak still
existed, then I went to grape source code, commented the code in
[Grape::API#call][2] method, updated as following code

{% highlight ruby %}
def call(env)
  [200, {}, ""]
end
{% endhighlight %}

After that, the string memory leak disappeared, It was a strong
possibility that memory leak was in grape gem.

Next thing was pretty easy, tried to replace grape middleware one by one,
grape middleware has 3 methods, call!, before and after, will be called
in every request, I replaced all of them to figure out leak.

Finally, I found it's [method format_from_extension][3] in grape Formatter
middleware caused memory leak, it genereate a symbol no matter if there
is an extension in the request path, e.g.

if requesting /v1/blog/post/1, it will create symbol :"/v1/blog/posts/1"

if requesting /v1/blog/post/2, it will create symbol :"/v1/blog/posts/2"

......

In case you don't know, symbol won't be garbage collected in ruby, so
every time it got a request path different then before, it created a
symbol in memory which won't be garbage collected.

Problem detected, solution is [here][4].

In conclusion, be careful to ruby symbol, do not convert any non
controlled string to symbol.

[0]: https://github.com/intridea/grape
[1]: https://github.com/Vasfed/heap_dump
[2]: https://github.com/intridea/grape/blob/v0.2.2/lib/grape/api.rb#L49
[3]: https://github.com/intridea/grape/blob/v0.2.2/lib/grape/middleware/formatter.rb#L43
[4]: https://github.com/intridea/grape/pull/291
