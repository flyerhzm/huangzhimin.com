---
layout: post
title: reset_counter in rails
categories:
- Rails
---
I thought reset_counter method is to reset a counter_cache column to be
0, but it is not. After trying several times, I finally realize that
reset_counter is to update the value of counter_cache column to the
exact count of associations. The usecase of reset_counter is when you
add the counter_cache in migration and update the counter_cache value,
like

{% highlight ruby %}
def self.up
  add_column :posts, :comments_count
  Post.all.each do |post|
    Post.reset_counter(post.id, :comments)
  end
end
{% endhighlight %}

it will add comments_count column to posts table, and calculate the
comments count for each post, and set it to posts' comments_count
column.

I didn't find a method to reset the counter_cache column to be 0, why?
Because counter_cache is used to cache the association count, it will be
incremented and decremeneted automatically, you should never reset it 0.
If you find you need to reset counter_cache to 0, that means it's a
wrong usage of counter_cache.
