---
layout: post
title: 类似facebook connect的方式验证twitter oauth
categories:
- Rails
- Twitter
- javascript
---
最近一个项目需要实现类似与uservoice一样的widget，也就是把一段javascript放到任何的网站上，然后动态生成一个iframe来显示我们网站的内容。但是碰到一个问题，在这个widget内需要允许用户使用twiiter oauth的方式登录，但是twitter oauth认证之后会使用window.top来redirect你的页面，这样会重置我们的widget，这显然是对用户很不友好的。同时，我发现facebook connect的方式可以很好的应用在我们的widget上面，因为它不会重新刷新页面。于是我想能不能用类似与facebook connet的方式，弹出一个页面来做twitter oauth的身份验证呢？显然，这是可行的。

其实很简单的，就是弹出一个页面，在那个页面上做twitter oauth的身份认证，在返回的时候记录session，同时关闭弹出的页面，javascript的代码如下

{% highlight javascript %}
if (!TwitterConnect) {
  var TwitterConnect = {};
}
TwitterConnect.Twitter = new function() {
  var self = this;

  this.setOauthUrl = function(url) {
    self.oauth_url = url;
  }

  this.setCallback = function(callback) {
    self.callback = callback;
  }

  this.startTwitterConnect = function() {
    var popupParams = 'location=0,status=0,width=800,height=400';
    self._twitterWindow = window.open(self.oauth_url, 'twitterConnectWindow', popupParams);
    self._twitterInterval = window.setInterval(self.completeTwitterConnect, 500);
  }

  this.completeTwitterConnect = function() {
    if (self._twitterWindow.closed) {
      window.clearInterval(self._twitterInterval);
      eval(self.callback);
    }
  }
};

function _loadTwitterConnect() {
  if (document.getElementsByClassName == undefined) {
    document.getElementsByClassName = function(className) {
      var hasClassName = new RegExp("(?:^|\\s)" + className + "(?:$|\\s)");
      var allElements = document.getElementsByTagName("*");
      var results = [];

      var element;
      for (var i = 0; (element = allElements[i]) != null; i++) {
        var elementClass = element.className;
        if (elementClass && elementClass.indexOf(className) != -1 && hasClassName.test(elementClass))
          results.push(element);
      }

      return results;
    }
  }

  var oauths = document.getElementsByClassName('twitter_oauth');
  for (var i = 0; i < oauths.length; i++) {
    var oauth = oauths[i];
    oauth.onclick = function() {
      TwitterConnect.Twitter.setOauthUrl(oauth.getAttribute('href'));
      TwitterConnect.Twitter.setCallback(oauth.getAttribute('onlogin'));
      TwitterConnect.Twitter.startTwitterConnect();
      return false;
    }
  }
};

_loadSuper = window.onload;
window.onload = (typeof window.onload != 'function') ? _loadTwitterConnect : function() { _loadSuper(); _loadTwitterConnect(); };
{% endhighlight %}

twitter oauth的链接需要这样写

{% highlight html %}
<a class="twitter_button twitter_oauth" onlogin="window.location.href = '/tweets'" href="/oauth">Sign in with Twitter</a>
{% endhighlight %}

controller端的代码见[http://www.huangzhimin.com/entries/171-oauth-for-twitter][1]

这段javascript代码的作用是查找所有class为twiiter_oauth的链接，点击这个链接的时候进入oauth action，然后转发到twitter oauth的authorize_url，用户验证通过并返回之后，进入callback action，callback记录用户的session之后，返回一段self.close()的javascript关闭弹出页面，然后再执行twitter oauth链接的onlogin代码，这里的onlogin的跳转到'/tweets'页面。

用户使用起来就和facebook connect很像，所以我给它起名为twitter connect，并且发布到了github上面，项目地址如下：[http://github.com/flyerhzm/twitter_connect][2]，用起来很方便的哦。

  [1]: http://www.huangzhimin.com/entries/171-oauth-for-twitter
  [2]: http://github.com/flyerhzm/twitter_connect

