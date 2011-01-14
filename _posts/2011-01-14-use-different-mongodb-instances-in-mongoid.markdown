---
layout: post
title: Use different mongodb instances in mongoid
categories:
- mongodb
- mongoid
---
By default, we save all the collections in one mongodb instance, or replicate/shard all of them into different mongodb instances. But what if saving a special collection into one mongodb instance, and the other collections into the other mongodb instance?

This is what I need to do with a mongoid project several weeks before.  In common we just define a mongodb instance in the `config/mongoid.yml`, yep, you can define only one instance for one environment just like activerecord, the define the different mongodb instance in model.

{% highlight ruby %}
class Ad
  include Mongoid::Document

  collection.master = Mongoid::Collections::Master.new(
    Mongo::Connection.new(AD_DB_HOST, AD_DB_PORT).db(AD_DB_NAME),
    AD_COLLECTION_NAME
  )
end
{% endhighlight %}

change the `AD_DB_HOST`, `AD_DB_PORT`, `AD_DB_NAME` and `AD_COLLECTION_NAME` with your mongodb configuration, the following is my configuration,

{% highlight ruby %}
AD_DB_HOST => 'localhost'
AD_DB_PORT => 27018
AD_DB_NAME => 'ad_developmet'
AD_COLLECTION_NAME => 'ads'
{% endhighlight %}

and it would be better move these configurations into a config file.

Now when saving or reading the ads collection, it uses `localhost:27018/ad_development`, and the other collections use `localhost:27017/project_development`.
