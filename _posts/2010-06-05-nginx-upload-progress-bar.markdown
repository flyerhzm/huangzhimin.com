---
layout: post
title: nginx上传进度条
categories:
- Nginx
- Rails
---
项目中经常需要应用的功能之一就是文件上传，一般对于小文件来说不需要特别的处理，但是一旦碰到允许大尺寸文件上传的时候，用户常常会被长时间的没有变化的上传过程而迷惑，这种时候就需要一个上传进度条来提醒用户。比如我最近一个项目允许用户上传100M的视频文件，上传的过程往往需要持续10多分钟，这种情况如果没有进度条的话，用户可能会以为系统出问题了。项目部署的环境为nginx+lighttpd，上传的过程是这样的：

1. 用户选择上传的视频，点击提交按钮

2. nginx将视频文件的二进制数据保存为/tmp目录下面的某个文件

3. lighttpd执行rails的代码对/tmp目录下面的上传文件进行处理

由此可见，上传视频的过程都是由nginx进行处理的，lighttpd并不知情，它只能通过上传表单了解到上传到/tmp目录下的文件名，这样的好处是，费时的上传过程并不会消耗rails进程。所以我们在做上传进度条的时候就要在nginx身上下功夫了。

google了一下，发现网上已经有了解决方案，[http://github.com/drogus/jquery-upload-progress][1]

同时修改nginx配置文件 ，增加以下这段：

{% highlight nginx %}
location ^~ /_upload_progress {
  upload_progress_json_output;
  report_uploads proxied;
}
{% endhighlight %}

应用jquery-upload-progress就是采用ajax轮询，请求/_upload_progress，返回一个json，告诉你上传是否开始，上传了多少字节，总共有多少字节，你只需要比较上传多少字节和总共多少字节就可以得到上传数据的进度，至于进度条的显示只需要些点css就可以搞定了。


  [1]: http://github.com/drogus/jquery-upload-progress

