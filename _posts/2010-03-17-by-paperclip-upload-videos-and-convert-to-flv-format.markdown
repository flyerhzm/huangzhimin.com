---
layout: post
title: 通过paperclip上传视频并转换为flv格式
categories:
- Rails
---
paperclip作为一个非常流行的文件上传的rails插件，最常被应用的就是上传图片，裁剪，格式转换等等，网上的demo也是一大堆，但是介绍视频上传的却很少。其实paperclip的处理模块定义非常清晰，可以很方便的实现视频的格式转换。

我们的案例是这样的：用户上传任何视频文件，我们都将其转换为flv格式，然后再显示在网页上。

首先，安装ffmpeg，所有的转换工作都是使用ffmpeg命令来执行的。安装文档网上有很多，这里就不重复了。不过我在mac下面用port安装之后，转换视频的时候总是报Audio encoding failed错误，需要将ffmpeg依赖的lame降版本到3.97_0。另外你需要安装paperclip插件。

接着，新建/lib/paperclip_processors目录，同时在该目录下新建flash.rb文件

{% highlight ruby %}
module Paperclip
  class Flash  Processor

    attr_accessor :geometry, :file, :whiny

    def initialize(file, options = {}, attachment = nil)
      super
      @file = file
      unless options[:geometry].nil? || (@geometry = Geometry.parse(options[:geometry])).nil?
        @geometry.width = (@geometry.width / 2.0).floor * 2.0
        @geometry.height = (@geometry.height / 2.0).floor * 2.0
        @geometry.modifier = ''
      end
      @whiny = options[:whiny].nil? ? true : options[:whiny]
      @basename = File.basename(file.path, File.extname(file.path))
      data = attachment
    end

    def make
      src = @file
      flv = Tempfile.new([ @basename, 'flv' ].compact.join(.))
      flv.close

      command = %Q[-i #{File.expand_path(src.path)} -y ]
      command  -s #{geometry.to_s}  unless geometry.nil?
      command  %Q[#{File.expand_path(flv.path)}]

      begin
        success = Paperclip.run('ffmpeg', command)
      rescue PaperclipCommandLineError
        raise PaperclipError, There was an error processing the thumbnail for #{@basename} if whiny
      end

      flv
    end
  end
end
{% endhighlight %}

注意，一定要放在lib/paperclip_processors目录下面，这样paperclip才能找到这个视频转换的处理器。

然后，在model中声明使用视频转换处理器，并定义尺寸

{% highlight ruby %}
class Video < ActiveRecord::Base
  has_attached_file :attachment, :styles = {
    :medium = {:geometry = 400x300, :format = flv, :processors = [:flash]},
    :large = {:geometry = 800x600, :format = flv, :processors = [:flash]}
  }
end
{% endhighlight %}

这样，当用户上传一个test.avi文件时，你会在服务器的上传目录下面找到test_original.avi, test_medium.flv和test_large.flv三个文件。

最后，在播放视频的时候，只需要把视频的url传给相应的flash播放器（player.swf）即可

{% highlight ruby %}
video.attachment.url(:medium)
{% endhighlight %}



注：paperclip升级到2.3.3之后，command参数的写法需要修改为

{% highlight ruby %}
options = [
  -i,
  File.expand_path(src.path),
  -y,
  -ar,
  22050,
  -b,
  1200K,
  File.expand_path(flv.path)
].flatten.compact

success = Paperclip.run('ffmpeg', *options)
{% endhighlight %}





