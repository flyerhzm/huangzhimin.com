---
layout: post
title: acts_as_taggable_on_steroids
categories:
- Rails Plugins
---
acts_as_taggable_on_steroids是基于DHH写的acts_as_taggable，能够为active record的模型增加tag的功能，根据tag查找模型对象，以及计算tag云。下面的示例中我们将为博客系统增加tag功能：

1\. 创建工程：

{% highlight bash %}
$rails test_acts_as_taggable_on_steroids
$cd test_acts_as_taggable_on_steroids
{% endhighlight %}

2\. 安装插件：

{% highlight bash %}
$script/plugin install http://svn.viney.net.nz/things/rails/plugins/acts_as_taggable_on_steroids
{% endhighlight %}

3\. 生成post模型、tag和tagging模型：

{% highlight bash %}
$script/generate scaffold post title:string body:text
$script/generate acts_as_taggable_migration
{% endhighlight %}

4\. 为post模型增加tag功能，并添加测试数据：

{% highlight ruby %}
#app/models/post.rb
acts_as_taggable
{% endhighlight %}

{% highlight ruby %}
#db/migrate/001_create_posts.rb
Post.create(:title => "hello windows", :body => "windows programming")
Post.create(:title => "hello java", :body => "java programming")
Post.create(:title => "hello ruby", :body => "ruby programming")
Post.create(:title => "hello linux", :body => "linux programming")
{% endhighlight %}

{% highlight ruby %}
#db/migrate/002_acts_as_taggable_migration.rb
['windows', 'java', 'ruby', 'linux'].each do |name|
  p = Post.find_by_title("hello #{name}")
  p.tag_list = "#{name}, program"
  p.save
end
{% endhighlight %}

{% highlight bash %}
$rake db:migrate
{% endhighlight %}

5\. 调整页面显示：

{% highlight rhtml %}
#app/views/posts/new.html.erb
Tags (splitted by comma)
<%= f.text_field :tag_list %>

{% endhighlight %}

{% highlight rhtml %}
#app/views/posts/edit.html.erb
Tags (splitted by comma)
<%= f.text_field :tag_list %>
{% endhighlight %}

{% highlight rhtml %}
#app/views/posts/show.html.erb
Tags
<%=h @post.tag_list.join(",") %>
{% endhighlight %}

{% highlight rhtml %}
#app/views/posts/index.html.erb
<table>
  <tr>
    <td><%= link_to all, posts_path %></td>
    <% for tag in @tags %>
      <td><%= link_to tag.name, posts_path(:tag_name = tag.name) %></td>
    <% end %>
  </tr>
</table>
{% endhighlight %}

6\. 修改controller的index方法：

{% highlight ruby %}
#app/controllers/posts_controller.rb
def index
  @tags = Tag.find(:all)
  if params[:tag_name]
    @posts = Post.find_tagged_with(params[:tag_name], :match_all => true)
  else
    @posts = Post.find(:all)
  end

  respond_to do |format|
    format.html # index.html.erb
    format.xml  { render :xml => @posts }
  end
end
{% endhighlight %}

7\. 增加tag云功能：

{% highlight ruby %}
#app/helper/application_helper.rb
include TagsHelper
{% endhighlight %}

{% highlight ruby %}
#app/controllers/posts_controller.rb
def tag_cloud
  @tags = Post.tag_counts
end
{% endhighlight %}

{% highlight rhtml %}
#app/views/posts/index.html.erb
<%= link_to tag cloud, tag_cloud_posts_path %>
{% endhighlight %}

{% highlight ruby %}
#config/routes.rb
map.resources :posts, :collection => { :tag_cloud = :get }
{% endhighlight %}

{% highlight rhtml %}
#app/views/posts/tag_cloud.html.erb
<% tag_cloud @tags, %w(css1 css2 css3 css4) do |tag, css_class| %>
  <%= link_to tag.name, posts_path(:tag_name = tag.name), :class = css_class %>
<% end %>
{% endhighlight %}

{% highlight css %}
#public/stylesheets/scaffold.css
  .css1 { font-size: 1.0em; }
  .css2 { font-size: 1.2em; }
  .css3 { font-size: 1.4em; }
  .css4 { font-size: 1.6em; }
{% endhighlight %}

Tips:

考虑到性能问题，可以为模型的tag做缓冲，只需要在数据库表中增加一列，比如为上文的博客系统增加cache：

{% highlight bash %}
$script/generate migration cache_post_tag_list
{% endhighlight %}

{% highlight ruby %}
#db/migrate/003_cache_post_tag_list.rb
add_column :posts, :cached_tag_list, :string
{% endhighlight %}

所有的tag名字会组成一个字符串存储在这个字段里，所以不能超过该字段限制的长度。另外需要手动调用save_cached_tag_list才能将tag存储到tags表中

