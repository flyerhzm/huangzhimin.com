---
layout: post
title: 在hostmonster上搭建git server
categories:
- Hostmonster
- Rails
- Git
---
hostmonster本身并不支持git，不过还好它提供了ssh，我们可以ssh上去编译git。

首先，ssh到hostmonster上，编译安装git

{% highlight bash %}
$ mkdir git
$ cd git
$ wget http://kernel.org/pub/software/scm/git/git-1.6.3.2.tar.gz
$ tar -zxvf git-1.6.3.2.tar.gz
$ cd git-1.6.3.2/
$ ./configure --prefix=$HOME/git
$ make  make install
{% endhighlight %}

修改~/.bashrc，设置环境变量

{% highlight bash %}
export GIT_HOME=$HOME/git
export PATH=$GIT_HOME/bin/:$GIT_HOME/lib/libexec/git-core/:$PATH
{% endhighlight %}

验证结果

{% highlight bash %}
$ source ~/.bashrc
$ git --version
{% endhighlight %}

我们在本地新建一个rails app来使用git server

{% highlight bash %}
$ rails home -d mysql
$ cd home
$ git init
$ git add .
$ git commit -a  -m "first commit"
{% endhighlight %}

忘了说了，你应该git init之后新建一个.gitignore文件

{% highlight bash %}
.DS_Store
log/*.log
tmp/**/*
config/database.yml
{% endhighlight %}

在本地生成一个只包含版本信息的版本库，并上传到hostmonster上，假设你要把你hostmonster上的版本库信息放在gits目录下

{% highlight bash %}
$ cd ../
$ git clone --bare home home.git
$ touch home.git/git-daemon-export-ok
$ scp -r home.git username@yourdomain.com:gits/
{% endhighlight %}

设置本地代码的远程版本库

{% highlight bash %}
$ cd home
$ git remote add origin usernmae@yourdomain.com:gits/home.git
{% endhighlight %}

之后就是修改代码，git pull/git push了

