---
layout: post
title: activerecord属性保护
categories:
- Rails
- ActiveRecord
---
最近在看rails安全方面的书，第一部分就是关于生成activerecord对象的参数保护问题。平时一直使用，今天心血来潮想起要看看源代码是如何实现的。

activerecord属性保护就是通过attr_accessible和attr_protected来声明哪些属性可以访问，哪些不可以访问。当然，这些保护只是针对new, create和update_attributes方法，对于直接使用attribute=就无能为力了。

attr_accessible的源码为

{% highlight ruby %}
def attr_protected(*attributes)
  write_inheritable_attribute(:attr_protected, Set.new(attributes.map()) + (protected_attributes || []))
end
{% endhighlight %}

原来activerecord会生成一个attr_protected属性，来记录所有的需要被保护的字段

同样attr_accessible会生成attr_accessible属性

{% highlight ruby %}
def attr_accessible(*attributes)
  write_inheritable_attribute(:attr_accessible, Set.new(attributes.map()) + (accessible_attributes || []))
end
{% endhighlight %}

然后，在传递attributes的时候会调remove_attributes_protected_from_mass_assignment

{% highlight ruby %}
def remove_attributes_protected_from_mass_assignment(attributes)
  safe_attributes =
    if self.class.accessible_attributes.nil?  self.class.protected_attributes.nil?
      attributes.reject { |key, value| attributes_protected_by_default.include?(key.gsub(/\(.+/, "")) }
    elsif self.class.protected_attributes.nil?
      attributes.reject { |key, value| !self.class.accessible_attributes.include?(key.gsub(/\(.+/, "")) || attributes_protected_by_default.include?(key.gsub(/\(.+/, "")) }
    elsif self.class.accessible_attributes.nil?
      attributes.reject { |key, value| self.class.protected_attributes.include?(key.gsub(/\(.+/,"")) || attributes_protected_by_default.include?(key.gsub(/\(.+/, "")) }
    else
      raise "Declare either attr_protected or attr_accessible for #{self.class}, but not both."
    end

  removed_attributes = attributes.keys - safe_attributes.keys

  if removed_attributes.any?
    log_protected_attribute_removal(removed_attributes)
  end

  safe_attributes
end

{% endhighlight %}

如果没有定义attr_accessible和attr_protected，会防止修改默认的属性（primary_key属性，一般是id和inheritance属性，即type）

如果没有定义attr_protected，就只允许修改attr_accessible定义的属性，还会防止修改默认的属性

如果没有定义attr_accessible，就防止修改attr_protected定义的属性，也会防止修改默认的属性

需要注意的是，如果同时定义attr_protected和attr_accessible的话，就会抛异常



