---
layout: post
title: javascript的trim方法
categories:
- javascript
---
javascript的String类是没有trim方法的，不过我们可以通过String的replace方法来模拟

{% highlight javascript %}
String.prototype.trim = function() {
    return this.replace(/^\s+/g,"").replace(/\s+$/g,"");
}
String.prototype.ltrim = function() {
   return this.replace(/^\s+/g,"");
}
String.prototype.rtrim = function() {
   return this.replace(/\s+$/g,"");
}
{% endhighlight %}

