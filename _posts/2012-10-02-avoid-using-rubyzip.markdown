---
layout: post
title: avoid using rubyzip
categories:
- ruby
- performance
---
**More precisely I want to say allocating as less objects as you can,
rubyzip is just an example.**

We have a background job compressing webui assets, uploading to S3, so
mobile sdk can download assets to update webui dynamically.

After iphone5 and ios6 came to the market, we received much more webui
requests than before, it was expected, but our background job couldn't
consume so much asynchronous messages. We could easily scale out by adding
more background job servers, but I decided diving deeply into webui job to
see if I could speed it up and increase throughput.

Thank newrelic for providing great monitoring service, I saw the webui
job took averagely 725ms to complete a webui job, and 80% time was taken
by GC calls, WTF. Instead of blaming ruby gc, I blamed our bad code.

I noticed that we used [rubyzip][0] to compress webui assets, it was the
root reason to cause so much GC.

{% highlight ruby %}
def create(path, files)
  Zip::ZipFile.open(path, Zip::ZipFile::CREATE) do |z|
    files.each do |file|
      source_path = "#{Rails.root}/public/webui/#{file}"
      expand_dirs(file).each do |dir|
        begin
          z.mkdir dir
        rescue Errno::EEXIST
        end
      end
      z.add file, source_path
    end
  end
end
{% endhighlight %}

It sucks, all files are reading and compressing in ruby VM, too many
objects are allocated, then cause several GC calls. So I tried to use
shell zip command instead of rubyzip.

I did an experiment between rubyzip and shell zip. The followings are
code examples.

{% highlight ruby %}
require 'zip/zip'
GC::Profiler.enable
before_stats = ObjectSpace.count_objects
start = Time.now
Zip::ZipFile.open("test.zip", Zip::ZipFile::CREATE) do |z|
  Dir["**/*"].each do |file|
    z.add file, file
  end
end
puts "Total time: #{Time.now - start}"
after_stats = ObjectSpace.count_objects
puts "[GC Stats] #{before_stats[:FREE] - after_stats[:FREE]} new allocated objects."

# Total time: 0.75344
# [GC Stats] 718691 new allocated objects.
{% endhighlight %}

{% highlight ruby %}
GC::Profiler.enable
before_stats = ObjectSpace.count_objects
start = Time.now
files = Dir["**/*"].map { |file| file unless File.directory?(file) }
`zip test.zip #{files.join(" ")}`
puts "Total time: #{Time.now - start}"
after_stats = ObjectSpace.count_objects
puts "[GC Stats] #{before_stats[:FREE] - after_stats[:FREE]} new
allocated objects."

# Total time: 0.349816
# [GC Stats] 2269 new allocated objects.
{% endhighlight %}

As you can see, rubyzip allocates > 700k objects for reading and
compressing, and it also takes more than double time to finish the
script, shell zip command is a much better solution. So I replaced
rubyzip with shell zip in our product.

{% highlight ruby %}
def create(path, files)
  `cd #{Rails.root}/public/webui && zip #{path} #{files.join(' ')}`
end
{% endhighlight %}

After deploying to background job server, I see a big performance
improved, it takes only 218ms for webui job to finish, and only 28%
time is taken by GC calls. The throughput is also increased from 44cpm
to 64cpm, and it can keep up with the webui asyncrhonous messages, we
don't need to add more servers, money saved. :-)

So keep in mind, allocating less objects means less GC calls, also means
better performance.

**Updated**: [zip_ruby][1] gem gives a similar speed of shell zip command.

{% highlight ruby %}
require 'zipruby'
GC::Profiler.enable
before_stats = ObjectSpace.count_objects
start = Time.now
Zip::Archive.open("test.zip", Zip::CREATE) do |z|
  Dir["**/*"].each do |file|
    z.add_file file, file
  end
end
puts "Total time: #{Time.now - start}"
after_stats = ObjectSpace.count_objects
puts "[GC Stats] #{before_stats[:FREE] - after_stats[:FREE]} new allocated objects."

# Total time: 0.367729
# [GC Stats] 1116 new allocated objects.
{% endhighlight %}

[0]: https://rubygems.org/gems/rubyzip
[1]: https://rubygems.org/gems/zipruby
