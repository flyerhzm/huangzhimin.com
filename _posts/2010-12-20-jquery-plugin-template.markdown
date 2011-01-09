---
layout: post
title: JQuery Plugin Template
categories:
- jquery
---
JQuery is one of the most important javascript framework I used, besides
default jquery apis, I use a lot of jquery plugins to improve the web
interactive, such as auto complete, dropdown menu, chart and so on.

I will be likely to write some jquery plugins or hack others' jquery
plugins, The following is the template for a jquery plugin that I
learned from "jQuery 1.4 Plugin Development"

{% highlight javascript %}
(function($) {
  $.fn.pluginName = function(options) {
    var defaults = {
      ......
    }

    var o = $.extend({}, defaults, options);

    return this.each(function() {
      var e = $(this);
      ......
    });
  }
})(jQuery);
{% endhighlight %}

the structure `(function($) {...})(jQuery)` can protected the conflict
of $ sign which is used by other javascript framework.

`$.extend({}, defaults, options)` provides a flexible way to tweak your
plugin, options can override defaults, but not change the value of
defaults.

`return this.each(function() {...})` promises your plugin functions are
chainable, like the default jquery apis.
