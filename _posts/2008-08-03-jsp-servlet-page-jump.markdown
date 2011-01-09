---
layout: post
title: Jsp/Servlet页面跳转
categories:
- Java Web
---
Jsp/Servlet页面跳转有两种，一种是Redirect（页面重定向），另一种是Forward（页面转发）。

Redirect：

{% highlight java %}
response.sendRedirect("success.jsp");
{% endhighlight %}

完全跳转到一个新的请求，不共享之前Request中的数据。

Forward：

{% highlight java %}
RequestDispatcher rd = request.getRequestDispatcher("ResultServlet");
rd.forward(request, response);
{% endhighlight %}

将当前请求转发到另一个请求中去，后一个请求共享先前一个请求的Request数据。

