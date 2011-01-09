---
layout: post
title: Restful Authentication
categories:
- Rails Plugins
---
Restful Authentication提供了基于Restful形式的身份认证功能，包括email激活，登陆跳转等等功能。

1\. 创建工程：

{% highlight bash %}
$rails test_restful_authentication
$cd test_restful_authentication
{% endhighlight %}

2\. 安装插件：

{% highlight bash %}
$script/plugin install http://svn.techno-weenie.net/projects/plugins/restful_authentication
{% endhighlight %}

3\. 生成测试模型和数据表：

{% highlight bash %}
$script/generate authenticated user sessions --include-activation
$script/generate scaffold post title:string body:text
$rake db:migrate
{% endhighlight %}

4\. 增加routes：

{% highlight ruby %}
#config/routes.rb
map.activate '/activate/:activation_code', :controller => 'users', :action => 'activate'
map.signup '/signup', :controller => 'users', :action => 'new'
map.login '/login', :controller => 'sessions', :action => 'new'
map.logout '/logout', :controller => 'sessions', :action => 'destroy'
{% endhighlight %}

5\. 修改配置文件：

{% highlight ruby %}
#config/environments.rb
config.active_record.observers = :user_observer
{% endhighlight %}

6\. 增加邮件通知功能（这里用的是gmail）：

{% highlight bash %}
$script/plugin install http://svn.douglasfshearer.com/rails/plugins/action_mailer_optional_tls
{% endhighlight %}

{% highlight ruby %}
#config/environment.rb
require 'smtp_tls'
ActionMailer::Base.delivery_method = :smtp
ActionMailer::Base.default_charset = "utf-8"
ActionMailer::Base.smtp_settings = {
  :tls => true,
  :address => "smtp.gmail.com",
  :port => "587",
  :authentication => :plain,
  :user_name => "flyerhzm",
  :password => "xxx"
}
{% endhighlight %}

{% highlight ruby %}
#app/models/user_mailer.rb
def setup_email(user)
  @recipients  = "#{user.email}"
  @from        = "flyerhzm@gmail.com"
  @subject     = "www.flyerhzm.com "
  @sent_on     = Time.now
  @body[:user] = user
end
{% endhighlight %}

7\. 设置需要控制的controller：

{% highlight ruby %}
#app/controllers/application.rb
include AuthenticatedSystem
{% endhighlight %}

{% highlight ruby %}
#app/controllers/posts_controller
before_filter :login_required
{% endhighlight %}

8\. 修改layout，增加header：
{% highlight rhtml %}
#app/views/layout/application.html.erb
<% if logged_in? -%>
<%= current_user.login %> |
  <%= link_to '推出', logout_path %>
<% else -%>
  <%= link_to '登录', login_path %> |
  <%= link_to '注册', new_user_path %>
<% end -%>
{% endhighlight %}

