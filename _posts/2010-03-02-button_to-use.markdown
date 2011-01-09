---
layout: post
title: button_to的使用
categories:
- Rails
- css
---
页面间的跳转或者请求，用得最多的就是link_to和form_for，一个发送get或delete请求，一个post或put请求。但是碰到投票之类的链接，虽然是一个post请求，但是form里面却不需要任何数据，碰到这样的情况，我们希望像link_to那样一行搞定。

也许你会通过link_to 'xx', 'xx', :method => :delete联想到link_to 'xx', 'xx', :method => :post，但是很不幸，没有这样使用的。还好，rails提供了一个简单的helperbutton_to

{% highlight ruby %}
button_to 'Vote', post_votes_path(post), :class => 'vote_icon'
{% endhighlight %}

生成的html代码如下

{% highlight html %}
<form class="button-to" action="/post/1/comments" method="post">
    <div>
        <input type="submit" value="Vote" class="vote_icon" />
        <input type="hidden" value="zbT/x/CpCjDQdTb2IZQ+ttGqNfv5PfsAJ3/BRK+wBqM=" name="authenticity_token" />
    </div>
</form>
{% endhighlight %}

另外说一下页面的显示吧，我们使用vote_icon的class，定义一个background image，问题出来了，使用input会出现一个边框，鼠标放上去是箭头，另外vote icon上面还会显示出字来，解决的方法就是

{% highlight css %}
.vote_icon {
    border: 0;
    text-indent: -999px;
    cursor: pointer;
}
{% endhighlight %}

嗯，现在就和link image完全一样了。别急，打开IE7和IE6看看，vote icon上面仍然显示出字来，原来IE7和IE6不支持input上面的text-indent，所以要额外加上

{% highlight css %}
.vote_icon {
    border: 0;
    text-indent: -999px;
    cursor: pointer;
    font-size: 0;
    line-height: 10px;
}
{% endhighlight %}

现在一切就都OK咯！

