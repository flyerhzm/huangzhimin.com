---
layout: post
title: Drop tmp collections in Mongodb
categories:
- mongodb
---
I'm trying mongodb map/reduce functionality with mongoid these days. I find there is a `tmp.mr.mapreduce_ddd_ddd` collection created after each map/reduce operation, it's ok that these tmp collections are used to hold output of map/reduce operation.

From mongodb document, it's said the temp collections will be cleaned up when the client connection closes or when explicitly dropped. But I never see these temp collections are dropped, when I print `show collections`, there are too many temp collections annoyed me, I decided to drop these temp collections explicitly.

{% highlight javascript %}
db.system.namespaces.find({name: /tmp.mr/}).forEach(function(z) {
  try{
    db.getMongo().getCollection( z.name ).drop();
  } catch(err) {}
});
{% endhighlight %}

It finds all the namespaces whose names contain tmp.mr, if so, drop the collections.
