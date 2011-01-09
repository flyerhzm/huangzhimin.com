---
layout: post
title: oauth for twitter
categories:
- RubyGems
- Twitter
- Ruby
---
[twitter][1]是Twitter的ruby gem，它提供了两种身份验证的方法，一是oauth，二是http auth。http auth非常简单，只要提供账号和密码就可以了，而oauth就稍微复杂一些了。

首先，你需要到http://twitter.com/oauth_clients去注册你的应用，并得到相应的consumer token和consumer secret。

接着就可以使用twitter gem了

{% highlight ruby %}
def oauth
  oauth = Twitter::OAuth.new(consumer_token, consumer_secret)
  request_token = oauth.set_callback_url 'http://www.huangzhimin.com/'
  session[:rtoken] = request_token.token
  session[:rsecret] = request_token.secret

  redirect_to request_token.authorize_url
end
{% endhighlight %}

注意，这里除了传入consumer_token和consumer_secret之外，还设置了callback_url，它表示twitter身份验证完毕之后返回的页面。

然后就是跳转到authorize_url，你会进入twitter的验证页面，点击Allow之后，将跳转到之前设置的callback_url页面

{% highlight ruby %}
def callback
  oauth = Twitter::OAuth.new(consumer_token, consumer_secret)
  oauth.authorize_from_request(session[:rtoken], session[:rsecret], params[:oauth_verifier])
  session[:rtoken] = nil
  session[:rsecret] = nil
  session[:atoken] = oauth.access_token.token
  session[:asecret] = oauth.access_token.secret
end
{% endhighlight %}

可以看到通过返回的oauth_verifier，我们就完成了twitter的身份验证，在记录了session[:atoken]和session[:asecret]之后就可以使用twitter的提供的接口，比如

{% highlight ruby %}
oauth = Twitter::OAuth.new(consumer_token, consumer_secret)
oauth.authorize_from_access(session[:atoken], session[:asecret])
client = Twitter::Base.new(oauth)
client.update('twitter oauth test')
{% endhighlight %}


  [1]: http://github.com/jnunemaker/twitter/

