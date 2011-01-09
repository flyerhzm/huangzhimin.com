---
layout: post
title: webrick源码分析──主要流程
categories:
- webrick
- Ruby
---
webrick作为ruby自带的一个http server，很适合拿来作为学习之用。首先来看看最简单的使用webrick的示例吧

{% highlight ruby %}
require 'webrick'

server = WEBrick::HTTPServer.new({:Port => 3000, :DocumentRoot => '/home/flyerhzm/public_html'})

['INT', 'TERM'].each { |signal|
   trap(signal) { server.shutdown }
}

server.start
{% endhighlight %}

这段代码主要是定义了http服务器监听3000端口，根目录在/home/flyerhzm/public_html下，在接收INT或TERM信号时，关闭服务器，然后启动服务器。

我们分两部分来看，首先看看服务器初始化时做了些什么

{% highlight ruby %}
class GenericServer
  attr_reader :status, :config, :logger, :tokens, :listeners

  def initialize(config={}, default=Config::General)
    @config = default.dup.update(config)
    @status = :Stop
    @config[:Logger] ||= Log::new
    @logger = @config[:Logger]

    @tokens = SizedQueue.new(@config[:MaxClients])
    @config[:MaxClients].times{ @tokens.push(nil) }

    webrickv = WEBrick::VERSION
    rubyv = #{RUBY_VERSION} (#{RUBY_RELEASE_DATE}) [#{RUBY_PLATFORM}]
    @logger.info(WEBrick #{webrickv})
    @logger.info(ruby #{rubyv})

    @listeners = []
    unless @config[:DoNotListen]
      if @config[:Listen]
        warn(:Listen option is deprecated; use GenericServer#listen)
      end
      listen(@config[:BindAddress], @config[:Port])
      if @config[:Port] == 0
        @config[:Port] = @listeners[0].addr[1]
      end
    end
  end
end

class HTTPServer  ::WEBrick::GenericServer
  def initialize(config={}, default=Config::HTTP)
    super
    @http_version = HTTPVersion::convert(@config[:HTTPVersion])

    @mount_tab = MountTable.new
    if @config[:DocumentRoot]
      mount(/, HTTPServlet::FileHandler, @config[:DocumentRoot],
            @config[:DocumentRootOptions])
    end

    unless @config[:AccessLog]
      @config[:AccessLog] = [
        [ $stderr, AccessLog::COMMON_LOG_FORMAT ],
        [ $stderr, AccessLog::REFERER_LOG_FORMAT ]
      ]
    end

    @virtual_hosts = Array.new
  end
end
{% endhighlight %}

WEBrick::HTTPServer继承自WEBrick::GenericServer

WEBrick::GenericServer初始化时

首先记录所有的配置信息，预定义的WEBrick::Config::HTTP和用户定义的配置信息，包括监听端口，请求超时时间，文档根目录等等。

接着生成一个定长的队列SizedQueue，用来控制最大的客户端连接数。注意这里的SizedQueue放入的并不是一个线程，而是nil。

然后打印当前的WEBrick版本号和Ruby版本号。

最后调用listen方法，生成TCPServer，监听端口。这里可能生成两个TCPServer，一个是IPv4的，一个是IPv6的。

WEBrick::HTTPServer初始化时主要是定义了http版本号，根据配置信息mount根目录，这里将http://localhost/映射到/home/flyerhzm/public_html/目录，默认DirectoryIndex为[index.html,index.htm,index.cgi,index.rhtml]，即请求为目录时，显示目录下的index.html, index.htm, index.cgi或者index.rhtml，DocumentRootOptions为{ :FancyIndexing = true }，即请求为目录且目录下没有DirectoryIndex定义的文件时，显示目录下的所有文件。这些都是在WEBrick::HTTPServlet::FileHandler中定义的，我会在之后的文章介绍。

介绍完初始化，下面来看看start方法是如何实现的

{% highlight ruby %}
def start()
  raise ServerError, already started. if @status != :Stop
  server_type = @config[:ServerType] || SimpleServer

  server_type.start{
    @logger.info \
      #{self.class}#start: pid=#{$} port=#{@config[:Port]}
    call_callback(:StartCallback)

    thgroup = ThreadGroup.new
    @status = :Running
    while @status == :Running
      begin
        if svrs = IO.select(@listeners, nil, nil, 2.0)
          svrs[0].each{|svr|
            @tokens.pop          # blocks while no token is there.
            if sock = accept_client(svr)
              th = start_thread(sock, block)
              th[:WEBrickThread] = true
              thgroup.add(th)
            else
              @tokens.push(nil)
            end
          }
        end
      rescue Errno::EBADF, IOError = ex
        # if the listening socket was closed in GenericServer#shutdown,
        # IO::select raise it.
      rescue Exception = ex
        msg = #{ex.class}: #{ex.message}\n\t#{ex.backtrace[0]}
        @logger.error msg
      end
    end

    @logger.info going to shutdown ...
    thgroup.list.each{|th| th.join if th[:WEBrickThread] }
    call_callback(:StopCallback)
    @logger.info #{self.class}#start done.
    @status = :Stop
  }
end
{% endhighlight %}

首先，根据不同的ServerType执行不同的start方法，定义有SimpleServer和Daemon两种，Daemon方式会在以后的文章中介绍，默认为SimpleServer

{% highlight ruby %}
class SimpleServer
  def SimpleServer.start
    yield
  end
end
{% endhighlight %}

非常简单，就是直接执行传过来的block

在这个block中生成一个线程组，用来存放处理http请求的线程。

IO.select(@listeners, nil, nil, 2.0)方法监听@listeners(就是tcp server)，一旦有数据进入就返回，并设置2秒超时，防止进程被挂死。

对于客户端连接的socket请求，创建一个新的线程来处理，并把这个线程放入线程组中。这里用了一个小技巧来控制线程组中线程的数量。一般我们是将线程插入到SizedQueue来控制线程的数量，而这里SizedQueue插入满nil，每次创建一个线程之前，先从SizedQueue pop一个nil，每次线程处理完在push一个nil，这样，当创建了一定数量的线程时，SizedQueue就为空，无法再pop数据，只有等待一个线程处理完后才能继续。

接着先来看看如何关闭服务器。webrick提供了两种方法：

{% highlight ruby %}
def stop
  if @status == :Running
    @status = :Shutdown
  end
end
{% endhighlight %}

一是stop，它只是简单地将服务器的状态由Running改为Shutdown，这样就可以从start方法中的循环跳出来，不过由于start方法最后有这么一句话：thgroup.list.each{|th| th.join if th[:WEBrickThread] }，这表示服务器并不会马上关闭，它会等到线程组中所有的线程都执行完毕之后再关闭。

{% highlight ruby %}
def shutdown
  stop
  @listeners.each{|s|
    if @logger.debug?
      addr = s.addr
      @logger.debug(close TCPSocket(#{addr[2]}, #{addr[1]}))
    end
    s.close
  }
  @listeners.clear
end
{% endhighlight %}

二是shutdown，它首先执行stop方法，然后遍历所有的sockets并关闭，这样所有的线程都会买上结束，服务器也会马上停止。

再来看看每个线程都做了些什么

{% highlight ruby %}
def start_thread(sock, )
  Thread.start{
    begin
      Thread.current[:WEBrickSocket] = sock
      begin
        addr = sock.peeraddr
        @logger.debug "accept: #{addr[3]}:#{addr[1]}"
      rescue SocketError
        @logger.debug "accept: address unknown>"
        raise
      end
      call_callback(:AcceptCallback, sock)
      block ? block.call(sock) : run(sock)
    rescue Errno::ENOTCONN
      @logger.debug "Errno::ENOTCONN raised"
    rescue ServerError => ex
      msg = "#{ex.class}: #{ex.message}\n\t#{ex.backtrace[0]}"
      @logger.error msg
    rescue Exception => ex
      @logger.error ex
    ensure
      @tokens.push(nil)
      Thread.current[:WEBrickSocket] = nil
      if addr
        @logger.debug "close: #{addr[3]}:#{addr[1]}"
      else
        @logger.debug "close: address unknown>"
      end
      sock.close
    end
  }
end

{% endhighlight %}

如果传入一个block，就执行这个block，不然就执行run方法，run方法的定义在WEBrick::HTTPServer下

{% highlight ruby %}
def run(sock)
  while true 
    res = HTTPResponse.new(@config)
    req = HTTPRequest.new(@config)
    server = self
    begin
      timeout = @config[:RequestTimeout]
      while timeout  0
        break if IO.select([sock], nil, nil, 0.5)
        timeout = 0 if @status != :Running
        timeout -= 0.5
      end
      raise HTTPStatus::EOFError if timeout = 0 || sock.eof?
      req.parse(sock)
      res.request_method = req.request_method
      res.request_uri = req.request_uri
      res.request_http_version = req.http_version
      res.keep_alive = req.keep_alive?
      server = lookup_server(req) || self
      if callback = server[:RequestCallback] || server[:RequestHandler]
        callback.call(req, res)
      end
      server.service(req, res)
    rescue HTTPStatus::EOFError, HTTPStatus::RequestTimeout = ex
      res.set_error(ex)
    rescue HTTPStatus::Error = ex
      @logger.error(ex.message)
      res.set_error(ex)
    rescue HTTPStatus::Status = ex
      res.status = ex.code
    rescue StandardError = ex
      @logger.error(ex)
      res.set_error(ex, true)
    ensure
      if req.request_line
        req.fixup()
        res.send_response(sock)
        server.access_log(@config, req, res)
      end
    end
    break if @http_version  1.1
    break unless req.keep_alive?
    break unless res.keep_alive?
  end
end

{% endhighlight %}

run方法中，首先，根据配置信息实例化HTTPResponse和HTTPRequest，在设置的timeout之内读取socket数据，不然停止执行。request对象读取socket数据并根据HTTP协议进行解析（关于http请求和应答的解析将在后文进行介绍），将部分内容（request_method, request_uri等等）赋值给response对象。调用service方法，根据request进行操作，并返回相应的response。最后，通过socket将response发送给客户端。需要注意的是，如果http版本是1.1而且keep_alive为true的话，run方法的循环将一直执行，来保持与客户端的长连接。

最后看看service方法的代码

{% highlight ruby %}
def service(req, res)
  if req.unparsed_uri == *
    if req.request_method == OPTIONS
      do_OPTIONS(req, res)
      raise HTTPStatus::OK
    end
    raise HTTPStatus::NotFound, `#{req.unparsed_uri}' not found.
  end

  servlet, options, script_name, path_info = search_servlet(req.path)
  raise HTTPStatus::NotFound, `#{req.path}' not found. unless servlet
  req.script_name = script_name
  req.path_info = path_info
  si = servlet.get_instance(self, *options)
  @logger.debug(format(%s is invoked., si.class.name))
  si.service(req, res)
end

{% endhighlight %}

对于OPTIONS请求是需要特殊处理，返回可以处理的请求（GET, HEAD, POST, OPTIONS），根据请求的path返回相应的servlet，options, script_name和path_info，并获取到servlet实例（一般是用户定义的Servlet类，WEBrick默认有FileHandler, CGIHandler和ProcHandler），然后由具体的servlet实例来处理http请求。

这就是WEBrick的主要流程，写得比较乱，之后的文章根据WEBrick的功能一部分一部分详细介绍。



