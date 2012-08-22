---
layout: post
title: jruby-memcached 0.5.0 released
categories:
- jruby
- memcached
---
I just released [jruby-memcached 0.5.0][0], it contains the following
changes:

1. add travis-ci support, testing jruby-18mode, jruby-19mode and
   jruby-head environment.
2. update spymemcached to 2.8.3, which set shouldOptimize to false by
   default, there are some bugs with true shouldOptimize so far.
3. fix increment/decrement issue, in < 0.5.0, incr/decr with unmarshal
   encode while get with marshal decode.
4. accept exception_retry_limit option.
5. add Memcached::ATimeoutOccurred error to handle timeout case,
   otherwise you will probably see following error.

{% highlight ruby %}
ActionView::TemplateError: undefined method `clean_message' for #<Java::NetSpyMemcached::OperationTimeoutException:0x26e02e71>
{% endhighlight %}


check out the full code changes [here][1].

[0]: https://rubygems.org/gems/jruby-memcached/versions/0.5.0
[1]: https://github.com/aurorafeint/jruby-memcached/compare/v0.4.0...v0.5.0
