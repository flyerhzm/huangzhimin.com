---
layout: post
title: ruby gserver源码阅读
categories:
- Ruby
---
gserver作为通用服务器的实现，最关键的就是start方法

{% highlight ruby %}
def start(maxConnections = -1)
  raise "running" if !stopped?
  @shutdown = false
  @maxConnections = maxConnections if maxConnections > 0
  @@servicesMutex.synchronize  {
    if GServer.in_service?(@port,@host)
      raise "Port already in use: #{host}:#{@port}!"
    end
    @tcpServer = TCPServer.new(@host,@port)
    @port = @tcpServer.addr[1]
    @@services[@host] = {} unless @@services.has_key?(@host)
    @@services[@host][@port] = self;
  }
  @tcpServerThread = Thread.new {
    begin
      starting if @audit
      while !@shutdown
        @connectionsMutex.synchronize  {
           while @connections.size >= @maxConnections
             @connectionsCV.wait(@connectionsMutex)
           end
        }
        client = @tcpServer.accept
        @connections << Thread.new(client)  { |myClient|
          begin
            myPort = myClient.peeraddr[1]
            serve(myClient) if !@audit or connecting(myClient)
          rescue => detail
            error(detail) if @debug
          ensure
            begin
              myClient.close
            rescue
            end
            @connectionsMutex.synchronize {
              @connections.delete(Thread.current)
              @connectionsCV.signal
            }
            disconnecting(myPort) if @audit
          end
        }
      end
    rescue => detail
      error(detail) if @debug
    ensure
      begin
        @tcpServer.close
      rescue
      end
      if @shutdown
        @connectionsMutex.synchronize  {
           while @connections.size > 0
             @connectionsCV.wait(@connectionsMutex)
           end
        }
      else
        @connections.each { |c| c.raise "stop" }
      end
      @tcpServerThread = nil
      @@servicesMutex.synchronize  {
        @@services[@host].delete(@port)
      }
      stopping if @audit
    end
  }
  self
end
{% endhighlight %}

第5-13行检查host的port是否被占用，如果没有的话，则根据host和port实例化TCPServer，并通过@@services[@host][@port]记录。

第14-65行将服务器的服务交由一个单独的线程处理，这样当当前进程退出的时候，该线程也会被强制退出。

第18-22行和第35-38行是用来管理线程池的，当要加入一个新的线程之前，检查当前的线程数量，如果达到线程数最大值，则挂起当前线程；当删除一个线程时，通知某个被挂起的线程继续执行。

第23-41行是一个tcp服务的全过程，获取client的连接，启动一个线程来处理当前的连接，执行serve方法，最终关闭当前的连接。

第46-63行是tcp服务器关闭时执行的过程，服务器关闭有两种方法：

 一是shutdown，tcp服务器会等待所有的线程都执行完毕再关闭

 二是close，tcp服务器会中断所有的线程，强制关闭

其它的方法，如shutdown, close都写得很简单，不再一一叙述。

