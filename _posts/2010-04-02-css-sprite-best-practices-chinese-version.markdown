---
layout: post
title: css sprite最佳实践
categories:
- Rails
- RubyGems
- css
---
[css sprite best practices (english version)][1]

应用css sprite的好处在于可以大量减少http请求数，从而达到更快加载页面的效果。

但是对于像我这样的懒人，你让我每次都一个一个把图片copy到一个css_sprite图片里，还得量一下这个每个图片对应的x和y坐标，实在是一种折磨。

去年我就写了一个[css_sprite][2]的插件，但是由于需要在配置文件中定义所有需要组合在一起的图片，用起来还是很麻烦，不够傻瓜化。最近我把css_sprite插件重写了一遍，默认不需要使用配置文件，遵循rails的Convention Over Configuration的思想，可以做到全自动的css sprite操作。

首先，让我们看看目录结构的Convention是如何定义的

![][3]

上图中蓝色部分就是Convention的css sprite目录，也就是在public/images目录下面的css_sprite目录或者以css_sprite结尾的目录（比如another_css_sprite)，需要执行css_sprite操作。

绿色部分则是需要被css sprite的图片，你可以动态的在css sprite目录下面增加或删除图片，css sprite操作就会被自动触发。

而红色部分都是自动生成的，每个对应的css sprite目录，都会生成一个css sprite图片（图片内容为该css sprite目录下的所有图片组合），生成一个css sprite的css文件或者sass文件。

那么生成的css文件是怎么样的呢

{% highlight css %}
.twitter_icon, .facebook_icon, .login_button, .logout_button {
  background: url('/images/css_sprite.png?1270170265') no-repeat;
}
.twitter_icon { background-position: 0px 0px; width: 14px; height: 14px; }
.facebook_icon { background-position: 0px -19px; width: 14px; height: 14px; }
.login_button { background-position: 0px -38px; width: 103px; height: 36px; }
.logout_button { background-position: 0px -79px; width: 103px; height: 36px; }
{% endhighlight %}

也就是说，它生成的css文件遵循如下一个命名规范：*一个css sprite目录下的图片对应css里的一个class，图片的名字就是class的名字。*这样的好处在于开发人员只需要知道css sprite目录下面有哪些图片，他就可以在html页面上面使用哪些class名字来显示这些图片，而且当css_sprite的算法发生变化的时候也不会对页面显示产生任何影响。

实际使用当中你可能会碰到这样的问题：你除了要使用这些css_sprite生成的class名来显示图片，还需要为它们定义额外的style，而这个可以分为两部分：

1\. 一些相关的class有许多共同的style，比如对于button来说，你会把它应用到input或这a上面，一般就需要隐藏input或a标签上面的文字，需要去掉边框等等，所以你需要为这些相关的class生成共同的style，比如

{% highlight css %}
.login_button, .logout_button {
  text-indent: -9999px;
  display: block;
  cursor: pointer;
  font-size: 0; # for ie
  line-height: 15px; # for ie
  border: 0; }
{% endhighlight %}

这些style应该根据用户的定制加入到自动生成的css文件中去。

2\. 某个具体class应用的style，比如login_button需要定义margin或float

{% highlight css %}
.login_button {
  margin: 0 10px;
  float: left; }
{% endhighlight %}

这些style应该写在用户自己的css文件中，而不应该加入到自动生成的css文件中去。

遵循以上的规则，我需要做的事情就是把一个新的图片扔到css_sprite目录下，然后在页面上使用这个图片对应的class name来显示这个图片，其它的事情（生成css sprite图片和css）都应该是自动完成的，当然当我把一个图片从css_sprite目录下面移除的时候，它也会自动从css_sprite图片和css中移除。听起来很不错吧！

上面就是我定义的css_sprite最佳实践，理论还不错，下面看看在rails项目中是如何使用的？

1\. 当然是安装我的css_sprite的gem/plugin

{% highlight bash %}
sudo gem install css_sprite
{% endhighlight %}

或者

