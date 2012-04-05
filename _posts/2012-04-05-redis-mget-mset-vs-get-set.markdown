---
layout: post
title: redis mget/mset vs get/set
categories:
- ruby
- redis
---
Our application uses redis a lot to perform large numbers of data
reads/writes. But we didn't use it well enough, e.g. we call redis get
and set in loop, just like touching mysql and memcache many times, it
takes a long time to send multiple redis commands, if we can reduce the
commands, it saves on round trip time.

The following script is used to bencharmark different commands count.
{% highlight ruby %}
require 'redis'
require 'benchmark'

redis = Redis.new
Benchmark.bm(50) do |bm|
  bm.report "redis set" do
    10000.times do |i|
      redis.set("key#{i}", "value#{i}")
    end
  end

  bm.report "redis get" do
    10000.times do |i|
      redis.get("key#{i}")
    end
  end

  bm.report "redis mset with 1000" do
    1000.times do |i|
      keys = (10*i...10*i+10).map { |j| ["yek#{j}", "value#{j}"] }.flatten
      redis.mset(*keys)
    end
  end

  bm.report "redis mget with 1000" do
    1000.times do |i|
      keys = (10*i...10*i+10).map { |j| "yek#{j}" }
      redis.mget(*keys)
    end
  end

  bm.report "redis mset with 100" do
    100.times do |i|
      keys = (100*i...100*i+100).map { |j| ["eky#{j}", "value#{j}"] }.flatten
      redis.mset(*keys)
    end
  end

  bm.report "redis mget with 100" do
    100.times do |i|
      keys = (100*i...100*i+100).map { |j| "eky#{j}" }
      redis.mget(*keys)
    end
  end

  bm.report "redis mset with 10" do
    10.times do |i|
      keys = (1000*i...1000*i+1000).map { |j| ["eyk#{j}", "value#{j}"] }.flatten
      redis.mset(*keys)
    end
  end

  bm.report "redis mget with 10" do
    10.times do |i|
      keys = (1000*i...1000*i+1000).map { |j| "eyk#{j}" }
      redis.mget(*keys)
    end
  end

  bm.report "redis mset with 1" do
    keys = (0...10000).map { |j| ["kye#{j}", "value#{j}"] }.flatten
    redis.mset(*keys)
  end

  bm.report "redis mget with 1" do
    keys = (0...10000).map { |j| "kye#{j}" }
    redis.mget(*keys)
  end
end
{% endhighlight %}

This is the benchmark result.
{% highlight ruby %}
#                             user   system      total        real
#  redis set              0.280000   0.170000   0.450000 (  0.809112)
#  redis get              0.290000   0.160000   0.450000 (  0.806711)
#  redis mset with 1000   0.070000   0.020000   0.090000 (  0.148474)
#  redis mget with 1000   0.080000   0.020000   0.100000 (  0.142837)
#  redis mset with 100    0.050000   0.000000   0.050000 (  0.067859)
#  redis mget with 100    0.050000   0.010000   0.060000 (  0.063040)
#  redis mset with 10     0.040000   0.000000   0.040000 (  0.060200)
#  redis mget with 10     0.050000   0.000000   0.050000 (  0.057818)
#  redis mset with 1      0.040000   0.000000   0.040000 (  0.062318)
#  redis mget with 1      0.050000   0.000000   0.050000 (  0.057483)
{% endhighlight %}

It's obvious that less redis commands means fast running time.
