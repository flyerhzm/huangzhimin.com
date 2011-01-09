---
layout: post
title: 为select和input type=file标签添加样式
categories:
- css
- javascript
- html
---
select和input type=file两个都是html标签，但是它们在不同的浏览器上显示是完全不同，对于那些对UI要求非常高的网站来说，这是不可接受的。由于这两个标签的样式是由浏览器实现的，所以要想完全通过css来统一样式几乎是不可能的，所以我们这里需要借助javascript的帮助。

看上去这个应该由两个标签组成，左边是一个text field，右边是一个上传的按钮，要想在所有的浏览器上都把input type=file做成这个样子好像没这个可能，可以想到的办法就是设置两个层，下面的层由一个text field和一个按钮组成，上面是一个透明的input type=file的层，高度和宽度正好覆盖下面的层就可以了。

我是借助 javascript来生成下面的那个层

{% highlight javascript %}
$.each($('form input[type=file]'), function(i, elem) {
  $(elem).parent().append($("<div class='fakefile'><input type='text'><div class='browser_button'></div></div>"));
  $(elem).change(function() {
    $(this).parent().find('input[type=text]').val($(this).val());
  });
});
{% endhighlight %}

这里fakefile就是下面的那个层，`<div  class="browser_button"></div>`是通过css_sprite得到的按钮图片（最近使用 css_sprite到了偏执的状态）。然后就是通过css来区分上下两个层

{% highlight css %}
.file {
  width: 209px;
  height: 28px;
  position: relative; }
.file input[type=file] {
  z-index: 2;
  width: 278px;
  opacity: 0;
  filter: alpha(opacity: 0);
  -moz-opacity: 0;
  cursor: pointer; }
.file div.fakefile {
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0; }
.file div.fakefile input {
  width: 207px;
  height: 28px;
  border: 1px solid #c1c1c1;
  -moz-border-radius: 3px;
  -webkit-border-radius: 3px; }
.file div.fakefile .browser_button {
  position: absolute;
  top: 0;
  left: 207px; }
{% endhighlight %}

input  type=file的z-index为2，.fakefile的z-index为1，表示fakefile为下面的层，input  type=file为上面的层。input type=file的opacity设置为0，表示input  type=file为透明的，通过position: absolute可以将两个层完全重叠。这样做出来的input  type=file就和之前的图片一模一样了。

对于select标签的样式修改也可以用相同的办法进行处理。

