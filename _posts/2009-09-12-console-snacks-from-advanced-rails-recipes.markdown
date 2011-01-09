---
layout: post
title: Console Snacks[摘自Advanced Rails Recipes]
categories:
- Rails
---
上周把Advanced Rails Recipes扫了一遍，受益匪浅，尤其是关于script/console那一段，都是之前没试过的，呵呵，做个摘录。

1\. Write Console Methods

在~/.irbrc定义ActvieRecord::Base.connection.select_all方法

{% highlight ruby %}
# ~/.railsrc
def sql(query)
  ActiveRecord::Base.connection.select_all(query)
end
{% endhighlight %}

{% highlight ruby %}
# ~/.irbrc
if ENV['RAILS_ENV']
  load File.dirname(__FILE__) + '/.railsrc'
end
{% endhighlight %}

这样就可以在直接在script/console下面执行sql查询

{% highlight ruby %}
$ script/console
>> sql 'show databases'
{% endhighlight %}

2\. Log to the console

ActiveRecord Logger

{% highlight ruby %}
# ~/.railsrc
def loud_logger
  set_logger_to Logger.new(STDOUT)
end

def quiet_logger
  set_logger_to nil
end

def set_logger_to(logger)
  ActiveRecord::Base.logger = logger
  ActiveRecord::Base.clear_active_connections!
end
{% endhighlight %}

ActionPack Logger

{% highlight ruby %}
# ~/.railsrc
require 'logger'
Object.const_set(:RAILS_DEFAULT_LOGGER, Logger.new(STDOUT))
{% endhighlight %}

3\. Play in the Sandbox

使用sandbox参数来启动script/console

{% highlight bash %}
script/console --sandbox
{% endhighlight %}

这样所有的数据库修改都会在退出console时被恢复

4\. Access Helpers

直接调用helper方法

{% highlight ruby %}
helper.pluralize(3, 'blind mouse')
{% endhighlight %}

调用自定义的helper方法

{% highlight ruby %}
helper.extends BlogsHelper
helper.archive_dates
{% endhighlight %}

