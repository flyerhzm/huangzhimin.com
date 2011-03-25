---
layout: post
title: Upgrade Mongoid - Default Type for Field
categories:
- mongoid
- Ruby
---
If you have watched the episode about [mongoid][1] from railscast, ryanb removed the default type String for field, like

{% highlight ruby %}
class Article
  field :name, :type => String
  field :content, :type => String
end
{% endhighlight %}

can be written as

{% highlight ruby %}
class Article
  field :name
  field :content
end
{% endhighlight %}

but it is not valid from mongoid.2.0.0.rc.1 again, the default type of field is changed from String to Object, that means we should explicitly set the type for each field.


  [1]: http://railscasts.com/episodes/238-mongoid
