---
layout: post
title: 追踪图片在外部系统的查看次数
categories:
- Rails
- Facebook
- Nginx
---
随着sns网站和web api的兴起，与第三方网站的交互越来越多。比如我们可以向用户facebook好友上的wall推送数据等等来做网站的推广，这就引来一个问题，我们不能只傻乎乎地做推广，更重要的是统计推广的效果。你总共推送了多少数据，有多少人看到了这些数据，又有多少人点击来到了你的网站？这些数据都是可以用来帮助你改进和提高推广的效果。

对于推送了多少数据和有多少人看到了这些数据，这两者比较容易做到，前者可以在推送数据的时候做记录，后者可以在用户点击进入网站的时候做记录。对于有多少人看到了这些数据就比较麻烦了。

下面拿facebook为例介绍如何统计数据在外部系统的查看次数。如果是纯文字的话几乎没法做到，但是如果是推送图片或视频的话，可以通过图片的显示次数来统计数据。

一般往facebook推送图片或视频等图片的时候，只需要在推送的参数中设置图片或视频的完整url即可。然后facebook在显示图片或视频的时候，会发送请求到服务器上，你只需要捕获这个请求并添加相应的逻辑处理。但是问题是，一般部署的rails应用，除了使用rails server(如thin)，还会放置一个web server(如nginx)来做负载均衡，你的图片或视频的请求会直接被web server处理，根本不经过rails server，这样你的逻辑代码就永远不会被调用到了。

解决的方法就是把传递给facebook的图片或视频url由静态url改成动态url，比如：http://yourdomain.com/assets/test.png改成http://yourdomain.com/assets/1，然后由assets_controller来返回图片

{% highlight ruby %}
class AssetsController < ApplicationController
  def show
    asset = Asset.find(params[:id])
    # add logic to increment asset show count

    send_file asset.attachment.url(:small, false)
  end
end
{% endhighlight %}

到此为止，你已经可以统计你推送的数据被多少人看到了，不过事情到这里还没有结束，通过rails server来上传图片效率是很低的，你应该将这项任务交给web server。以nginx服务器为例，它提供了X-Accel-Redirect选项，负责静态文件的上传。

首先，修改nginx的配置文件，将/assets路径加入到X-Accel-Redirect

{% highlight ruby %}
location /assets {
  root /var/www/staging/current/public;
  internal;
}
{% endhighlight %}

这段配置的作用是，如果X-Accel-Redirect指定的路径为/assets/image.png，那么nginx会去寻找/var/www/staging/current/public/assets/image.png文件并上传

然后要将推送到facebook的图片或视频路径由assets/1改为facebook_assets/1，避免和X-Accel-Redirect冲突。

{% highlight ruby %}
class FacebookAssetsController < ApplicationController
  def show
    asset = Asset.find(params[:id])
    # add logic to increment asset show count

    response.headers['X-Accel-Redirect'] = asset.attachment.url(:small, false)
    render :nothing => true
  end
end
{% endhighlight %}

可以看到，只需要在reponse header中增加X-Accel-Redirect即可，render :nothing = true表示rails server不处理图片的上传。nginx看到response header中有X-Accel-Redirect选项，就到/var/www/staging/current/public目录下面去寻找相应的图片并上传。

Lighttpd和Apache2则可以通过X-Sendfile选项来完成同样的事情。

