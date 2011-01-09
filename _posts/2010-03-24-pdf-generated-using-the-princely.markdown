---
layout: post
title: 使用princely生成pdf
categories:
- Rails
- Ruby
---
Prince是一个将html和xml转换为pdf的程序，最突出的特点是prince能够根据css来格式化转换之后的pdf，这实在是太适合web程序员了。princely是一个基于prince的rails插件，使用起来也非常方便。

首先，下载[prince][1]并按照文档进行安装。

其次，安装princely

{% highlight bash %}
sudo gem install princely
{% endhighlight %}

接着就是在rails项目中生成pdf并供用户下载。定义一个名字叫download的action

{% highlight ruby %}
def download
  # any logic

  respond_to do |format|
    format.html
    format.pdf do
      render :pdf => "pdf_file_name",
             :stylesheets => "pdf_css"
    end
  end
end
{% endhighlight %}

然后就是定义download.pdf.erb文件，它就和平时定义html.erb是一样的，样式由pdf_css.css决定。

这样，当用户点击一个链接进入这个download action，服务器就会在后台生成pdf，并发送response给用户，用户的浏览器就弹出下载的对话框。很简单吧


  [1]: http://www.princexml.com/download/

