---
layout: post
title: git for hostmonster
categories:
- Git
- Capistrano
- Hostmonster
---
前段时间对网站做了些更新，于是在本地修改了代码，再git push，谁知却得到bash: git-receive-pack: command not found的error，我的git repository是放在hostmonster服务器上面的，之前都是正常的，于是提交ticket给hostmonster的support，得到的答复是他们升级的openssh，通过git+ssh不会再读取.bashrc或.ssh/environment文件，也就是说通过git+ssh没有办法修改PATH了。

没办法了，只能手动将命令的路径补全了，对于git pull/git ps来说，只需要在输入命令的时候增加参数，比如

{% highlight bash %}
git clone --upload-pack=/home1/huangzhi/git/bin/git-upload-pack
git push --receive-pack=/home1/huangzhi/git/bin/git-receive-pack
{% endhighlight %}

不过每次都输入参数实在麻烦，直接写到配置文件.git/config

{% highlight bash %}
[remote "origin"]
uploadpack=/home1/huangzhi/git/bin/git-upload-pack
receivepack=/home1/huangzhi/git/bin/git-receive-pack
{% endhighlight %}

然后就可以像以前一样git pull/git ps了。

还有一个问题，那就是capistrano。默认capistrano通过git ls-remote获取最新的commit id，通过git clone来获取最新文件，但是这些命令都没有办法设置upload-pack和receive-pack参数，没办法，只能修改默认的方法定义。

首先是git ls-remote

{% highlight ruby %}
require 'capistrano/recipes/deploy/scm/base'
::Capistrano::Deploy::SCM::Base.class_eval do
  alias_method :origin_scm, :scm
  def scm(*args)
    if command == "git" and args[0] == "ls-remote"
      args[0] = "ls-remote --upload-pack=/home1/huangzhi/git/bin/git-upload-pack"
    end
    origin_scm(args)
  end
end
{% endhighlight %}

当命令为git ls-remote的时候，额外加入参数upload-pack

再就是git checkout

{% highlight ruby %}
require 'capistrano/recipes/deploy/scm/git'
::Capistrano::Deploy::SCM::Git.class_eval do
  def checkout(revision, destination)
    git    = "/home1/huangzhi/git/bin/git"
    remote = origin

    args = []
    args  "-o #{remote}" unless remote == 'origin'
    if depth = configuration[:git_shallow_clone]
      args  "--depth #{depth}"
    end

    execute = []
    if args.empty?
      execute  "#{git} clone --upload-pack=/home1/huangzhi/git/bin/git-upload-pack #{verbose} #{configuration[:repository]} #{destination}"
    else
      execute  "#{git} clone --upload-pack=/home1/huangzhi/git/bin/git-upload-pack #{verbose} #{args.join(' ')} #{configuration[:repository]} #{destination}"
    end

    # checkout into a local branch rather than a detached HEAD
    execute  "cd #{destination}  #{git} checkout #{verbose} -b deploy #{revision}"

    if configuration[:git_enable_submodules]
      execute  "#{git} submodule #{verbose} init"
      execute  "#{git} submodule #{verbose} sync"
      execute  "#{git} submodule #{verbose} update"
    end

    execute.join("  ")
  end
end

{% endhighlight %}

这个我没有找个比较优雅的方式，只能直接覆盖原来的方法定义，并在git clone的命令中加入upload-pack。

还有就是当capistrano执行远程命令的时候，同样没有合适的environments，比如执行rake db:migrate的时候，所以需要修改默认的rake命令

{% highlight ruby %}
set :rake, "source /home1/huangzhi/.bashrc; rake"
{% endhighlight %}

这样当执行rake命令执行，首先读取.bashrc，设置合适的environments，然后再执行rake命令。

到此为止，一切又恢复了正常。

