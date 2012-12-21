---
layout: post
title: newrelic-grape released
categories:
- newrelic
- grape
---
**No instrumentation, no performance tuning!**

This is my first time to use [grape][0] to build an api service, grape
repo has more than 2k watchers, but I'm surprised there is no existing
newrelic grape suppport, I just found some gists to do it, and this
[blog post][1] gave me the idea to add newrelic instrument as grape
middleware, but it's not the standard way newrelic recommends.

So I released [newrelic-grape][2] gem to help you integrate newrelic
into grape.

What you need to do is

{% highlight ruby %}
require "newrelic-grape"
require "rpm_contrib"
{% endhighlight %}

and monitor the performance on newrelic.

[0]: https://github.com/intridea/grape
[1]: http://artsy.github.com/blog/2012/11/29/measuring-performance-in-grape-apis-with-new-relic/
[2]: https://github.com/flyerhzm/newrelic-grape
