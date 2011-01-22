---
layout: post
title: Migrate Custom Blog to Jekyll and Disqus
categories:
- jekyll
- disqus
---
I wrote my blog system by myself about 3 years ago, using rails. It's good, but not cool enough, I just need some changes to make my blog better. After googling, I found jekyll, which is a simple, blog aware, static site generator, that means no databases and much less resources wanted, sounds great.

Build a Blog by Jekyll
----------------------

Then I began to build the new blog system by jekyll two weeks ago. It's really easy to install and use, check the document [here][1]. As you know, I'm a developer, of course I install the pygments for code highlight. But there are several limitations for the default jekyll.

1. no category section on sidebar.
2. no archive section on sidebar.
3. no categroy page, which lists the posts in that category.
4. no monthly archive page, which list posts by month.
5. no comments, yep, it generates a static website.
6. <strike>can't display liquid codes on post.</strike>(Use literal tag to display liquid codes)

Like rails, jekyll supports plugins and extensions so that we can extend it as we want. Originally I planed to host my blog on github, but I found github doesn't support any plugins and extensions, it only supports the default official jekyll. Bad news, I have to host it on my own server with jekyll extensions, it's not a big problem.

The best extesion of jekyll I found is [jekyll_ext][2], it provides a really flexible way to extend jekyll. The author also shares his jekyll [extensions][3] using jekyll_ext. I forked the [extensions][4] to fix the generation of archive page and add the archive section on sidebar.

OK, let me show how to fix the above limitation with my forked extension.

1\. category section on sidebar.

{% highlight html %}
{% literal %}
<ul>
  {% for category in site.categories %}
  <li><a href="/categories/{{category | first}}">{{category | first}} ({{category | last | size }})</a></li>
  {% endfor %}
</ul>
{% endliteral %}
{% endhighlight %}

2\. archive section on sidebar.

{% highlight html %}
{% literal %}
<ul>
  {% for monthly_archive in site.monthly_archives reversed %}
  <li>
    <a href="{{ site.baseurl }}/{{ monthly_archive.url }}">{{ monthly_archive.name }}</a> ({{ monthly_archive.posts | size }} posts)
  </li>
  {% endfor %}
</ul>
{% endliteral %}
{% endhighlight %}

3\. category page, add a layout `category_index.html`

{% highlight html %}
{% literal %}
---
layout: default
---

<h1 class="page-title">
  Category Archives:
  <a href="/categories/{{page.category}}">{{page.category}}</a>
</h1>
<ol class="archive">
{% for post in site.categories[page.category] %}
  <li>
    <div class="excerpt">
      <strong class="entry-title">
        <a href="{{ post.url }}" title="{{ post.title }}" rel="bookmark">{{ post.title }}</a>
      </strong>
      <span class="date small">
        <abbr class="published" title="{{ post.date }}">{{ post.date | date_to_string }}</abbr>
      </span>
      <p class="alt-font">
        Posted in&nbsp;
        {% for category in post.categories %}
        <a href="/categories/{{ category }}" title="{{ category }}" rel="category tag">{{ category }}</a>
        {% endfor %}
      </p>
      <p class="comments-link">
        <a href='{{post.url}}#disqus_thread'>Comments</a>
      </p>
    </div>
  </li>
{% endfor %}
</ol>
{% endliteral %}
{% endhighlight %}

4\. monthly archive page, add a layout `archive_monthly.html`

{% highlight html %}
{% literal %}
---
layout: default
---

<h1>{{ page.month | to_month }} {{ page.year }}</h1>
<ol class="archive">
  {% for d in (1..31) reversed %}
    {% if site.collated_posts[page.year][page.month][d] %}
      {% for post in site.collated_posts[page.year][page.month][d] reversed %}
      <li>
        <div class="excerpt">
          <strong class="entry-title">
            <a href="{{ post.url }}" title="{{ post.title }}" rel="bookmark">{{ post.title }}</a>
          </strong>
          <span class="date small">
            <abbr class="published" title="{{ post.date }}">{{ post.date | date_to_string }}</abbr>
          </span>
          <p class="alt-font">
            Posted in&nbsp;
            {% for category in post.categories %}
            <a href="/categories/{{ category }}" title="{{ category }}" rel="category tag">{{ category }}</a>
            {% endfor %}
          </p>
          <p class="comments-link">
            <a href='{{post.url}}#disqus_thread'>Comments</a>
          </p>
        </div>
      </li>
      {% endfor %}
    {% endif %}
  {% endfor %}
</ol>
{% endliteral %}
{% endhighlight %}

5\. comments, hmmm...it's impossible for jekyll to provide comments functionality, but I guess you know the web service [disqus][4] which provides an online comment system. You can get two javascripts after you creating an forum on disqus, one for posting/displaying comments, the other is to dispaly comments count for each post. The following is the javascript to post/display comments.

{% highlight html %}
<div id="disqus_thread"></div>
<script type="text/javascript">
  var disqus_shortname = 'richard-huang';

  var disqus_url = "http://www.huangzhimin.com{{page.url}}";

  (function() {
      var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
      dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
  })();
</script>
<noscript>Please enable JavaScript to view the <a href="http://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
<a href="http://disqus.com" class="dsq-brlink">blog comments powered by <span class="logo-disqus">Disqus</span></a>
{% endhighlight %}

And the javascript to display comments count.

{% highlight html %}
<script type="text/javascript">
  var disqus_shortname = 'richard-huang';

  (function () {
    var s = document.createElement('script'); s.async = true;
    s.type = 'text/javascript';
    s.src = 'http://' + disqus_shortname + '.disqus.com/count.js';
    (document.getElementsByTagName('HEAD')[0] || document.getElementsByTagName('BODY')[0]).appendChild(s);
  }());
</script>
{% endhighlight %}

