---
layout: post
title: update_attribute和update_attributes的区别
categories:
- Rails
---
update_attribute和update_attributes都是用来修改model的属性，它们区别除了一个修改单个属性，一个修改多个属性外，最重要的是update_attribute不执行validation，而update_attributes执行validation，查看源码：

{% highlight ruby %}
def update_attribute(name, value)
  send(name.to_s + '=', value)
  save(false)
end
{% endhighlight %}

{% highlight ruby %}
def update_attributes(attributes)
  self.attributes = attributes
  save
end
{% endhighlight %}

可以看出来，update_attribute执行的是save(false)，而update_attributes执行的是save

