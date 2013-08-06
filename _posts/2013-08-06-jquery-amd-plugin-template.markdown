---
layout: post
title: JQuery AMD Plugin Template
categories:
- jquery
---
Several years ago I posted how to write a [jquery plugin
template](http://blog.huangzhimin.com/2010/12/20/jquery-plugin-template/),
but in the recent years, browser javascript is evolving, developers are
more likely using asynchronous module definition API (Require.js). So
the jquery plugin template should also be updated like

{% highlight javascript %}
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as anonymous module.
    define(['jquery'], factory);
  } else {
    // Browser globals.
    factory(jQuery);
  }
}(function ($) {
  $.fn.pluginName = function(options) {
    var defaults = {
      // define default options
    }

    var o = $.extend({}, defaults, options);

    return this.each(function() {
      var e = $(this);
      // write logic here
    });
  }
});
{% endhighlight %}

The difference is the jquery plugin uses asynchronous jquery module if
it exists, otherwise uses global jQuery as usual.
