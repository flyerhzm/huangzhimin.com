---
layout: post
title: paperclip和id_partition
categories:
- Rails
---
很多网站都允许用户上传文件，如何管理这些上传的文件呢？以paperclip为例，其默认文件布局结构为

{% highlight ruby %}
:url  => "/system/:attachment/:id/:style/:filename",
:path => ":rails_root/public:url",
{% endhighlight %}

每个id都会占据一个目录，问题是文件系统的子目录数量是有限制的，ext3是32k，ext4是64k，所以网站的数据量达到规模时，默认的文件布局并不合适。比较好的方式是采用id_partition，即把id表示成九位，并且分成3级目录，比如：

1 => 000/000/001

10000 => 000/010/000

100000000 => 100/000/000

这样就无须为文件系统的子目录数量限制担忧了。实现上同样以papaerclip为例，只需要修改其默认的配置参数

{% highlight ruby %}
Paperclip::Attachment.default_options.merge!(
  :path => ":rails_root/public/pictures/:class/:attachment/:id_partition/:basename_:style.:extension",
  :url => "/pictures/:class/:attachment/:id_partition/:basename_:style.:extension"
)
{% endhighlight %}

其中的:id_partition是paperclip内部支持的

