---
layout: post
title: Less -- Css的Ruby扩展
categories:
- Ruby
- css
- Less
---
Less是对Css的一种Ruby扩展，使得Css可以支持变量，Mixin，内嵌规则和数字操作。

Less的特点在官网上[]http://lesscss.org/][1]写得很清楚，这里就不再重复了。试用了一天，还不错，不过和Sass比起来还是有些差距的：

1\. Less只支持单文件，没有Sass中的import功能，所以Css重用上也只能局限在单文件中。

2\. Less内嵌规则不支持单行css定义

{% highlight css %}
div {
  input {color:red;}
}
{% endhighlight %}

这样写lessc编译的时候会报错，必须改成下面的写法：

{% highlight css %}
div {
  input {
    color:red;
  }
}
{% endhighlight %}

觉得这个应该算是一个bug吧。

3\. Less不支持多元素嵌套

{% highlight css %}
div.style1, div.style2 {
  input {
    color:red;
  }
}
{% endhighlight %}

它会被解析成

{% highlight css %}
div.line1, div.line2 input {
  color:red;
}
{% endhighlight %}

而Sass会解析成

{% highlight css %}
div.line1 input, div.line2 input {
  color:red;
}
{% endhighlight %}

这一点让我很不爽

4\. Less每次修改了，必须手动执行lessc来转换成css文件，或者加上--watch参数来自动更新，不过一次只能watch一个文件，这点比起sass实在是差太多了。用起来实在太不方便了，就写个task来watch所有的less文件更新

{% highlight ruby %}
namespace :lessc do
  css_path = 'public/stylesheets/'
  less_path = css_path + 'lesses/'

  desc "start lessc"
  task :start do
    Dir.entries(less_path).each do |file|
      unless file == '.' or file == '..'
        system "lessc #{less_path}#{file} #{css_path}#{file} --watch &"
      end
    end
  end

  task :stop do
    lines = %x{ ps }.split("\n")
    lines.reject {|line| line !~ /\.less/}.each do |line|
      pid = line.split(/\s+/)[1]
      system "kill -9 #{pid}"
    end
  end

  task :restart => [:stop, :start]
end
{% endhighlight %}

每次执行`rake lessc:start`启动，`rake lessc:stop`关闭即可


  [1]: http://lesscss.org/

