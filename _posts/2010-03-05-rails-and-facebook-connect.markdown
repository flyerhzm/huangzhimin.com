---
layout: post
title: rails and facebook connect
categories:
- Rails
- Facebook
---
最近项目需要做一些facebook应用，比如要允许用户登录facebook，要获取用户facebook的好友信息等等。登录facebook自然选用时下流行的facebook connect。代码写起来非常简单，用户的体验也非常好。

首先，进入facebook的开发者页面http://developers.facebook.com/，点击Start building for your site，开始创建你的facebook应用，按照提示一步一步继续。需要注意的是，你可能需要创建两个应用，一个针对本地development环境，一个针对production环境。

接着，安装facebooker的gem，并且加入到rails gem依赖。在config目录下创建facebooker.yml文件，内容为

{% highlight yaml %}
development:
  api_key:
  secret_key:
  canvas_page_name: localhost
  callback_url: http://localhost:3000
  pretty_errors: true
  set_asset_host_to_callback_url: true
  tunnel:
    public_host_username:
    public_host:
    public_port: 4007
    local_port: 3000
    server_alive_interval: 0

production:
  api_key:
  secret_key:
  canvas_page_name:
  callback_url:
  set_asset_host_to_callback_url: true
  tunnel:
    public_host_username:
    public_host:
    public_port: 4007
    local_port: 3000
    server_alive_interval: 0
{% endhighlight %}

在application_controller文件中增加如下代码

{% highlight ruby %}
before_filter :set_facebook_session
helper_method :facebook_session
{% endhighlight %}


facebook_session即为用户登录facebook之后所获取的session，通过它可以获取facebook用户相关的所有信息。

然后就是在html header中引入facebook所需的javascript

{% highlight rhtml %}
<%= fb_connect_javascript_tag %>
<%= init_fb_connect "XFBML", :js => :jquery %>
{% endhighlight %}


最后就是在页面上显示facebook登录的图片和文字

{% highlight rhtml %}
<%= fb_login_button %>
{% endhighlight %}


你也可以只显示facebook的icon，并且在用户登录之后刷新页面

{% highlight rhtml %}
<%= fb_login_button("window.location.reload(true);", :size => "icon", :v => "2") %>
{% endhighlight %}


用户登录facebook之后，你就可以获取到用户和其好友的信息，比如

{% highlight rhtml %}
<%= facebook_session.user.name %>

<% facebook_session.user.friends.each do |friend| %>
  <%= image_tag friend.pic_square if friend.pic_square %>
  <%= friend.first_name %>
  <%= friend.last_name %>
<% end %>
{% endhighlight %}

详细的接口可以看看facebooker的rdoc。

