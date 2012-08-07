---
layout: post
title: jruby-memcached 0.3.0 released
categories:
- jruby
- memcached
---
I just released [jruby-memcached 0.3.0][0], it runs about 10%-20%
faster than 0.2.0, I removed ruby code and totally wrote it by java
code, check out the [file changes][1].

2 weeks ago, I released jruby-memcached 0.1.0, in [that post][2] I
mentioned jruby-memcached response time in a request is 40+ms while
memcached.gem response time is 30+ms, it looked fine, but I was
still investigating the way to improve jruby-memcached performance.

After reading [jruby-spymemcached][3] gem and jruby source code, I
rewrote jruby-memcached by pure java code instead of ruby code,
because calling java from java is much faster than from ruby.

I did the performance compare with new jruby-memcached, the result is
as follows:

{% highlight text %}
MBP 2.8G i7    jruby-memcached 0.3.0

ruby-1.9.3-p194
                              user     system      total        real
memcached set              1.110000   1.020000   2.130000 (  4.592509)
memcached get              0.970000   1.000000   1.970000 (  4.172170)
                               user     system      total        real
dalli set                  8.360000   1.650000  10.010000 ( 10.193101)
dalli get                  8.040000   1.670000   9.710000 (  9.828392)

jruby-1.6.7.2
                              user     system      total        real
jruby-memcached set       5.842000   0.000000   5.842000 (  5.842000)
jruby-memcached get       5.561000   0.000000   5.561000 (  5.561000)
                              user     system      total        real
jruby-spymemcached set    5.919000   0.000000   5.919000 (  5.919000)
jruby-spymemcached get    5.615000   0.000000   5.615000 (  5.615000)
                              user     system      total        real
dalli set                10.132000   0.000000  10.132000 ( 10.132000)
dalli get                10.600000   0.000000  10.600000 ( 10.600000)
{% endhighlight %}

As you can see, jruby-memcached runs as fast as jruby-spymemcached, and
it provides memcached.gem compatible apis and hashing algorithm.
jruby-memcached is still slower than memcached.gem, and on production,
the response time for memcached has reduced to 40-ms, which is very
close to the memcached.gem performance.

[0]: https://rubygems.org/gems/jruby-memcached/versions/0.3.0
[1]: https://github.com/aurorafeint/jruby-memcached/compare/v0.2.0...v0.3.0
[2]: http://huangzhimin.com/2012/07/24/jruby-memcached-0-1-0-released/
[3]: https://github.com/headius/jruby-spymemcached
