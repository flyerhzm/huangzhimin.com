---
layout: post
title: 设置git全局忽略的文件
categories:
- Git
- Vim
---
现在家里的笔记本一直用vim开发rails项目，再用git作版本控制，往往碰到这样的问题，在一个窗口用vim开发，再另一个窗口git status查看的时候，总是有vim生成的.swp文件干扰，每次都加在项目的.gitignore文件里也麻烦，于是就将其配置在git的全局变量中。

新建~/.gitignore文件：

{% highlight bash %}
.DS\_Store
*.swp
{% endhighlight %}

然后执行：

{% highlight bash %}
$git config --global core.excludesfile ~/.gitignore
{% endhighlight %}

再执行git status，好干净啊！

