---
layout: post
title: Upgrade Mongoid - update_attribute
categories:
- mongoid
- Ruby
---
Before mongoid 2.0.0.rc.6, there is no update_attribute method for Mongoid::Document, it makes me unhappy. As in ActiveRecord world, I always use update_attribute to change one attribute and use update_attributes to change two or more attributes.

It's a good news that mongoid introduces the update_attribute method from 2.0.0.rc.6, now I can follow my practice in mongoid.

{% highlight ruby %}
post.update_attribute(:title => "New Post")

post.update_attributes(:title => "New Post", :body => "New Body")
{% endhighlight %}
