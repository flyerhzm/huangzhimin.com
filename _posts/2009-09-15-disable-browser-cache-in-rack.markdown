---
layout: post
title: disable browser cache in rack
categories:
- Rails
- Rack
- HTTP
---
bullet插件在浏览器cache下总是会问题，因为页面被cache了，总是返回304 Not Modified，bulletware下的代码没有执行就直接跳过了。

之前就是在README下面写了一段，让用户把web browser cache disable掉，不过始终不是一个解决方法，今天就直接在rack下把browser cache disable掉了

{% highlight ruby %}
class Bulletware
  def initialize(app)
    @app = app
  end

  def call(env)
    return @app.call(env) unless Bullet.enable?
    ......
    no_browser_cache(headers) if Bullet.disable_browser_cache
    [status, headers, response_body]
  end

  def no_browser_cache(headers)
    headers["Cache-Control"] = "no-cache, no-store, max-age=0, must-revalidate"
    headers["Pragma"] = "no-cache"
    headers["Expires"] = "Wed, 09 Sep 2009 09:09:09 GMT"
  end
end
{% endhighlight %}

no_browser_cache这个方法内容是google出来的，换了一个好日子^_^，还换了rack的方式，这样304 Not Modified就不会出现了。

