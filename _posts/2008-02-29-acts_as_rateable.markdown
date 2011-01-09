---
layout: post
title: acts_as_rateable
categories:
- Rails Plugins
---
acts_as_rateable插件为ActiveRecord模型对象提供评分/评级的能力，我们的示例是在blog系统中添加简单的打分功能。

1\. 创建测试工程：

{% highlight bash %}
$rails test_acts_as_rateable
$cd test_acts_as_rateable
{% endhighlight %}

2\. 安装插件：

{% highlight bash %}
$script/plugin install svn://rubyforge.org/var/svn/rateableplugin/trunk
{% endhighlight %}

3\. 生成blog模型，并添加测试数据：

{% highlight bash %}
$script/generate scaffold blog name:string content:text
{% endhighlight %}

{% highlight ruby %}
#db/migrate/001_create_blogs.rb
Blog.create(:name => "poorest", :content => "poorest")
Blog.create(:name => "poorer", :content => "poorer")
Blog.create(:name => "just so so", :content => "just so so")
Blog.create(:name => "better", :content => "better")
Blog.create(:name => "sbest", :content => "best")
{% endhighlight %}

4\. 生成rating migration：

{% highlight bash %}
$script/generate migration add_ratings
{% endhighlight %}

{% highlight ruby %}
#db/migrate/002_create_ratings.rb
def self.up
  create_table :ratings do |t|
    t.integer :rating    # You can add a default value here if you wish
    t.integer :rateable_id :null => false
    t.string :rateable_type, :null => false
  end
  add_index :ratings, [:rateable_id, :rating]    # Not required, but should help more than it hurts
end

def self.down
  drop_table :ratings
end
{% endhighlight %}

5\. 生成数据表：

{% highlight bash %}
$rake db:migrate
{% endhighlight %}

6\. 为blog模型增加打分功能：

{% highlight ruby %}
#app/models/blog.rb
acts_as_rateable
{% endhighlight %}

7\. 增加打分url：

{% highlight ruby %}
#config/routes.rb
map.resources :blogs, :member => { :rating = :post }
{% endhighlight %}

8\. 页面中增加打分form：

{% highlight rhtml %}
#app/views/blogs/show.html.erb
<% form_tag rating_blog_path(@blog) do %>
  Rating
  <% (1..5).each do |value| %>
    <%= radio_button_tag :rating, value, true %> <%= value %>
  <% end %>

  <%= submit_tag 'Rate' %>
<% end %>
{% endhighlight %}

9\. controller中增加相应的action处理：

{% highlight ruby %}
#app/controllers/blogs_controller.rb
def rating
  Blog.find(params[:id]).rating = params[:rating]
  redirect_to :action => :index
end
{% endhighlight %}

10\. index页面显示打分结果：

{% highlight rhtml %}
#app/views/blogs/index.html.erb
Rating
<%=h blog.rating %>
{% endhighlight %}

11\. 增加搜索功能：

{% highlight rhtml %}
#app/views/blogs/index.html.erb
<% options = "12345" %>
<% form_tag blogs_path, :method => :get do %>
  Rating from <%= select_tag "from", options %> to <%= select_tag "to", options %>
  <%= submit_tag 'Search' %>
<% end %>
{% endhighlight %}

{% highlight ruby %}
#app/controllers/blogs_controller.rb
def index
  if params[:from] and params[:to]
    @blogs = Blog.find_all_by_rating(params[:from].to_i..params[:to].to_i)
  else
    @blogs = Blog.find(:all)
  end

  respond_to do |format|
    format.html # index.html.erb
    format.xml  { render :xml => @blogs }
  end
end
{% endhighlight %}

Tips：
以上的示例只能为每个blog保留一个评分，如果希望能够多次评分，以获得平均分的话，可以在model中增加average参数：

{% highlight ruby %}
#app/models/blog.rb
acts_as_rateable :average => true
{% endhighlight %}

 不过这样的话，就不能用find_by_rating方法了。如果需要的话需要修改acts_as_rating.rb源码
