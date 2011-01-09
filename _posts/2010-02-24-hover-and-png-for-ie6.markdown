---
layout: post
title: hover and png for ie6
categories:
- css
---
IE6可以说是前端设计师们的最大梦魇，不支持圆角，margin double等等问题，使得书写css的时候不得不专门针对IE6浏览器增加额外的规则。

hover和png透明也是IE6所不支持的，解决方法如下：

hover可以通过[Whatever:hover][1]脚本来hack，使用方法很简单，在ie6.css文件中定义

{% highlight css %}
.need_hover_element {
  behavior: url("/stylesheets/csshover3.htc"
)
{% endhighlight %}

png透明需要[iepngfix][2]脚本来hack，使用方法稍微复杂些，首先在ie6.css文件中定义

{% highlight css %}
.need_png_transparent_element {
  behavior: url("/stylesheets/iepngfix.htc")
}
{% endhighlight %}

接着在html文件中引入iepngfix_tilebg.js

然后修改iepngfix.htc文件，修改其中的blank.gif文件路径

{% highlight javascript %}
IEPNGFix.blankImg = '/images/blank.gif';
{% endhighlight %}

好了，你的网站现在能够使IE6支持hover和png透明了，不过当png文件是在hover之后才出现的，png透明似乎就不起作用了。


  [1]: http://www.xs4all.nl/~peterned/csshover.html
  [2]: http://www.twinhelix.com/css/iepngfix/

