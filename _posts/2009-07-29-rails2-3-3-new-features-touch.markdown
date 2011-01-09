---
layout: post
title: Rails2.3.3新功能──touch
categories:
- Rails
---
touch是Rails2.3.3引入的新功能，可以将指定的attributes改为当前时间，默认是更改updated_at或updated_on。

典型的用法在many-to-one时，当many端发生改变时，更新one端的updated_at时间。比如在一个论坛系统中，一个帖子的更新时间会随着之后的回复发生改变：

{% highlight ruby %}
class Post  ActiveRecord::Base
  has_many :replies
end

class Reply  ActiveRecord::Base
  belongs_to :post, :touch => true
end
{% endhighlight %}

这里声明的:touch = true，其实就是定义了一个method来更新Post的updated_at时间，并且在after_save和after_destroy的时候调用该method

{% highlight ruby %}
def add_touch_callbacks(reflection, touch_attribute)
  method_name = "belongs_to_touch_after_save_or_destroy_for_#{reflection.name}".to_sym
  define_method(method_name) do
    association = send(reflection.name)

    if touch_attribute == true
      association.touch unless association.nil?
    else
      association.touch(touch_attribute) unless association.nil?
    end
  end
  after_save(method_name)
  after_destroy(method_name)
end
{% endhighlight %}

