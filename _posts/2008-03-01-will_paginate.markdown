---
layout: post
title: will_paginate
categories:
- Rails Plugins
---
will_paginate为Rails提供了非常方便的分页浏览功能。我们将通过一个小例子来展示：

1\. 创建工程：

{% highlight bash %}
$rails test_will_paginate
$cd test_will_paginate
{% endhighlight %}

2\. 安装插件：

{% highlight bash %}
$script/plugin install svn://errtheblog.com/svn/plugins/will_paginate
{% endhighlight %}

3\. 生成post模型，并添加测试数据：

{% highlight bash %}
$script/generate scaffold post title:string body:text
{% endhighlight %}

{% highlight ruby %}
#db/migrate/001_create_posts.rb
(1..50).each do |num|
  Post.create(:title => "title#{num}", :body => "body#{num}")
end
{% endhighlight %}

4\. 生成数据表：

{% highlight bash %}
$rake db:migrate
{% endhighlight %}

5\. 定义模型默认一页显示的条目数：

{% highlight ruby %}
#app/models/post.rb
def self.per_page
  10
end
{% endhighlight %}

6\. 修改controller的index方法，使其支持分页：

{% highlight ruby %}
#app/controllers/posts_controller.rb
def index
  @posts = Post.paginate :page => params[:page], :order => 'updated_at DESC'
  ......
end
{% endhighlight %}

7\. 调整页面显示：

{% highlight rhtml %}
#app/views/posts/index.html.erb
<%= will_paginate @posts %>

Total entries: <%= @posts.total_entries %>, total pages: <%= @posts.page_count %>, current page: <%= @posts.current_page %>
{% endhighlight %}

8\. 最后加上will_paginate推荐的css：

{% highlight css %}
#public/stylesheets/scaffold.css
.pagination {
  padding: 3px;
  margin: 3px;
}
.pagination a {
  padding: 2px 5px 2px 5px;
  margin: 2px;
  border: 1px solid #aaaadd;
  text-decoration: none;
  color: #000099;
}
.pagination a:hover, .pagination a:active {
  border: 1px solid #000099;
  color: #000;
}
.pagination span.current {
  padding: 2px 5px 2px 5px;
  margin: 2px;
  border: 1px solid #000099;
  font-weight: bold;
  background-color: #000099;
  color: #FFF;
}
.pagination span.disabled {
  padding: 2px 5px 2px 5px;
  margin: 2px;
  border: 1px solid #eee;
  color: #ddd;
}
{% endhighlight %}

