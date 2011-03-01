---
layout: post
title: Upgrade Mongoid - Hash arguments for group
categories:
- mongoid
- Ruby
---
You will receive a warning for the group method call after upgrading mongoid.

{% highlight bash %}
Collection#group no longer take a list of paramters. This usage is deprecated.
{% endhighlight %}

exactly this is because mongo gem changes the group method definition.

Before

{% highlight ruby %}
key = ["ad_id"]
conditions = { 'ad_id' => { '$in' => ad_ids } }
initial = { "impressions" => 0.0, "clicks" => 0.0 }
reduce = "a reduce javascript function"

AdStat.collection.group(key, conditions, initial, reduce).each do |e|
  ......
end
{% endhighlight %}

After

{% highlight ruby %}
key = ["ad_id"]
conditions = { 'ad_id' => { '$in' => ad_ids } }
initial = { "impressions" => 0.0, "clicks" => 0.0 }
reduce = "a reduce javascript function"

AdStat.collection.group(:key => key, :conditions => conditions, :initial => initial, :reduce => reduce).each do |e|
  ......
end
{% endhighlight %}

This is the usage of hash arguments, it makes the group calling more readable.
