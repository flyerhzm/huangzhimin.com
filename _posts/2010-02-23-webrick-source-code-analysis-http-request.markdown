---
layout: post
title: webrick源码分析——http请求
categories:
- webrick
- Ruby
---
http服务器的主要工作就是解析http请求，然后返回http应答。http请求从socket读入，就是一段特定格式的字符串，下面是访问huangzhimn.com首页的http请求

{% highlight text %}
GET / HTTP/1.1\r\n
Host: www.huangzhimin.com\r\n
User-Agent: Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.5; en-US; rv:1.9.1.7) Gecko/20091221 Firefox/3.5.7\r\n
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\n
Accept-Language: en-us,en;q=0.5\r\n
Accept-Encoding: gzip,deflate\r\n
Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7\r\n
Keep-Alive: 300\r\n
Connection: keep-alive\r\n
\r\n
{% endhighlight %}

那么webrick是解析这段字符串的呢？之前在分析webrick主要流程的时候讲到，在http服务器从socket读取到数据时，立刻交给WEBrick::HTTPRequest类来解析，解析方法如下

{% highlight ruby %}
def parse(socket=nil)
  @socket = socket
  begin
    @peeraddr = socket.respond_to?(:peeraddr) ? socket.peeraddr : []
    @addr = socket.respond_to?(:addr) ? socket.addr : []
  rescue Errno::ENOTCONN
    raise HTTPStatus::EOFError
  end

  read_request_line(socket)
  if @http_version.major > 0
    read_header(socket)
    @header['cookie'].each{|cookie|
      @cookies += Cookie::parse(cookie)
    }
    @accept = HTTPUtils.parse_qvalues(self['accept'])
    @accept_charset = HTTPUtils.parse_qvalues(self['accept-charset'])
    @accept_encoding = HTTPUtils.parse_qvalues(self['accept-encoding'])
    @accept_language = HTTPUtils.parse_qvalues(self['accept-language'])
  end
  return if @request_method == "CONNECT"
  return if @unparsed_uri == "*"

  begin
    @request_uri = parse_uri(@unparsed_uri)
    @path = HTTPUtils::unescape(@request_uri.path)
    @path = HTTPUtils::normalize_path(@path)
    @host = @request_uri.host
    @port = @request_uri.port
    @query_string = @request_uri.query
    @script_name = ""
    @path_info = @path.dup
  rescue
    raise HTTPStatus::BadRequest, "bad URI `#{@unparsed_uri}'."
  end

  if /close/io =~ self["connection"]
    @keep_alive = false
  elsif /keep-alive/io =~ self["connection"]
    @keep_alive = true
  elsif @http_version < "1.1"
    @keep_alive = false
  else
    @keep_alive = true
  end
end
{% endhighlight %}

第3-8行，读取对方和自己的地址信息（host, port, id）

第10行，解析http请求的第一行数据，内容为“GET / HTTP/1.1\r\n”，具体解析方法如下

{% highlight ruby %}
def read_request_line(socket)
  @request_line = read_line(socket) if socket
  @request_time = Time.now
  raise HTTPStatus::EOFError unless @request_line
  if /^(\S+)\s+(\S+)(?:\s+HTTP\/(\d+\.\d+))?\r?\n/mo =~ @request_line
    @request_method = $1
    @unparsed_uri   = $2
    @http_version   = HTTPVersion.new($3 ? $3 : "0.9")
  else
    rl = @request_line.sub(/\x0d?\x0a\z/o, '')
    raise HTTPStatus::BadRequest, "bad Request-Line `#{rl}'."
  end
end
{% endhighlight %}

读取http请求的第一行，读取之后通过正则匹配获取@request_method为'GET'，@unparsed_url为'/'，@http_version为1.1

第11-20行，当http版本为1.0或1.1时，对http头部进行处理

首先，读取http头，读取方法如下：

