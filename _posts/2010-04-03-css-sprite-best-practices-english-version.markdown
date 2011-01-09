---
layout: post
title: css sprite best practices
categories:
- Rails
- css
- RubyGems
---
[css sprite最佳实践（中文版）][1]

(Updated on 2010-4-4, thank [Scott Ballantyne][2] )

The advantage of using the css sprite is to reduce a large number of http requests, so it makes the web page loaded much faster. I often find it it painful for me to compose a lot of images into one css sprite image and measure the x and y positions for each image.

Last year, I wrote a [css_sprite][3]  gem, but to use it you need to define all the images you want to do the css sprite in the configuration file, and it is not easy to use. Because of this, recently I rewrote the css_sprite gem, it is not necessary to use configuration file any more by default, the new css_sprite gem follows the idea of Convention Over Configuration. Now the css_sprite gem can do the css sprite automatically.

First, let's look at the convention of the directory structrue.

![][4]

The blue parts on the above image are the css_sprite directories according to convention. That means the directory whose name is css_sprite or css_sprite suffixed (e.g. another_css_sprite) needs to do the css sprite.

The green parts are images that need to be tranformed into the css sprite. Once you add images to the css_sprite directory or remove images, the css sprite operation will be automatically executed.

The red parts are automatically generated files. For each css_sprite directory, there is a css sprite image generated, combined by all the images under the css_sprite directory, and there is also a css or sass file generated according to the css_sprite image.

What about the generated css file?

{% highlight css %}
.twitter_icon, .facebook_icon, .login_button, .logout_button {
  background: url('/images/css_sprite.png?1270170265') no-repeat;
}
.twitter_icon { background-position: 0px 0px; width: 14px; height: 14px; }
.facebook_icon { background-position: 0px -19px; width: 14px; height: 14px; }
.login_button { background-position: 0px -38px; width: 103px; height: 36px; }
.logout_button { background-position: 0px -79px; width: 103px; height: 36px; }
{% endhighlight %}

That means, the generated css file follows the naming convention: *one image under the css_sprite directory corresponds to one class in the generated css file, the name of class is just the same as the name of image.* The advantage of this is that developers only need to know what images are under css_sprite directory, then they can use the corresponding class names to display these images on the html page.

One difficulty that you may encounter is adding styles to a class that is being used by css sprite. Below is a description of how you might handle such an issue.

1\. some related classes have some common styles. e.g. to buttons, you may apply them on input or a elements, in common you need to hide the text on input and a elements, hide the border and so on. So you should generate the common styles for these related classes. For example

{% highlight css %}
.login_button, .logout_button {
  text-indent: -9999px;
  display: block;
  cursor: pointer;
  font-size: 0; # for ie
  line-height: 15px; # for ie
  border: 0; }
{% endhighlight %}

These styles should be added to the automatically generated css file accroding to user's customization. What customizations I always use are icon, logo, button and bg (abbr. for background).

2\. the style for some specified class, e.g. define margin or float for login_button

{% highlight css %}
.login_button {
  margin: 0 10px;
  float: left; }
{% endhighlight %}

These styles should be written in the user-defined css file, not the automatically generated css file.

Follow these rules, what you need to do is to put a new image into the css_sprite directory, then use the corresponding class name to display the image on html page. Generating css sprite image and css files are done automatically. Of course when I remove an image from the css_sprite directory, it is also removed from css_sprite image and css.

These are css sprite best practice I follow. Now it's time to see how to implement these in a rails application.

1\. Install my css_sprite gem/plugin

{% highlight bash %}
sudo gem install css_sprite
{% endhighlight %}

Or

{% highlight bash %}
script/plugin install git://github.com/flyerhzm/css_sprite.git
{% endhighlight %}

Notice, css_sprite gem depends on the rmagick gem, so please make sure RMagick is successfully installed on your system.

Then add css_sprite gem in the environment.rb or Gemfile

2\. Next make a directory whose name is css_sprite or ends with css_sprite (e.g. another_css_sprite) under public/images directory

3\. If you install the css_sprite as a gem, you should add css_sprite task in Rakefile

{% highlight ruby %}
require 'css_sprite'
{% endhighlight %}

If you install it as a plugin, you can skip this step

4\. Let's start the css sprite automation

{% highlight bash %}
rake css_sprite:start
{% endhighlight %}

5\. Put the images which need to do the css sprite under the css_sprite directory, then you will see the automatically generated css sprite image and css files. Now you can use the corresponding class name to display image on html. And don't forget include the stylesheet

{% highlight rhtml %}
<%= stylesheet_link_tag 'css_sprite' %>
{% endhighlight %}

Do you feel the you are saved from the dull css sprite job? Here are some additional tasks.

If you want to stop the css sprite automation, run

{% highlight bash %}
rake css_sprite:stop
{% endhighlight %}

If you want to restart the css sprite automation, run

{% highlight bash %}
rake css_sprite:restart
{% endhighlight %}

If you only want to run the css_sprite manually instead of automation, run

{% highlight bash %}
rake css_sprite:build
{% endhighlight %}

These are the default processes without configuration. If you want to use sass or you want to define common styles for some related classes, you need to define config/css_sprite.yml file

{% highlight yaml %}
suffix:
  button: |
    text-indent: -9999px;
    display: block;
    cursor: pointer;
    font-size: 0;
    line-height: 15px;
    border: 0;
    outline: 0;
{% endhighlight %}

The effect of the above configuration file is to generate some common styles for all the images whose filename is button suffixed.

{% highlight yaml %}
engine: sass
suffix:
  button: |
    text-indent: -9999px
    display: block
    cursor: pointer
    font-size: 0
    line-height: 15px
    border: 0
    outline: 0
{% endhighlight %}

The effect of the above configuration file is to generate a sass file, and generate some common styles for all the images whose filename is button suffixed. Please check the difference of the two configuration files, the content followed button: are copied to the automatically generated css or sass file. So please input the content according to the syntax of css or sass.

Notice, once you changed the configuration file, please make sure stop and start the css_sprite to take effects.

Finally, let's look at the automatically generated css file.

{% highlight css %}
.login_button, .logout_button {
  text-indent: -9999px;
  display: block;
  cursor: pointer;
  font-size: 0;
  line-height: 15px;
  border: 0; }
.twitter_icon, .facebook_icon, .login_button, .logout_button {
  background: url('/images/css_sprite.png?1270170265') no-repeat;
}
.twitter_icon { background-position: 0px 0px; width: 14px; height: 14px; }
.facebook_icon { background-position: 0px -19px; width: 14px; height: 14px; }
.login_button { background-position: 0px -38px; width: 103px; height: 36px; }
.logout_button { background-position: 0px -79px; width: 103px; height: 36px; }
{% endhighlight %}

Don't hesitate to use the css_sprite to speed up your productivity, [http://github.com/flyerhzm/css_sprite][3]


  [1]: /2010/04/02/css-sprite-best-practices-chinese-version
  [2]: http://scottballantyne.com/
  [3]: http://github.com/flyerhzm/css_sprite
  [4]: http://lh6.ggpht.com/_qSmJ0dW70FE/TGdIAsGI6_I/AAAAAAAAATo/3Xhs9JzvDAQ/css_sprite_preview.png

