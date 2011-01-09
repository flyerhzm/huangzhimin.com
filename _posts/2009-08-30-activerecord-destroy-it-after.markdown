---
layout: post
title: ActiveRecord destroy之后的事情
categories:
- Rails
- ActiveRecord
---
一般的Rails应用都在对象destroy之后自动跳转到另一个页面，不再去关心被destroy的对象如何了。其实被destroy的对象虽然从数据库中被删除了，但仍然存在于内存当中。

举个例子吧，比如我们做个博客系统，有文章，有评论，当我们删除一个日志的时候，需要在日志中做下记录

{% highlight ruby %}
class Post
  after_destroy :log

  def log
    Logger.create(:action => 'destroy', :object_type => self.class, :object_id => self.id, :object_value => self.title)
  end
end
{% endhighlight %}

可见，我们是在post被删除之后再做日志记录，此时我们仍然能够得到post对象，并成功记录到日志系统中去。

如果再加些BT的需求呢，要求在日志系统中同时记录子对象（即comments对象）的type, id和value。看看很简单，但是你会不会想到，comments在post之前就被删除了，我们去哪里拿这些数据呢？答案就是内存中

{% highlight ruby %}
class Post
  has_many :comments, :dependent => :destroy
  after_destroy :log

  def log
    Logger.create(:action => 'destroy', :object_type => self.class, :object_id => self.id, :object_value => self.title, :associations_value => comments.collect(&:name).join(','))
  end
end
{% endhighlight %}

在comments和post相继被删除之后，我们仍然可以得到post的name和post所有commnets的name，为什么呢？

首先看看:dependennt => :destroy有什么作用

{% highlight ruby %}
method_name = "has_many_dependent_destroy_for_#{reflection.name}".to_sym
define_method(method_name) do
  send(reflection.name).each { |o| o.destroy }
end
before_destroy method_name
{% endhighlight %}

也就是说在destroy post之前，会遍历所有的comments，然后逐一删除comment。

由于ActiveRecord::AssociationProxy的作用，当遍历comments之前会调用load_target来读取所有的comments

{% highlight ruby %}
def load_target
  if !@owner.new_record? || foreign_key_present
    begin
      if !loaded?
        if @target.is_a?(Array) && @target.any?
          @target = find_target + @target.find_all {|t| t.new_record? }
        else
          @target = find_target
        end
      end
    rescue ActiveRecord::RecordNotFound
      reset
    end
  end

  loaded if target
  target
end
{% endhighlight %}

也就是说，在删除所有的comments之前，ActiveRecord已经将post所有的comments读取过来，并赋值给@target，所以我们才能在post.destroy之后读取到post.comments的name