<strike>
6\. can't display liquid codes. I found this limitation while I'm writing this post, it's impossible to display raw liquid codes, as liquid always try to execute each liquid code. I have to write a custom tag raw to solve this issue.

{% highlight ruby %}
module Jekyll
  class Raw < Liquid::Block

    def parse(tokens)
      @nodelist ||= []
      @nodelist.clear

      while token = tokens.shift
        case token
        when IsTag
          if token =~ FullToken
            if block_delimiter == $1
              end_tag
              return
            end
            @nodelist << token
          else
            raise SyntaxError, "Tag '#{token}' was not properly terminated with regexp: #{TagEnd.inspect} "
          end
        else
          @nodelist << token
        end
      end

      # Make sure that its ok to end parsing in the current block.
      # Effectively this method will throw and exception unless the current block is
      # of type Document
      assert_missing_delimitation!
    end
  end
end

Liquid::Template.register_tag('raw', Jekyll::Raw)
{% endhighlight %}

So you can use the raw tag to escape all the liquid codes as you want.
</strike>

**You can get the source code of my blog system on [github][7].**

Migrate Legacy Data
-------------------

OK, the new blog system is complete, but what about the old blog posts
and comments? I want to migrate them to the new system.

I'm a developer, so it's not too difficult for to migrate old data.

**Migrate old posts**

Like the common blog system, the old post is saved as html format. After working on several projects on github, I start to love markdown, so I decide to convert all the old html posts to markdown format. There is a project named [reverse-markdown][5] to do this job, I also forked it to handle code highlight (before I used syntaxhighlighter, now is `{% literal %}{% highlight language %}...{% endhighlight %}{% endliteral %}`), here is the [script][6].

Then I began to migrate old posts

{% highlight ruby %}
require 'rtranslate'

Post.all.each do |post|
  dir = "temp"
  translated_title = Translate.t(post.title, 'CHINESE_SIMPLIFIED', 'ENGLISH')
  filename = post.created_at.strftime("%Y-%m-%d") + "-" + translated_title.parameterize
  File.open("#{dir}/#{filename}.markdown", "w+") do |file|
    file.puts <<-EOF
---
layout: post
title: #{post.title.gsub("&#65281;", "！").gsub("&#65292;", "，")}
categories:
- #{Translate.t(post.category.name, 'CHINESE_SIMPLIFIED', 'ENGLISH')}
---
#{ReverseMarkdown.new.parse_string(post.body)}
    EOF
  end
end
{% endhighlight %}

I run the above codes in rails console, the above codes translate the post title and category name from Chinese to English, convert the body of post from html to markdown, and then save them under temp directory.

After running the codes, there are a lot of posts generated under temp directory, I just copy them to the _post directory in the new blog system, then the posts migration is complete. Cool!

**Migrate old comments**

Migrating comments is a bit difficult, it takes me a few days to play with disqus api. Luckily disqus provides a api console, I really like it.

The following codes are what I used to migrate comments to disqus.

{% highlight ruby %}
require 'rubygems'
require 'rest_client'
require 'json'
require 'open-uri'

disqus_url = 'http://disqus.com/api/3.0'

secret_key = 'your secret key'
current_blog_base_url = 'http://www.huangzhimin.com'

resource = RestClient::Resource.new disqus_url

forum_id = 'richard-huang'

Comment.all.each do |comment|
  translated_title = Translate.t(comment.post.title, 'CHINESE_SIMPLIFIED', 'ENGLISH')

  filename = comment.post.created_at.strftime("%Y/%m/%d") + "/" + translated_title.parameterize
  post_url = "#{current_blog_base_url}/#{filename}/"
  title = "Richard Huang - #{comment.post.title}"

  begin
    open(post_url)

    thread_id = nil
    JSON.parse(resource['/threads/list.json?api_secret='+secret_key+'&forum='+forum_id].get)["response"].each do |thread|
      thread_id = thread["id"] if thread["link"] == post_url
    end

    unless thread_id
      request_body = {:forum => forum_id, :title => title, :url => post_url}
      thread = JSON.parse(resource['/threads/create.json?api_secret='+secret_key].post(request_body))["response"]
      thread_id = thread["id"]
    end

    request_body = {:thread => thread_id, :message => comment.body.strip, :author_name => comment.author, :date => comment.created_at.to_i}
    request_body.merge!(:author_email => comment.mail.blank? ? "anonymous@gmail.com" : comment.mail)
    request_body.merge!(:author_url => comment.website) if comment.website.present?
    if JSON.parse(resource['/posts/create.json?api_secret='+secret_key].post(request_body))["code"] == 0
      puts "Success: #{comment.author} on #{comment.post.title}"
    else
      puts "FAIL: #{comment.author} on #{comment.post.title}"
    end
  rescue
    puts "Rescue: #{post_url}"
  end
end
{% endhighlight %}

The aboved codes are also run in rails console, it works as follows.

1. checks if the new post url existed.
2. if so, it reads or creates a thread, one thread on disqus is corresponding to one post url in blog system.
3. then create a post on disque, one post on disqus is corresponding to one comment in blog system.

There is a problem, in disqus, email of comment author can't be empty, but in my old blog system the email of comment user can be empty, so I have use "anonymous@gmail.com" instead. This is the only limitation when I migrate old comments.

Everything works well. I love my new blog system.

  [1]:https://github.com/mojombo/jekyll
  [2]:https://github.com/rfelix/jekyll_ext
  [3]:https://github.com/rfelix/my_jekyll_extensions
  [3]:https://github.com/flyerhzm/my_jekyll_extensions
  [4]:http://disqus.com
  [5]:https://github.com/xijo/reverse-markdown
  [6]:https://gist.github.com/788039
  [7]:https://github.com/flyerhzm.github.com
