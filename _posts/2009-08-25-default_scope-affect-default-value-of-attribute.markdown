---
layout: post
title: default_scope影响attribute的default值
categories:
- Rails
- ActiveRecord
---
之前有个需求，发表的文章需要审核之后才能显示，于是在Post类中加了一个default_scope

{% highlight ruby %}
default_scope :order => 'updated_at desc', :conditions => {:verify => true}
{% endhighlight %}

之后就发觉每次创建的post对象，其verify值总是为true，除非手动设置verify=false。当然我在migration的时候已经设置verify的default为false了。很奇怪，于是看了下rails的源代码，其中是这么定义default_scope的

{% highlight ruby %}
def default_scope(options = {})
  self.default_scoping << { :find => options, :create => options[:conditions].is_a?(Hash) ? options[:conditions] : {} }
end
{% endhighlight %}

这里可以看到如果default_scope的conditions是一个Hash的话，那么这个Hash会被保存起来，并在对象initialize的时候生效

{% highlight ruby %}
def initialize(attributes = nil)
  @attributes = attributes_from_column_definition
  @attributes_cache = {}
  @new_record = true
  ensure_proper_type
  self.attributes = attributes unless attributes.nil?
  self.class.send(:scope, :create).each { |att,value| self.send("#{att}=", value) } if self.class.send(:scoped?, :create)
  result = yield self if block_given?
  callback(:after_initialize) if respond_to_without_attributes?(:after_initialize)
  result
end
{% endhighlight %}

注意第7行，可以看到，在实例化Post对象时，会根据conditions的Hash值设置其verify=true。

原来如此，解决方案自然是把conditions的值从Hash改成Array即可

{% highlight ruby %}
default_scope :order => 'updated_at desc', :conditions => ['verify = ?', true]
{% endhighlight %}

