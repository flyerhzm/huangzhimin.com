---
layout: post
title: Use paperclip without activerecord
categories:
- ruby
- paperclip
---

Recently I built an image upload api which didn't use activerecord, but
I don't want to handle resizing image thumbnails by myself, so I decided
to reuse [paperclip][1].

Paperclip is an easy file attachment management for ActiveRecord, but we
used activemodel without activerecord, I found a [gist][2] which gave me
a simple solution, but it was not enough. We continued the hacking work.

1\. defined the attachment path and url. Paperclip used AR id partition
in default path, but activemodel don't have id attribute, so I have to
override the attachment path and url

{% highlight ruby %}
# config/initializers/paperclip.rb
Paperclip.interpolates :uuid_partition do |attachment, style|
  attachment.instance.uuid.scan(/.{1,8}/m).join("/")
end

# app/models/image.rb
has_attached_file :attachment,
  styles: { three_dot_five_inch: "640x960>", four_inch: "640x1136>" },
  path: ":rails_root/public/system/:attachment/:uuid_partition/:style/:filename",
  url: "/system/:attachment/:uuid_partition/:style/:filename"

def initialize
  @uuid = UUID.new.generate.gsub('-', '')
end
{% endhighlight %}

Instead of auto incremented id, I used uuid partition for attachment
path and url, because it's more scalable.

2\. run_callbacks during save, which will also trigger paperclip
callbacks

{% highlight ruby %}
define_model_callbacks :save, only: [:after]

def save
  run_callbacks :save do
  end
end
{% endhighlight %}

Then you can handle the attachment by activemodel and paperclip, I
pasted all code on gist [here][3].

[1]: https://github.com/thoughtbot/paperclip
[2]: https://gist.github.com/basgys/5712426
[3]: https://gist.github.com/flyerhzm/7289979
