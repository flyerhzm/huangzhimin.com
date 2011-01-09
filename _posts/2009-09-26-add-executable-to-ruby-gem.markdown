---
layout: post
title: add executable to ruby gem
categories:
- RubyGems
- Ruby
---
刚刚给rfetion增加了executable，使得用户可以直接在shell下面发送短信。

首先，在gem目录下增加bin目录，并增加executable文件

{% highlight ruby %}
require 'rfetion'
require 'rfetion/command'
{% endhighlight %}

接着新增command.rb文件来处理用户输入，用的是ruby类库自带的optparse

{% highlight ruby %}
require 'optparse'

options = {}

OptionParser.new do |opts|
  # Set a banner, displayed at the top of the help screen.
  opts.banner = "Usage: rfetion [options]"

  opts.on('-m', '--mobile MOBILE', 'Fetion mobile number') do |mobile|
    options[:mobile_no] = mobile
  end

  opts.on('-p', '--password PASSWORD', 'Fetion password') do |f|
    options[:password] = f
  end

  opts.on('-c', '--content CONTENT', 'Fetion message content') do |f|
    options[:content] = f
  end

  options[:friends_mobile] = []
  opts.on('-f', '--friends MOBILE1,MOBILE2', Array, '(optional) Fetion friends mobile number, if no friends mobile number, send message to yourself') do |f|
    options[:friends_mobile] = f
  end

  opts.parse!
end
{% endhighlight %}

optparse用起来真的很方便，短短几行就能够很好地处理用户输入。

然后直接在gemspec增加

{% highlight ruby %}
gemspec.executables  'rfetion'
{% endhighlight %}

最后就是升级gem version，发布到github上，再gem install flyerhzm-rfetion

这样在shell下面就可以直接发送短信了，看看命令行的帮助

{% highlight bash %}
rfetion -h

Usage: rfetion [options]
    -m, --mobile MOBILE              Fetion mobile number
    -p, --password PASSWORD          Fetion password
    -c, --content CONTENT            Fetion message content
    -f, --friends MOBILE1,MOBILE2    (optional) Fetion friends mobile number, if no friends mobile number, send message to yourself
{% endhighlight %}

