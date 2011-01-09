---
layout: post
title: 在google app engine上做代理服务(for crawler)
categories:
- Java
- GAE
- Ruby
- HTTP
---
本来是想在GAE上做一个完整的代理服务器的，结果发现不可行，好像当HTTP的URL和HOST不匹配的时候，GAE就会把你拦截。怪不得GAE上找到的代理服务器都必须安装客户端或者是网页式的呢。

但是我在hostmonster上的crawler还被挡在国门之外，没办法，只能通过QUERY_STRING来实现一个比较奇怪的代理了：

{% highlight java %}
package com.huangzhimin.gae.proxy;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Enumeration;

import javax.servlet.http.*;

@SuppressWarnings("serial")
public class RichardProxyServlet extends HttpServlet {
    public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String dest = req.getParameter("dest");
        URL url = new URL(dest);
        HttpURLConnection connection = null;
        InputStream in = null;
        try {
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            Enumeration headers = req.getHeaderNames();
            while (headers.hasMoreElements()) {
                String headerName = (String) headers.nextElement();
                connection.setRequestProperty(headerName, req.getHeader(headerName));
            }
            connection.setDoOutput(true);
            connection.setReadTimeout(10000);
            connection.connect();
            in = connection.getInputStream();
            byte[] b = new byte[4096];
            int bytesRead = 0;
            while (true) {
                bytesRead = in.read(b, 0, 4096);
                if (bytesRead == -1) {
                    break;
                }
                resp.getOutputStream().write(b, 0, bytesRead);
            }
        } finally {
            if (in != null) {
                in.close();
            }
            if (connection != null) {
                connection.disconnect();
            }
        }
    }
}
{% endhighlight %}

实现起来很简单，就是读取QUERY_STRING，获取需要爬取的网址，设置相应的request headers，然后发送请求，读取应答。

再来看看hostmonster上的爬虫如何处理吧：

{% highlight ruby %}
require 'regexp_crawler/crawler'

module Net
  class HTTP
    def HTTP.get_response_with_headers(uri, headers)
      response = start('richardproxy.appspot.com', 80) do |http|
        http.get('/richardproxy?dest=' + uri.to_s, headers)
      end
    end
  end
end
{% endhighlight %}

那就是在获取网页内容的时候，传入GAE上代理的地址，增加QUERY_STRING来表示要爬取的网页，当然也可以修改相应的http headers，其它地方都无须改动。

虽然在GAE上搭建完整代理服务的尝试失败了，但是我的爬虫又活过来了，而且发现在GAE上放些应用应该会很不错，毕竟google的server还是相当牛的，只要流量不是太大，就可以创建十个免费的应用哦，下次试试做个JRuby应用上去，呵呵。

