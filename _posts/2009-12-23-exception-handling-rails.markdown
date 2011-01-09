---
layout: post
title: rails的异常处理
categories:
- Rails
---
当在本地开发模式下发生异常的时候，rails会将错误发生的点、错误桟以及请求和应答的内容显示在浏览器上，并且在console下面打印出错误桟，这些使得调试web应用变得更容易。那rails内部是如何处理异常的呢？

rails把与ActionController相关的异常处理都定义在了ActionController::Rescue里面。其中最关键的是

{% highlight ruby %}
alias_method_chain :perform_action, :rescue
{% endhighlight %}

perform_action是ActionController处理http请求的方法，它负责根据不同的请求调用相应的action。而上面这句话则为perform_action添加了处理异常的功能，看看具体的实现

{% highlight ruby %}
def perform_action_with_rescue #:nodoc:
  perform_action_without_rescue
rescue Exception => exception
  rescue_action(exception)
end
{% endhighlight %}

可以看到，当perform_action执行发生异常时，通过rescue_action方法来处理异常。

整个过程的实现非常优雅，通过alias_method_chain为原来的perform_action增加了异常处理功能，却完全不用修改也不用关心perform_action原来的实现。rails的实现中大量使用了alias_method_chain，将功能点从方法的实现中剥离出来，有点AOP的思想。

最后看看本地和远程处理的不同

{% highlight ruby %}
if consider_all_requests_local || local_request?
  rescue_action_locally(exception)
else
  rescue_action_in_public(exception)
end
{% endhighlight %}

还记得development.rb中有一句话是config.action_controller.consider_all_requests_local = true，就是在这里起作用的。如果是local_request，会显示所有的错误桟和请求应答消息，不然就只是显示404或500的静态页面。除非你重写rescue_action_in_public方法（比如exception_notification插件）

