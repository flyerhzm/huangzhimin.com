---
layout: post
title: capistrano读取releases目录的错误
categories:
- Ruby
- Capistrano
---
新年刚开始工作就遇到capistrano读取releases目录的错误，deploy之后总是把最新的release目录删除，看来是判断哪个release目录是最新的时候出错了。

看了下2.5.11源代码，capistrano是这样定义releases目录的

{% highlight ruby %}
_cset(:releases)          { capture("ls -x #{releases_path}").split.reverse }
{% endhighlight %}

其中ls -x的结果是

{% highlight bash %}
20091224074632  20091228080936  20091228082551  20100104023017  20100104025008
{% endhighlight %}

也就是说releases的结果就是

{% highlight ruby %}
['20100104025008', '20100104023017', '20091228082551', '20091228080936', '20091224074632']
{% endhighlight %}

再看看删除release部分的代码

{% highlight ruby %}
directories = (releases - releases.last(count)).map { |release|
  File.join(releases_path, release) }.join(" ")

try_sudo "rm -rf #{directories}"
{% endhighlight %}

从这段代码的逻辑可以判断，capistrano会把最新的20100104025008目录删除，显然这不是我们希望看到的结果。

看了2.5.9的源代码和github上最新的代码，releases却是这样定义的

{% highlight ruby %}
_cset(:releases)          { capture("ls -x #{releases_path}").split.reverse }
{% endhighlight %}

而ls -xt的执行结果是

{% highlight bash %}
20100104025008  20100104023017  20091228082551  20091228080936  20091224074632
{% endhighlight %}

和2.0.11正好相反，看来这就是问题的症结。查了一下lighthouse，https://capistrano.lighthouseapp.com/projects/8716/tickets/88-getting-the-newest-directory#ticket-88-19，原来是因为file cache store才把-t参数去掉了，但是却导致了新的问题，根据上面的解决方案，在config/deploy.rb文件中增加

{% highlight ruby %}
set(:releases) { capture("ls -x #{releases_path}").split }
{% endhighlight %}

即可

