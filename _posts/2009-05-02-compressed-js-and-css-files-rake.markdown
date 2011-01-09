---
layout: post
title: 压缩js和css文件的rake
categories:
- Rails
---
对于Web应用来说，一个页面的HTTP请求数越多，往往导致页面加载的时间越长，服务器的负担也越重。对于每个HTTP请求，都要进行握手，客户端说hello，服务器端也说hello，然后再传输内容，所以要尽量减少请求的数量。

页面的HTTP请求，除了html本身之外，还有javascript、css和images。其中images可以通过css sprite来解决，而javascript和css则可以通过压缩合并，来减少HTTP的请求。

今天写了一个rake，来压缩js和css，是基于yui compressor的。

首先下载yui compressor，将jar文件copy到lib目录下，当然因为yui compressor是基于java的，所以你要先配好java的环境。

然后就是写rake文件

{% highlight ruby %}
namespace :minifier do
  def minify(input_files, output_file)
    if input_files.class == String
      `java -jar lib/yuicompressor-2.4.2.jar #{input_files} -o #{output_file}`
    else
      input_files.each do |input_file|
        `java -jar lib/yuicompressor-2.4.2.jar #{input_file} -o #{input_file}_min`
      end
      `rm #{output_file}`
      `cat #{input_files.collect{|file| file + '_min'}.join(' ')}  #{output_file}`
      input_files.each do |input_file|
        `rm #{input_file}_min`
      end
    end
  end

  desc minify
  task :minify = [:minify_js, :minify_css]

  desc minify javascript
  task :minify_js do
    minify(FileList[
                      'public/javascripts/jquery.js',
                      'public/javascripts/jquery-ui.js',
                      'public/javascripts/jrails.js',
                      'public/javascripts/application.js'
                    ],
           'public/javascripts/all.js')
  end

  desc minify css
  task :minify_css do
    FileList['public/stylesheets/**/*.css'].each do |file|
      minify(file, file)
    end
  end

end
{% endhighlight %}

我是将所有的js文件都压缩然后合并成一个all.js文件，对于css，由于我是使用haml的sass，已经通过@import将css合并了，所以只需对每个css进行压缩即可。

运行rake：

{% highlight bash %}
rake minifier:minify
{% endhighlight %}

你会看到一个很小的all.js文件，所有的css文件大小也都减少了很多。

最后你需要修改js的include方式，如果是production环境的，就只需include一个all.js文件即可

{% highlight ruby %}
- if RAILS_ENV == 'production'
  = javascript_include_tag 'all'
- else
  = javascript_include_tag 'jquery'
  = javascript_include_tag 'jquery-ui'
  = javascript_include_tag 'jrails'
  = javascript_include_tag 'application'
{% endhighlight %}

这下每个页面都基本只有一个js和一个css的HTTP请求了

