---
layout: post
title: Construct Nested Hash in Ruby
categories:
- Ruby
---
I just received a post request on rails-bestpractices.com from hlxwell, he recommend "Nested hash simple initialization."

Change From

{% highlight ruby %}
cache_data = {}
cache_data['a'] ||= {}
cache_data['a']['b'] ||= {}
cache_data['a']['b']['c'] ||= {}
cache_data['a']['b']['c']['d'] ||= {}
cache_data['a']['b']['c']['d'] = something...
{% endhighlight %}

To

{% highlight ruby %}
cache_data = Hash.new { |h1,k1| h1[k1] = Hash.new { |h2,k2| h2[k2] = Hash.new { |h3,k3| h3[k3] = Hash.new { |h4,k4| h4[k4] = {} } } } }
cache_data['a']['b']['c']['d'] = something...
{% endhighlight %}

Frankly speeking, I don't agree with him.

1. I don't think he needs the too much level nested hash, he may reconsider his design of data structure.

2. If he really needs such nested hash, he should use the more graceful way instead

{% highlight ruby %}
leet = lambda {|hash, key| hash[key] = Hash.new(&leet)}
cache_data = Hash.new(&leet)
cache_data['a']['b']['c']['d'] = something..
{% endhighlight %}

