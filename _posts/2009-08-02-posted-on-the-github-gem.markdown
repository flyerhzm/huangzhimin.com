---
layout: post
title: 在github上发布gem
categories:
- Ruby
- RubyGems
---
现在ruby上流行的gem一般都在两个repository上，一个是rubyforge，一个是github。

这几天在写regexp_crawler，通过正则表达式来爬取网上的数据。今天写得差不多了，就想在github上以gem的形式发布。

首先，在自己项目的编辑页面，把RubyGem这项勾上。

接着，就是生成gemspec文件。我是通过jeweler来管理自己gemspec的。

1. 安装jeweler gem。

{% highlight bash %}
$ gem install jeweler
{% endhighlight %}

2. 在Rakefile文件中增加新的task

{% highlight ruby %}
require 'jeweler'

Jeweler::Tasks.new do |gemspec|
  gemspec.name = "regexp_crawler"
  gemspec.summary = "RegexpCrawler is a Ruby library for crawl data from website using regular expression."
  gemspec.description = "RegexpCrawler is a Ruby library for crawl data from website using regular expression."
  gemspec.email = "flyerhzm@gmail.com"
  gemspec.homepage = ""
  gemspec.authors = ["Richard Huang"]
end
{% endhighlight %}

3. 新增VERSION文件，来表示当前gem的版本

{% highlight bash %}
$ rake version:write 0.1.0
{% endhighlight %}

以后可以通过rake task来调整版本号

{% highlight bash %}
$ rake version:bump:major
$ rake version:bump:minor
$ rake version:bump:patch
{% endhighlight %}

4. 运行rake，生成gem

{% highlight bash %}
$ rake gemspec
{% endhighlight %}

最后，把生成的gemspec文件push到github上，github会帮你自动生成gem文件，你就可以安装自己的gem了

{% highlight bash %}
$ gem install flyerhzm-regexp_crawler
{% endhighlight %}

