---
layout: post
title: .htaccess实现url redirect
categories:
- Seo
---
最近开始做些seo方面的工作，纠正了自己之前的误区，以为huangzhimin.com和www.huangzhimin.com是相同的，其实不然，对于spider来说，这完全就是两个网页。登录google的webmaster就一目了然了，google允许你选择一个prefer的网页，不过更推荐使用301redirect的方式。

对于基于apache的网站来说，实现301redirect是非常简单的，下面是我把non www重定向到www页面的配置

{% highlight bash %}
RewriteEngine on
RewriteCond %{HTTP_HOST} ^huangzhimin.com [NC]
RewriteRule ^(.*)$ http://www.huangzhimin.com/$1 [L,R=301]
{% endhighlight %}

现在所有的网页都是www开头的，方便spider来爬取

