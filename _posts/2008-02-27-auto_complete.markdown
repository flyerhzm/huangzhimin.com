---
layout: post
title: auto_complete
categories:
- Rails Plugins
---
atuo_complete插件提供输入提示功能，我们通过一个example来示范，用户在输入日志的tag时，有自动输入提供。

1. 创建测试工程：

{% highlight bash %}
$rails test_auto_complete
$cd test_auto_complete
{% endhighlight %}

2. 生成blog和tag模型：

{% highlight bash %}
$script/generate scaffold blog title:string content:string
$script/generate model tag name:string blog_id:integer
{% endhighlight %}

3. 映射一对多关系：

{% highlight ruby %}
#app/models/blog.rb
has_many :tags
{% endhighlight %}

{% highlight ruby %}
#app/models/tag.rb
belongs_to :blog
{% endhighlight %}

4. 添加测试数据：

{% highlight ruby %}
#db/migrate/001_create_blogs.rb
Blog.create(:title = test, :content = test)
{% endhighlight %}

{% highlight ruby %}
#db/migrate/002_create_tags.rb
blog = blog.find(:first)
Tag.create(:name = ruby, :blog_id = blog)
Tag.create(:name = rails, :blog_id = blog)
Tag.create(:name = agile, :blog_id = blog)
Tag.create(:name = web, :blog_id = blog)
{% endhighlight %}

5. 生成数据表：

{% highlight bash %}
$rake db:migrate
{% endhighlight %}

6. 安装auto_complete插件：

{% highlight bash %}
$script/plugin install http://svn.rubyonrails.org/rails/plugins/auto_complete/
{% endhighlight %}

7. 为controller添加auto_complete_for方法：

{% highlight ruby %}
#app/controllers/blogs_controller.rb
auto_complete_for :tag, :name
{% endhighlight %}

8. 在routes中添加映射关系：

{% highlight ruby %}
#config/routes.rb
map.resources :blogs, :collection = { :auto_complete_for_tag_name = :get }
{% endhighlight %}

9. 在view中添加需要提示功能的输入框：

{% highlight rhtml %}
#app/views/blogs/new.html.erb
Tags
<%= text_field_with_auto_complete :tag, :name, {}, {:method = :get} %>
{% endhighlight %}

10. 确保页面已经包含prototype库：

{% highlight rhtml %}
#app/views/layout/blogs.html.erb
<%= javascript_include_tag :defaults %>
{% endhighlight %}

11. 测试：

{% highlight bash %}
$script/server
{% endhighlight %}

在浏览器中输入[http://localhost:3000/blogs/new][1]
在Tags输入框中输入r，系统将提示ruby和rails

12. 如果你想输入多个tag都有提示的话，比如用空格分开：

{% highlight rhtml %}
#app/views/blogs/new.html.erb
<%= text_field_with_auto_comlete :tag, :name, {}, {:method = :get, :token = ' '} %>
{% endhighlight %}

在Tags输入框中输入ruby on r，系统将提示ruby和rails

13. 如果你想在光标进入输入框就提示的话，可以这样做：

{% highlight rhtml %}
#app/views/blogs/new.html.erb
<%= text_field_with_auto_complete :tag, :name, {:onfocus = tag_name_auto_completer.activate()}, {:method = :get, :token = ' '} %>
{% endhighlight %}

在Tags输入框为空时，点击该输入框，系统将提示agile, rails, ruby, web



Tips：

{% highlight ruby %}
#Controller中可带参数有:conditions, :limit, :order
class BlogController  ApplicationController
  auto_complete_for :tag, :name, :limit = 15, :order = 'created_at DESC'
end
{% endhighlight %}

{% highlight rhtml %}
#View中可待参数有两种：
#一是tag_options，与text_field的options相同
#二是completion_options，与prototype库的Ajax.AutoCompleter的options相同
<%= text_field_with_auto_complete :tag, :name, {:size = 10}, {:tokens = ' '} %>
{% endhighlight %}


  [1]: http://localhost:3000/blogs/new

