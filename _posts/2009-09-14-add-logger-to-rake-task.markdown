---
layout: post
title: Add logger to rake task
categories:
- Rails
---
在rake task中写了一个爬虫，用cron定期去爬取，但是没有任何输出，实在心里没底。于是要加入log，结果发现logger在task中没有定义，只能自己加上去了。

{% highlight ruby %}
task :crawl => :environment do
  RAILS_DEFAULT_LOGGER.info "crawl start"
  crawl_board('XXX')
  RAILS_DEFAULT_LOGGER.info "crawl end"
  RAILS_DEFAULT_LOGGER.flush
end
{% endhighlight %}

或者也可以在最前面定义

{% highlight ruby %}
RAILS_DEFAULT_LOGGER.auto_flushing = true
{% endhighlight %}

如果不flush的话，是看不到日志输出的

