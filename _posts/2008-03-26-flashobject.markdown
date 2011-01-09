---
layout: post
title: FlashObject
categories:
- Rails Plugins
---
自从youtube横空出世之后，网上flash视频在线观看越来越流行了，flashobject插件就提供了非常方便的构建在线flash视频的功能，它是基于http://blog.deconcept.com/swfobject之上的应用。下面来看个实例：

1\. 创建工程：

{% highlight bash %}
$rails test_flashobject_helper
$cd test_flashobject_helper
{% endhighlight %}

2\. 安装插件：

{% highlight bash %}
$script/plugin install http://lipsiasoft.googlecode.com/svn/trunk/flashobject_helper
{% endhighlight %}

3\. 生成controller，修改view页面：

{% highlight bash %}
$script/generate controller flashs
{% endhighlight %}

{% highlight rhtml %}
#app/views/layouts/application.html.erb
<%= javascript_include_tag :defaults %>
<%= javascript_include_tag "flashobject" %>


<%= @content_for_layout %>
{% endhighlight %}

{% highlight rhtml %}
#app/views/flashs/index.html.erb
<%= flashobject_tag "/flash/demo.swf", :size => "350x320" %>
{% endhighlight %}

4\. 在public目录下新建flash目录，并在flash目录下放一个名为demo.swf的flash文件

5\. 启动server，输入http://localhost:3000/flashs即可查看flash视频

