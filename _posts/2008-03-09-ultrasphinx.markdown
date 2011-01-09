---
layout: post
title: ultrasphinx
categories:
- Rails Plugins
---
ultrasphinx是基于sphinx的rails全文搜索插件。我们将在一个已有的博客系统上增加全文搜索来学习这个插件，

1\. 首先确保系统已经安装以下软件：
* MySQL 5.0
* Sphinx 0.9.8-dev r1112
* Rails 2.0.2 
并且需要安装chronic gem，rails应用使用的是mysql数据库

2\. 安装插件：

{% highlight bash %}
$script/plugin install -x svn://rubyforge.org/var/svn/fauna/ultrasphinx/trunk
$mkdir config/ultrasphinx
$cp vendor/plugin/ultrasphinx/examples/default.base config/ultrasphinx/
{% endhighlight %}

3\. 标记需要索引的内容：

{% highlight ruby %}
#app/models/post.rb
is_indexed :fields => [title, body]
{% endhighlight %}

{% highlight ruby %}
#app/models/comment.rb
is_indexed :fields => [body] 
{% endhighlight %}

4\. 多model的统计配置：

{% highlight ruby %}
#config/initializers/ultrasphinx.rb
Ultrasphinx::Search.client_options[:with_subtotals] = true
{% endhighlight %}

5\. 生成索引，并运行ultrasphinx：

{% highlight bash %}
$rake ultrasphinx:configure
$sudo rake ultrasphinx:index
$sudo rake ultrasphinx:daemon:start
{% endhighlight %}

6\.增加search controller：

{% highlight bash %}
$script/generate controller search
{% endhighlight %}

{% highlight ruby %}
#app/controllers/search_controller.rb
class SearchController  ApplicationController
  def index
    @search = Ultrasphinx::Search.new(:query => params[:q],
                                      :class_names => SearchHelper::class_name(params[:category]),
                                      :page => params[:page]|| 1,
                                      :per_page => 10)
    @search.run
  end
end
{% endhighlight %}

{% highlight ruby %}
#app/helpers/search_helper.rb
module SearchHelper
  def output_results(search)
    stat = "搜索结果："
    search.results.each do |result|
      stat  (render :partial => "#{result.class.to_s.downcase}", :object => result)
    end

    stat << "共" << search.total_entries.to_s << "结果。"

    search.subtotals.each do |category, count|
      stat << SearchHelper::ui_name(category) << ":" << count.to_s << "条结果\t"
    end
    stat
  end

  def self.class_name(category_value)
    r = SEARCH_CATEGORIES.detect do |c|
      c[2] == category_value
    end || SEARCH_CATEGORIES[0]
    r[1]
  end

  def self.ui_name(class_name)
    r = SEARCH_CATEGORIES.detect do |c|
      c[1] == class_name
    end || SEARCH_CATEGORIES[0]
    r[0]
  end

  SEARCH_CATEGORIES = [
    #uiname, classname, uivalue
    ['所有', nil, 'all'],
    ['文章', 'Post', 'post'],
    ['评论', 'Comment', 'comment']
  ].freeze
end
{% endhighlight %}

7\. 提供搜索页面和搜索结果显示页面：

{% highlight rhtml %}
#app/views/shared/_search.html.erb
<form action="/search" method="get" id="search_form">
  <label for="search_category">类别：</label>
  <select id="search_category" name="category">
    <option value="all" selected="selected">所有</option>
    <option value="post">文章</option>
    <option value="comment">评论</option>
  </select>
  <label for="q">关键字：</label>
  <input type="text" name="q" value="<%= params[:q] %>" id="q">
  <input type="submit" value="搜索">
</form>
{% endhighlight %}

{% highlight rhtml %}
#app/views/search/_post.html.erb
文章：<%= post.title %>
<%= post.body %>
{% endhighlight %}

{% highlight rhtml %}
#app/views/search/_comment.html.erb
评论：
<%= comment.body %>
{% endhighlight %}

{% highlight rhtml %}
#app/views/search/index.html.erb
<%= output_results(@search) %>
<%= will_paginate(@search) %>
{% endhighlight %}

8\. 中文支持：

{% highlight ruby %}
#config/ultrasphinx/default.base
ngram_len = 1
ngram_chars = U+4E00..U+9FBB, U+3400..U+4DB5, U+20000..U+2A6D6, U+FA0E, U+FA0F, U+FA11, U+FA13, U+FA14, U+FA1F, U+FA21, U+FA23, U+FA24, U+FA27, U+FA28, U+FA29, U+3105..U+312C, U+31A0..U+31B7, U+3041, U+3043, U+3045, U+3047, U+3049, U+304B, U+304D, U+304F, U+3051, U+3053, U+3055, U+3057, U+3059, U+305B, U+305D, U+305F, U+3061, U+3063, U+3066, U+3068, U+306A..U+306F, U+3072, U+3075, U+3078, U+307B, U+307E..U+3083, U+3085, U+3087, U+3089..U+308E, U+3090..U+3093, U+30A1, U+30A3, U+30A5, U+30A7, U+30A9, U+30AD, U+30AF, U+30B3, U+30B5, U+30BB, U+30BD, U+30BF, U+30C1, U+30C3, U+30C4, U+30C6, U+30CA, U+30CB, U+30CD, U+30CE, U+30DE, U+30DF, U+30E1, U+30E2, U+30E3, U+30E5, U+30E7, U+30EE, U+30F0..U+30F3, U+30F5, U+30F6, U+31F0, U+31F1, U+31F2, U+31F3, U+31F4, U+31F5, U+31F6, U+31F7, U+31F8, U+31F9, U+31FA, U+31FB, U+31FC, U+31FD, U+31FE, U+31FF, U+AC00..U+D7A3, U+1100..U+1159, U+1161..U+11A2, U+11A8..U+11F9, U+A000..U+A48C, U+A492..U+A4C6
{% endhighlight %}

9\. 重新索引和服务：

{% highlight bash %}
$rake ultrasphinx:configure
$sudo rake ultrasphinx:index
$sudo rake ultrasphinx:daemon:restart
{% endhighlight %}

