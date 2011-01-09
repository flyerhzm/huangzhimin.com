---
layout: post
title: 通过数组转置来组织ActiveRecord的conditions
categories:
- Rails
- ActiveRecord
---
使用ActiveRecord的conditions最基本的方法就是数组：

{% highlight ruby %}
:conditions => ['first_name = ? and middle_name = ? and last_name = ?', 'George', 'W', 'Bush']
{% endhighlight %}

更灵活的方法是使用Hash来组织：

{% highlight ruby %}
:conditions => {:first_name => 'George', :middle_name => 'W', :last_name => 'Bush'}
{% endhighlight %}

这样在动态构建查询条件的情况非常有帮助，比如根据查询参数来构建conditions：

{% highlight ruby %}
conditions = {}
conditions.merge!({:first_name => params[:first_name]}) if params[:first_name]
conditions.merge!({:first_name => params[:middle_name]}) if params[:middle_name]
conditions.merge!({:first_name => params[:last_name]}) if params[:last_name]

:conditions = conditions
{% endhighlight %}

但是Hash conditions也有其限制，不支持LIKE，不支持Not Null等等，能不能结合Array Conditions的强大和Hash Conditions的灵活呢？答案当然是肯定的：

{% highlight ruby %}
conditions = []
conditions << ['first_name LIKE ?', "%#{params[:first_name]}%"] if params[:first_name]
conditions << ['middle_name LIKE ?', "%#{params[:middle_name]}%"] if params[:middle_name]
conditions << ['last_name LIKE ?', "%#{params[:last_name]}%"] if params[:last_name]

:conditions = [conditions.transpose.first.join(' AND '), *conditions.transpose.last]
{% endhighlight %}

其实就是通过数组转置来构建查询语句的。

