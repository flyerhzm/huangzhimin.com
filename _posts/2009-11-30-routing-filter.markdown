---
layout: post
title: routing-filter
categories:
- Rails Plugins
---
[routing-filter][1]提供了强大的用于扩展Rails routing的功能。

来看看两个例子

1. 分页，一般使用经典的will_paginate插件生成的url是这样的: /posts?page=2，不过/posts/page/2如何呢？

2. locale，比如我们根据用户不同的locale，显示不同语言版本的页面，这样的url很可能是/posts?locale=zh，不过/zh/posts如何呢？

我个人都比较倾向于后面一种写法。用routing-filter可以帮助我们快速地完成这个转换工作。

routing-filter默认自带了以上两种url的转换器。用起来也是超级简单，只要在config/routes.rb文件中定义

{% highlight ruby %}
ActionController::Routing::Routes.draw do |map|
  map.filter 'pagination'
  ...
end

{% endhighlight %}

{% highlight ruby %}
ActionController::Routing::Routes.draw do |map|
  map.filter 'locale'
  ...
end
{% endhighlight %}

你也可以很容易的创造自己的url转换器

{% highlight ruby %}
module RoutingFilter
  class Awesomeness < Base
    def around_recognize(route, path, env)
      # Alter the path here before it gets recognized.
      # Make sure to yield (calls the next around filter if present and
      # eventually `recognize_path` on the routeset):
      returning yield do |params|
        # You can additionally modify the params here before they get passed
        # to the controller.
      end
    end

    def around_generate(controller, *args, &block)
      # Alter arguments here before they are passed to `url_for`.
      # Make sure to yield (calls the next around filter if present and
      # eventually `url_for` on the controller):
      returning yield do |result|
        # You can change the generated url_or_path here. Make sure to use
        # one of the "in-place" modifying String methods though (like sub!
        # and friends).
      end
    end
  end
end
{% endhighlight %}

感觉这东西对于seo非常有用


  [1]: http://github.com/svenfuchs/routing-filter

