---
layout: post
title: contact-list类库依赖包之commons-httpclient
categories:
- Java
- contact-list
- HTTP
---
commons-httpclient是apache下的一个开源项目，提供了一个纯java实现的http客户端，使用它可以很方便发送HTTP请求，接受HTTP应答，自动管理Cookie等等。

对于contact-list类库来说，需要使用的功能有，自动管理Cookie，设置HTTP头，发送HTTP请求，接受HTTP应答，转发HTTP重定向，还有输出HTTP请求/应答日志，下面对这些功能的实现进行解释：

1. 自动管理Cookie

{% highlight java %}
public EmailImporter(String email, String password, String encoding) {
    ......
    client = new HttpClient();
    client.getParams().setCookiePolicy(CookiePolicy.BROWSER_COMPATIBILITY);
    client.getParams().setParameter("http.protocol.single-cookie-header", true);
}
{% endhighlight %}

其中将HttpClient的Cookie策略设置为CookiePolicy.BROWSER_COMPATIBILITY，即表示java client将按照浏览器的方式来自动处理Cookie。当然你也可以在运行过程中手动调整cookie，比如：

hotmail登录之前需要设置当前时间的Cookie：

{% highlight java %}
client.getState().addCookie(new Cookie("login.live.com", "CkTst", "G" + new Date().getTime()));
{% endhighlight %}

不过，httpclient似乎没有提供删除cookie的功能，于是我增加了两个cookie管理的接口，一个是保留指定的cookies，一个是删除指定的cookies：

{% highlight java %}
protected void retainCookies(String[] cookieNames) {
    Cookie[] cookies = client.getState().getCookies();
    ArrayList<Cookie> retainCookies = new ArrayList<Cookie>();
    for (Cookie cookie : cookies) {
        if (Arrays.binarySearch(cookieNames, cookie.getName()) >= 0) {
            retainCookies.add(cookie);
        }
    }
    client.getState().clearCookies();
    client.getState().addCookies(retainCookies.toArray(new Cookie[0]));
}

protected void removeCookies(String[] cookieNames) {
    Cookie[] cookies = client.getState().getCookies();
    ArrayList<Cookie> retainCookies = new ArrayList<Cookie>();
    for (Cookie cookie : cookies) {
        if (Arrays.binarySearch(cookieNames, cookie.getName())  0) {
            retainCookies.add(cookie);
        }
    }
    client.getState().clearCookies();
    client.getState().addCookies(retainCookies.toArray(new Cookie[0]));
}
{% endhighlight %}

2. 设置HTTP头：

http头的设置，可以让邮件服务器认为是在和浏览器打交道，而避免被refuse的可能：

{% highlight java %}
private void setHeaders(HttpMethod method) {
    method.setRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;");
    method.setRequestHeader("Accept-Language", "zh-cn");
    method.setRequestHeader("User-Agent", "Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-CN; rv:1.9.0.3) Gecko/2008092417 Firefox/3.0.3");
    method.setRequestHeader("Accept-Charset", encoding);
    method.setRequestHeader("Keep-Alive", "300");
    method.setRequestHeader("Connection", "Keep-Alive");
    method.setRequestHeader("Cache-Control", "no-cache");
}
{% endhighlight %}

另外，在GET和POST的时候设置referer值，以及在POST的时候设置Content-Type：

{% highlight java %}
protected String doPost(String actionUrl, NameValuePair[] params, String referer) throws HttpException, IOException {
    ......
    method.setRequestHeader("Referer", referer);
    method.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ......
}
{% endhighlight %}

3. 发送HTTP请求，接收HTTP应答。在contact-list中只使用了GET和POST请求，我也做了简单的封装：

{% highlight java %}
protected String doGet(String url, String referer) throws HttpException, IOException {
    GetMethod method = new GetMethod(url);
    setHeaders(method);
    method.setRequestHeader("Referer", referer);
    // log request
    client.executeMethod(method);
    String responseStr = readInputStream(method.getResponseBodyAsStream());
    // log response
    method.releaseConnection();
    lastUrl = method.getURI().toString();
    return responseStr;
}

protected String doPost(String actionUrl, NameValuePair[] params, String referer) throws HttpException, IOException {
    PostMethod method = new PostMethod(actionUrl);
    setHeaders(method);
    method.setRequestHeader("Referer", referer);
    method.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    method.setRequestBody(params);
    // log request
    client.executeMethod(method);
    String responseStr = readInputStream(method.getResponseBodyAsStream());
    // log response
    method.releaseConnection();
    if (method.getResponseHeader("Location") != null) {
        // do redirect
    } else {
        lastUrl = method.getURI().toString();
        return responseStr;
    }
}
{% endhighlight %}

4. HTTP重定向，主要是两种，一种是根据HTTP头的Location

{% highlight java %}
if (method.getResponseHeader("Location").getValue().startsWith("http")) {
    return doGet(method.getResponseHeader("Location").getValue());
} else {
    return doGet("http://" + getResponseHost(method) + method.getResponseHeader("Location").getValue());
}
{% endhighlight %}

另一种是根据javascript中的window.location.replace。

5. 输出请求/应答日志，这个对调试非常重要：

{% highlight java %}
private void logGetRequest(GetMethod method) throws URIException {
    logger.debug("do get request: " + method.getURI().toString());
    logger.debug("header:\n" + getHeadersStr(method.getRequestHeaders()));
    logger.debug("cookie:\n" + getCookieStr());
}

private void logGetResponse(GetMethod method, String responseStr) throws URIException {
    logger.debug("do get response: " + method.getURI().toString());
    logger.debug("header: \n" + getHeadersStr(method.getResponseHeaders()));
    logger.debug("body: \n" + responseStr);
}

private void logPostRequest(PostMethod method) throws URIException {
    logger.debug("do post request: " + method.getURI().toString());
    logger.debug("header:\n" + getHeadersStr(method.getRequestHeaders()));
    logger.debug("body:\n" + getPostBody(method.getParameters()));
    logger.debug("cookie:\n" + getCookieStr());
}

private void logPostResponse(PostMethod method, String responseStr) throws URIException {
    logger.debug("do post response:" + method.getURI().toString());
    logger.debug("header:\n" + getHeadersStr(method.getResponseHeaders()));
    logger.debug("body:\n" + responseStr);
}

private String getHeadersStr(Header[] headers) {
    StringBuilder builder = new StringBuilder();
    for (Header header : headers) {
        builder.append(header.getName()).append(": ").append(header.getValue()).append("\n");
    }
    return builder.toString();
}

private String getPostBody(NameValuePair[] postValues) {
    StringBuilder builder = new StringBuilder();
    for (NameValuePair pair : postValues) {
        builder.append(pair.getName()).append(":").append(pair.getValue()).append("\n");
    }
    return builder.toString();
}

private String getCookieStr() {
    Cookie[] cookies = client.getState().getCookies();
    StringBuilder builder = new StringBuilder();
    for (Cookie cookie : cookies) {
        builder.append(cookie.getDomain()).append(":")
               .append(cookie.getName()).append("=").append(cookie.getValue()).append(";")
               .append(cookie.getPath()).append(";")
               .append(cookie.getExpiryDate()).append(";")
               .append(cookie.getSecure()).append(";\n");
    }
    return builder.toString();
}
{% endhighlight %}

掌握好以上这些方法，基本上就可以很容易地模拟浏览器访问页面了，剩下的就是通过抓包工具观察，发送什么请求，获取什么应答，以及对应答进行字符串解析了。

