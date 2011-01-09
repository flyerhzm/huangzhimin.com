---
layout: post
title: 使用active_scaffold做为项目的后台管理
categories:
- Rails
- Rails Plugins
---
最近做了一个很小的网站，需要一个简单的后台管理来对数据进行审核，由于只是个人用用，不想太浪费时间，就选用active_scaffold插件来做后台管理。对于小项目来说，应用active_scaffold可以快速地构建起项目的后台管理，自己不需要写view，相信大多数程序员都不怎么喜欢吧，controller也只需简单的配置即可。

下面介绍一下我使用active_scaffold作为后台管理的方式吧：

1\. 在routes.rb中定义admin namespace

{% highlight ruby %}
map.namespace :admin do |admin|
  admin.connect 'admin/:controller/:action/:id'
  admin.connect 'admin/:controller/:action/:id.:format'
end
{% endhighlight %}

2\. 定义AdminController基类，指明其子类必须是admin用户才能操作，以及layout

{% highlight ruby %}
# app/controller/admin_controller.rb
class AdminController < ApplicationController
  before_filter :login_required, :admin?
  layout 'admin'

  protected
    def admin?
      current_user.admin?
    end
end
{% endhighlight %}

3\. 后台管理相关的controller都继承AdminController，只需配置active_scaffold即可。

4\. 由于对model定义了default_scope :conditions => {:verify => true}，导致在后台页面也无法看到没有被验证的数据，只能通过修改active_scaffold源码


{% highlight diff %}
--- a/vendor/plugins/active_scaffold/lib/active_scaffold/finder.rb
+++ b/vendor/plugins/active_scaffold/lib/active_scaffold/finder.rb
@@ -132,7 +132,7 @@ module ActiveScaffold
     # TODO: this should reside on the model, not the controller
     def find_if_allowed(id, action, klass = nil)
       klass ||= active_scaffold_config.model
-      record = klass.find(id)
+      record = klass.send(:with_exclusive_scope){ klass.find(id) }
       raise ActiveScaffold::RecordNotAllowed unless record.authorized_for?(:action => action.to_sym)
       return record
     end
@@ -162,19 +162,19 @@ module ActiveScaffold
       finder_options.merge! custom_finder_options

       # NOTE: we must use :include in the count query, because some conditions may reference other tables
-      count = klass.count(finder_options.reject{|k,v| [:select, :order].include? k})
+      count = klass.send(:with_exclusive_scope) { klass.count(finder_options.reject{|k,v| [:select, :order].include? k}) }

       finder_options.merge! :include => full_includes

       # we build the paginator differently for method- and sql-based sorting
       if options[:sorting] and options[:sorting].sorts_by_method?
         pager = ::Paginator.new(count, options[:per_page]) do |offset, per_page|
-          sorted_collection = sort_collection_by_column(klass.find(:all, finder_options), *options[:sorting].first)
+          sorted_collection = sort_collection_by_column(klass.send(:with_exclusive_scope){klass.find(:all, finder_options)}, *options[:sorting].first)
           sorted_collection.slice(offset, per_page)
         end
       else
         pager = ::Paginator.new(count, options[:per_page]) do |offset, per_page|
-          klass.find(:all, finder_options.merge(:offset => offset, :limit => per_page))
+          klass.send(:with_exclusive_scope){klass.find(:all, finder_options.merge(:offset => offset, :limit => per_page))}
         end
       end
{% endhighlight %}

这样，一个简单的符合我需求的后台管理就搞定了

