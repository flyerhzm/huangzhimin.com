---
layout: post
title: Upgrade Mongoid - Multiple databases
categories:
- mongoid
- Ruby
---
My recent post [Use different mongodb instances in mongoid][0] tells you how to use multiple databases, it looks good, but mongoid began to support multiple databases itself from mongoid.2.0.0.rc.1, much better than my hack.

It's really easy to use, first, you should define multiple databases in mongoid.yml like

{% highlight yaml %}
development:
  <<: *defaults
  host: localhost
  database: main_mongo_instance
  databases:
    other_mongo_instance_name:
      database: other_mongo_instance
      host: localhost
{% endhighlight %}

As you seen, besides the common database param, I have defined a new param databases, you should define the mongo instance name with database and host name, and of course, you can define as many mongo instances as you need.

Then, you can choose which mongo instance to use in mongoid model.

{% highlight ruby %}
class User
  include Mongoid::Document

  set_database :other_mongo_instance_name
end
{% endhighlight %}

set_database method tells mongoid that the model will use another mongo instance instead of the main mongo instance, here we use the name other_mongo_instance_name which should exactly be the same with the name defined in mongoid.yml. If you don't say anything, it will use the main_mongo_instance.

So all the users data will be stored to other_mongo_instance_name, and the other data will be stored to main_mongo_instance. Great!

  [0]: http://www.huangzhimin.com/2011/01/14/use-different-mongodb-instances-in-mongoid/
