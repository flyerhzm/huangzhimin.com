---
layout: post
title: get_response_with_headers
categories:
- Ruby
- Rspec
- HTTP
---
最近在用ruby的net/http写爬虫，发现net/http提供的接口还真不是一般不好用

一开始我是用Net::HTTP.get_response方法，挺简单的，测试起来也不难

{% highlight ruby %}
http = mock(Net::HTTPSuccess)
http.stubs(:is_a?).with(Net::HTTPSuccess).returns(true)
http.stubs(:body).returns(content)
Net::HTTP.expects(:get_response).with(URI.parse(remote_path)).returns(http)
{% endhighlight %}

接着碰到有些网站必须指定User-Agent才能访问，发现get_response方法不能修改http headers，只能换Net::HTTP.start方法

{% highlight ruby %}
response = start(uri.host, uri.port) do |http|
  http.get(uri.request_uri, headers)
end
{% endhighlight %}

可是写测试的时候傻眼了，因为要根据不同的uri.request_uri返回不同的response，不过好像block内部是没法mock。

折腾了半天，最后只能为了测试写个辅助方法

{% highlight ruby %}
module Net
  class HTTP
    def HTTP.get_response_with_headers(uri, headers)
      response = start(uri.host, uri.port) do |http|
        http.get(uri.request_uri, headers)
      end
    end
  end
end
{% endhighlight %}

测试的mock和之前的get_response就一样了

{% highlight ruby %}
http = mock(Net::HTTPSuccess)
http.stubs(:is_a?).with(Net::HTTPSuccess).returns(true)
http.stubs(:body).returns(content)
Net::HTTP.expects(:get_response_with_headers).with(URI.parse(remote_path), headers).returns(http)
{% endhighlight %}