{% highlight ruby %}
def read_header(socket)
  if socket
    while line = read_line(socket)
      break if /\A(#{CRLF}|#{LF})\z/om =~ line
      @raw_header  line
    end
  end
  begin
    @header = HTTPUtils::parse_header(@raw_header)
  rescue = ex
    raise  HTTPStatus::BadRequest, ex.message
  end
end
{% endhighlight %}

从socket一行一行地读取数据，直到一行为\r\n，并通过HTTPUTils::parse_header方法将字符串数组@raw_header转换为散列@header

接着，读取cookies，将cookie字符串解析为Cookie对象

然后是读取accept, accept-charset, accept-encoding, accept-language值，这些值都是多选的，比如Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\n，所以通过HTTPUtils::parse_qvalues解析出来的结果是一个数组，而且按照q值来排序

第21行，当request_method为CONNECT时（用于http代理，http1.1协议新增的），不再继续

第25行，将字符串@unparsed_uri转换成正规的URI实例@parsed_uri

第26-30行，通过@parsed_uri获取@path, @host, @port和@query_string

最后，第37-45行，设置keep-alive值。


WEBrick::HTTPRequest类另外一个重要的方法是body

{% highlight ruby %}
def body()
  block ||= Proc.new{|chunk| @body  chunk }
  read_body(@socket, block)
  @body.empty? ? nil : @body
end
{% endhighlight %}

{% highlight ruby %}
def read_body(socket, block)
  return unless socket
  if tc = self['transfer-encoding']
    case tc
    when /chunked/io then read_chunked(socket, block)
    else raise HTTPStatus::NotImplemented, Transfer-Encoding: #{tc}.
    end
  elsif self['content-length'] || @remaining_size
    @remaining_size ||= self['content-length'].to_i
    while @remaining_size  0
      sz = BUFSIZE  @remaining_size ? BUFSIZE : @remaining_size
      break unless buf = read_data(socket, sz)
      @remaining_size -= buf.size
      block.call(buf)
    end
    if @remaining_size  0  @socket.eof?
      raise HTTPStatus::BadRequest, invalid body size.
    end
  elsif BODY_CONTAINABLE_METHODS.member?(@request_method)
    raise HTTPStatus::LengthRequired
  end
  return @body
end
{% endhighlight %}

如果http body为空，则返回nil

http body分为两种，一种是数据一次性全部传入，另一种是一段一段分批传输(chunked)。

第8-18行就是处理一次性全部传入的数据，根据header中content-length来读取指定长度的数据。

第3-7行读取chunked分段数据，读取方法为

{% highlight ruby %}
def read_chunked(socket, block)
  chunk_size, = read_chunk_size(socket)
  while chunk_size  0
    data =
    while data.size  chunk_size
      tmp = read_data(socket, chunk_size-data.size) # read chunk-data
      break unless tmp
      data  tmp
    end
    if data.nil? || data.size != chunk_size
      raise BadRequest, bad chunk data size.
    end
    read_line(socket)                    # skip CRLF
    block.call(data)
    chunk_size, = read_chunk_size(socket)
  end
  read_header(socket)                    # trailer + CRLF
  @header.delete(transfer-encoding)
  @remaining_size = 0
end
{% endhighlight %}

chunked分段数据，第一行表明这一段数据的长度，用十六进制表示，第二行开始为需要读取的分段数据。所以读取chunked数据就是读一行chunk_size，读一行chunk data，直到读完为止。



最后看看WEBrick::HTTPRequest的meta方法，对CGI的理解很有帮助

{% highlight ruby %}
def meta_vars
  # This method provides the metavariables defined by the revision 3
  # of ``The WWW Common Gateway Interface Version 1.1''.
  # (http://Web.Golux.Com/coar/cgi/)

  meta = Hash.new

  cl = self[Content-Length]
  ct = self[Content-Type]
  meta[CONTENT_LENGTH]    = cl if cl.to_i  0
  meta[CONTENT_TYPE]      = ct.dup if ct
  meta[GATEWAY_INTERFACE] = CGI/1.1
  meta[PATH_INFO]         = @path_info ? @path_info.dup :
 #meta[PATH_TRANSLATED]   = nil      # no plan to be provided
  meta[QUERY_STRING]      = @query_string ? @query_string.dup :
  meta[REMOTE_ADDR]       = @peeraddr[3]
  meta[REMOTE_HOST]       = @peeraddr[2]
 #meta[REMOTE_IDENT]      = nil      # no plan to be provided
  meta[REMOTE_USER]       = @user
  meta[REQUEST_METHOD]    = @request_method.dup
  meta[REQUEST_URI]       = @request_uri.to_s
  meta[SCRIPT_NAME]       = @script_name.dup
  meta[SERVER_NAME]       = @host
  meta[SERVER_PORT]       = @port.to_s
  meta[SERVER_PROTOCOL]   = HTTP/ + @config[:HTTPVersion].to_s
  meta[SERVER_SOFTWARE]   = @config[:ServerSoftware].dup

  self.each{|key, val|
    next if /^content-type$/i =~ key
    next if /^content-length$/i =~ key
    name = HTTP_ + key
    name.gsub!(/-/o, _)
    name.upcase!
    meta[name] = val
  }

  meta
end
{% endhighlight %}

