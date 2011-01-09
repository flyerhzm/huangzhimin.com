---
layout: post
title: require某个版本的gem
categories:
- Ruby
- RubyGems
---
一般我们require一个gem，都是require最新的版本

{% highlight ruby %}
irb(main):001:0> require 'rubygems'
=> true
irb(main):002:0> require 'activerecord'
=> true
irb(main):003:0> ActiveRecord::VERSION::STRING
=> "2.3.4"
{% endhighlight %}

如果需要require一个旧版本的gem该怎么办呢？只需要在require之前指定gem的版本即可

{% highlight ruby %}
irb(main):001:0> require 'rubygems'
=> true
irb(main):002:0> gem 'activerecord', '2.3.2'
=> true
irb(main):003:0> require 'activerecord'
=> true
irb(main):004:0> ActiveRecord::VERSION::STRING
=> "2.3.2"
{% endhighlight %}

是不是看上去和rails的用法蛮像的？