{% highlight bash %}
script/plugin install git://github.com/flyerhzm/css_sprite.git
{% endhighlight %}

注意，css_sprite依赖于rmagick gem，所以先请确保RMagick已经在你的系统中成功安装。

然后就是在environment.rb文件或者Gemfile文件中增加css_sprite gem

2\. 在public/images目录下面生成css_sprite目录或者以css_sprite结尾的的目录（如：another_css_sprite)

3\. 如果你是通过gem安装的css_sprite，那么需要在Rakefile中引用css_sprite的task

{% highlight ruby %}
require 'css_sprite'
{% endhighlight %}

如果你是通过plugin安装的，可以跳过这一步

4\. 开始css sprite自动化之旅

{% highlight bash %}
rake css_sprite:start
{% endhighlight %}

5\. 把需要做css sprite操作的图片都放入css_sprite目录下面，然后你会看到自动生成的css_sprite图片和css文件，现在你就可以在html页面上引用图片对应的class名字来显示图片咯。对了，别忘了引用生成的css文件哦

{% highlight rhtml %}
<%= stylesheet_link_tag 'css_sprite' %>
{% endhighlight %}

是不是感觉从机械的css_sprite工作中解脱出来了呀。下面再介绍些额外的tasks

如果你想结束css_sprite自动化之旅，执行

{% highlight bash %}
rake css_sprite:stop
{% endhighlight %}

如果你想重新开始css_sprite自动化之旅，执行

{% highlight bash %}
rake css_sprite:restart
{% endhighlight %}

如果你不需要css_sprite自动化执行，而只想手动执行css_sprite操作，执行

{% highlight bash %}
rake css_sprite:build
{% endhighlight %}

上面这些流程都是在没有配置的默认情况下完成的，如果你需要使用sass，或者你需要为某些相关的class定义共同的style，只需要定义config/css_sprite.yml配置文件即可

{% highlight yaml %}
suffix:
  button: |
    text-indent: -9999px;
    display: block;
    cursor: pointer;
    font-size: 0;
    line-height: 15px;
    border: 0;
    outline: 0;
{% endhighlight %}

上面这个配置文件的作用是为所有的文件名以button结尾的图片，生成一段共同的style。

{% highlight yaml %}
engine: sass
suffix:
  button: |
    text-indent: -9999px
    display: block
    cursor: pointer
    font-size: 0
    line-height: 15px
    border: 0
    outline: 0
{% endhighlight %}

上面这段配置文件的作用是指定css_sprite自动生成sass文件，同时为所有的文件名以button结尾的图片，生成一段共同的style。注意两段配置文件的不同，button下面的内容都会完整的复制到自动生成的css或sass文件，所以你需要根据css和sass的语法来填入。

注意：当修改了配置文件，需要stop再start css_sprite才能生效。

最后，来我们来看一段自动生成的css文件吧

{% highlight css %}
.login_button, .logout_button {
  text-indent: -9999px;
  display: block;
  cursor: pointer;
  font-size: 0;
  line-height: 15px;
  border: 0; }
.twitter_icon, .facebook_icon, .login_button, .logout_button {
  background: url('/images/css_sprite.png?1270170265') no-repeat;
}
.twitter_icon { background-position: 0px 0px; width: 14px; height: 14px; }
.facebook_icon { background-position: 0px -19px; width: 14px; height: 14px; }
.login_button { background-position: 0px -38px; width: 103px; height: 36px; }
.logout_button { background-position: 0px -79px; width: 103px; height: 36px; }
{% endhighlight %}

还等什么，赶紧来使用css_sprite来加快你的工作效率吧：[http://github.com/flyerhzm/css_sprite][2]


  [1]: /2010/04/03/css-sprite-best-practices-english-version
  [2]: http://github.com/flyerhzm/css_sprite
  [3]: http://lh6.ggpht.com/_qSmJ0dW70FE/TGdIAsGI6_I/AAAAAAAAATo/3Xhs9JzvDAQ/css_sprite_preview.png

