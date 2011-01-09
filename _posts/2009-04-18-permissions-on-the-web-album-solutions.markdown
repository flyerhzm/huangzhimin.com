---
layout: post
title: 关于网络相册权限的解决方案
categories:
- Java Web
---
之前做i9i8网站时有这样的需求，用户设置自己相册的权限，可以是所有人都能看，可以是相册主人的好友可见，可以是只有相册主人自己能看到，也可以是通过输入密码看到。因为网站是用php写的，自然想到的是用php做权限控制，不过leader给了一个更好的方案，用J2EE的Filter，所有的相册请求都经由Filter来过滤，相对就很独立，重用性也更好。

处理的方式是把相册的id作为url的parameter传递，而当前用户的key以及查看相册的密码通过cookie来传递。流程是这样的：

1\. 根据url中的相册id去数据库中查找相应的相册记录

2\. 依据相册的权限进行相应的处理：
    2.1. 如果是所有人都能看的，则通过
    2.2. 如果是相册主人才能看到的，则比较cookie中的当前用户和相册的主人
    2.3. 如果是相册主人的好友可见，则查询相册的主人与cookie中的当前用户是否是好友
    2.4. 如果是通过输入密码才可见的，则比较cookie中的密码与相册设置的密码是否一致

其中，如果不通过则重定向到表示权限不够的错误图片的url。

代码如下：

{% highlight java %}
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
  throws IOException, ServletException {
    HttpServletRequest httpRequest = (HttpServletRequest) request;
    HttpServletResponse httpResponse = (HttpServletResponse) response;

    try {
        // 获取要访问的相册
        Photoalbum album = getPhotoalbum(httpRequest.getRequestURI());
        String privacy = album.getPrivaty();

        // 检查访问相册的权限
        if (ALL.equalsIgnoreCase(privacy)) {
            // 所有人可见
            chain.doFilter(request, response);
        } else if (SELF.equalsIgnoreCase(privacy)) {
            // 相册主人才可见
            String userKey = getCookie(httpRequest, USER_COOKIE_NAME);
            check(userKey);
            String myUserId = getUserId(userKey);
            if (album.getUserId().equals(myUserId)) {
                chain.doFilter(request, response);
            } else {
                RequestDispatcher rd = httpRequest.getRequestDispatcher(ERROR_IMAGE);
                rd.forward(request, response);
            }
        } else if (FRIEND.equalsIgnoreCase(privacy)) {
            // 相册好友可见
            String userKey = getCookie(httpRequest, USER_COOKIE_NAME);
            check(userKey);
            String myUserId = getUserId(userKey);
            if (isFriend(album.getUserId(), myUserId)) {
                chain.doFilter(request, response);
            } else {
                RequestDispatcher rd = httpRequest.getRequestDispatcher(ERROR_IMAGE);
                rd.forward(request, response);
            }
        } else if (BYPASSWORD.equalsIgnoreCase(privacy)) {
            // 输入密码可见
            String albumPwd = getCookie(httpRequest, ALBUM_PASSWORD_COOKIE_PREFIX + album.getId());
            check(albumPwd);
            if (album.getPassword().equals(albumPwd)) {
                chain.doFilter(request, response);
            } else {
                RequestDispatcher rd = httpRequest.getRequestDispatcher(ERROR_IMAGE);
                rd.forward(request, response);
            }
        } else {
            RequestDispatcher rd = httpRequest.getRequestDispatcher(ERROR_IMAGE);
            rd.forward(request, response);
        }
    } catch (Throwable t) {
        RequestDispatcher rd = httpRequest.getRequestDispatcher(ERROR_IMAGE);
        rd.forward(request, response);
    }
}
{% endhighlight %}

