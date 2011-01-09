---
layout: post
title: Annotate models
categories:
- Rails Plugins
---
Rails的约定优于配置和Ruby的动态性，使得model类变得十分简洁，但是也带来了一个问题：如果你想知道一个model有哪些属性时，必须去查看数据库或者migration，这给开发带来了极大的不便。Annotate models插件很好地解决了这个问题，它在model类的起始处以注释的形式写明了所有的属性，下面来看个例子：

1\. 创建工程：

{% highlight bash %}
$rails test_annotate_models
$cd rails test_annotate_models
{% endhighlight %}

2\. 安装插件：

{% highlight bash %}
$script/plugin install http://repo.pragprog.com/svn/Public/plugins/annotate_models
{% endhighlight %}

3\.  生成测试模型：

{% highlight bash %}
$script/generate model post title:string body:text
$rake db:migrate
{% endhighlight %}

4\. 生成annotation：

{% highlight bash %}
$rake annotate_models
{% endhighlight %}

5\. 效果：

{% highlight ruby %}
# == Schema Information
# Schema version: 1
#
# Table name: posts
#
#  id         :integer         not null, primary key
#  title      :string(255)
#  body       :text
#  created_at :datetime
#  updated_at :datetime
#
class Post  ActiveRecord::Base
end
{% endhighlight %}

6\. 增加模型：

{% highlight bash %}
$script/generate model comment body:text post:references
$script/generate migration add_comment_count_to_post
{% endhighlight %}

{% highlight ruby %}
#db/migrate/003_add_comment_count_to_post.rb
class AddCommentCountToPost  ActiveRecord::Migration
  def self.up
    add_column :posts, :comment_count, :integer
  end

  def self.down
    remove_column :posts, :comment_count
  end
end
{% endhighlight %}

{% highlight bash %}
$rake db:migrate
{% endhighlight %}

7\. 再试试annotation：

{% highlight bash %}
$rake annotate_models
{% endhighlight %}

8\. 效果：

{% highlight ruby %}
# == Schema Information
# Schema version: 3
#
# Table name: posts
#
#  id            :integer         not null, primary key
#  title         :string(255)
#  body          :text
#  created_at    :datetime
#  updated_at    :datetime
#  comment_count :integer
#
class Post  ActiveRecord::Base
end
{% endhighlight %}

{% highlight ruby %}
# == Schema Information
# Schema version: 3
#
# Table name: comments
#
#  id         :integer         not null, primary key
#  body       :text
#  post_id    :integer
#  created_at :datetime
#  updated_at :datetime
#
class Comment  ActiveRecord::Base
end
{% endhighlight %}

