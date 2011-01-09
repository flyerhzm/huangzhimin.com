---
layout: post
title: Rspec测试render :nothing => true
categories:
- Rails
- Rspec
---
对于controller render/redirect的测试，一般对应以下的测试方法

{% highlight ruby %}
render :action => :index
response.should render_template('index')

render :partial => 'post'
response.should render_template('_post')

redirect_to login_path
response.should redirect_to(login_path)
{% endhighlight %}

但是对于`render :nothing = true`来说，并没有相应的方法来测试，也无法用render_template来解决，只能是判断返回的response的内容是不是为空了。

{% highlight ruby %}
response.should have_text(' ')
{% endhighlight %}

注意是 ，不是，至于为什么有个空格？我也没有仔细研究

