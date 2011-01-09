---
layout: post
title: add gem rake for rails
categories:
- Rails
- RubyGems
---
使用过rails插件的一定知道，只要在插件的tasks目录下面定义rake文件，rails就会自动加入其中定义的task。但是gem就不能这样用了，即使rake gems:unpack也没用。

解决的方法是将定义在gem中的task require到rails目录下。比如我在css_sprite gem的lib/css_sprite.rb中定义

{% highlight ruby %}
unless Rake::Task.task_defined? "css_sprite:build"
  load File.join(File.dirname(__FILE__), '..', 'tasks', 'css_sprite_tasks.rake')
end
{% endhighlight %}

上面3行的意思是如果当前的tasks中没有css_sprite:build的话，就load gem中的tasks/css_sprite_tasks.rake。

然后在rails app中增加lib/tasks/css_sprite.rake

{% highlight ruby %}
require 'css_sprite'
{% endhighlight %}

这样你就可以使用`rake css_sprite:build` task了。

更懒的方法是直接把require css_sprite'加到rails目录下的Rakefile。

