---
layout: post
title: webrick源码分析──路由
categories:
- webrick
- Ruby
---
webrick的路由是由WEBrick::HTTPServer::MountTable定义的

MountTable由@tab和@scanner组成，@tab是一个由script_name到Servlet的Hash，@scanner一个可以匹配所有script_name的正则表达式。其定义如下：

{% highlight ruby %}
class MountTable
  def initialize
    @tab = Hash.new
    compile
  end

  def [](dir)
    dir = normalize(dir)
    @tab[dir]
  end

  def []=(dir, val)
    dir = normalize(dir)
    @tab[dir] = val
    compile
    val
  end

  def delete(dir)
    dir = normalize(dir)
    res = @tab.delete(dir)
    compile
    res
  end

  def scan(path)
    @scanner =~ path
    [ $&, $' ]
  end
end
{% endhighlight %}

MountTable只提供了四个方法：

[] 根据script_name获取相应的Servlet
[]= 定义scrpt_name与Servlet的对应关系
delete 删除script_name到Servlet的映射
scan 根据request的path返回相应的script_name和path_info

另外normalize和compile是MountTable的私有方法，normalize会删除url最后的'/'，compile生成可以匹配所有script_name的正则表达式

看完定义之后，先来看看我们是如何定义路由的

1\. 定义根目录

{% highlight ruby %}
doc_root = '/home/flyerhzm'
server.mount("/", WEBrick::HTTPServlet::FileHandler, doc_root, {:FancyIndexing=>true})
{% endhighlight %}

2\. 定义任意目录

{% highlight ruby %}
cgi_dir = '/home/flyerhzm/cgi-bin'
server.mount("/cgi-bin", WEBrick::HTTPServlet::FileHandler, cgi_dir, {:FancyIndexing=>true})
{% endhighlight %}

上面定义了两个由FileHandler处理的路由，当path为/'时，在'/home/flyerhzm'目录下查找相应的文件，当path为'/cgi-bin'时，在'/home/flyerhzm/cgi-bin'目录下查找相应的文件，选项:FancyIndexing=true表示，在path对应为某个目录时，显示目录下的所有文件。对应到MountTable的@tab为

{% highlight ruby %}
""=>[WEBrick::HTTPServlet::FileHandler, ["/home/flyerhzm", {:FancyIndexing=>true}]],
/cgi-bin=[WEBrick::HTTPServlet::FileHandler, [/home/flyerhzm/cgi-bin, {:FancyIndexing=true}]]
{% endhighlight %}

3\. 定义Servlet路径

{% highlight ruby %}
class GreetingServlet  WEBrick::HTTPServlet::AbstractServlet
  def do_GET(req, resp)
    if req.query['name']
      resp.body = #{@options[0]} #{req.query['name']}. #{@options[1]}
      raise WEBrick::HTTPStatus::OK
    else
      raise WEBrick::HTTPStatus::PreconditionFailed.new(missing attribute: 'name')
    end
  end
  alias do_POST do_GET
end
server.mount('/greet', GreetingServlet, 'Hi', 'Are you having a nice day?')
{% endhighlight %}

当path为'/greet'时，由GreetingServlet来处理，选项options = ['Hi', 'Are you having a nice day?']，其对应到MountTable的@tab为

{% highlight ruby %}
"/greet"=>[GreetingServlet, ["Hi", "Are you having a nice day?"]]
{% endhighlight %}

4\. webrick还可以mount一个proc

{% highlight ruby %}
server.mount_proc('/myblock') {|req, resp|
  resp.body = a block mounted at #{req.script_name}
}
{% endhighlight %}

当path为'/myblock'时，执行这个proc，其对应到MountTable的@tab为

{% highlight ruby %}
"/myproc"=>[#WEBrick::HTTPServlet::ProcHandler:0x5ce54 @proc=#Proc:0x00026c8c@webrick_test.rb:18>>, []]
{% endhighlight %}

接下来，让我们看看webrick是如何执行mount操作的

在httpserver初始化的时候，执行

{% highlight ruby %}
@mount_tab = MountTable.new
if @config[:DocumentRoot]
  mount(/, HTTPServlet::FileHandler, @config[:DocumentRoot],
        @config[:DocumentRootOptions])
end
{% endhighlight %}

初始化MountTable，同时检查DocumentRoot参数是否设置，如果设置的话，就mount到根目录

mount, mount_proc和unmount方法定义如下

{% highlight ruby %}
def mount(dir, servlet, *options)
  @logger.debug(sprintf(%s is mounted on %s., servlet.inspect, dir))
  @mount_tab[dir] = [ servlet, options ]
end

def mount_proc(dir, proc=nil, block)
  proc ||= block
  raise HTTPServerError, must pass a proc or block unless proc
  mount(dir, HTTPServlet::ProcHandler.new(proc))
end

def unmount(dir)
  @logger.debug(sprintf(unmount %s., dir))
  @mount_tab.delete(dir)
end
alias umount unmount
{% endhighlight %}

非常简单，只是调用MountTable提供的方法。

然后来看看webrick是如何根据url来找到相应的servlet。其关键是search_servlet方法

{% highlight ruby %}
def search_servlet(path)
  script_name, path_info = @mount_tab.scan(path)
  servlet, options = @mount_tab[script_name]
  if servlet
    [ servlet, options, script_name, path_info ]
  end
end
{% endhighlight %}

参数path就是request的path，经过MountTable#scan解析，分解为script_name和path_info，而通过script_name就能从MountTable中获取servlet类型和选项，WEBrick再根据这个servlet类型和选项，实例化一个servlet，执行用户请求。

