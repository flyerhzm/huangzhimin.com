---
layout: post
title: counter_cache的migration
categories:
- Rails
---
counter_cache在提升查询性能上带来了很大的帮助，在rails中用起来也是非常的方便，增加一个xxx_count在数据表中，在belongs_to的声明后增加:counter_cache => true。

但是今天在增加counter_cache的migration上却遇到了麻烦，比如增加Person的blog_posts_count，migration如下：

{% highlight ruby %}
def self.up
  add_column :people, :blog_posts_count, ;integer, :default => 0

  Person.reset_column_information
  Person.all.each do |p|
    p.update_attribute(:blog_posts_count, p.blogs.posts.length)
  end
end
{% endhighlight %}

运行之后，发现blog_posts_count的值总是为null，即使在console下面运行person的update_attribute方法也没有任何作用，errors却是空的，再看sql语句，只更新了updated_at。试了很久都没有结果，google之后发觉原来是rails 2.0之后把counter_cache的attribute设置为read_only，怪不得怎么也改不了呢。rails 2.0提供了update_counters方法来修改counter_cache的column，于是migration改成了：

{% highlight ruby %}
def self.up
  add_column :people, :blog_posts_count, ;integer, :default => 0

  Person.reset_column_information
  Person.all.each do |p|
    Person.update_counters p.id, :blog_posts_count, p.blogs.posts.length
  end
end
{% endhighlight %}

