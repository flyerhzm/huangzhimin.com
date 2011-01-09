---
layout: post
title: 通过Capistrano部署Rails App到Hostmonster
categories:
- Capistrano
- Rails
- Hostmonster
---
贴贴我通过Capistrano自动发布到Hostmonster的deploy.rb文件吧

{% highlight ruby %}
set :application, "huangzhimin.com"
set :repository,  "GIT_REPOSITORY"
set :user, "huangzhi"
set :scm, :git
set :deploy_to, "DEPLOY_DIRECTORY"

role :app, "www.huangzhimin.com"
role :web, "www.huangzhimin.com"
role :db,  "www.huangzhimin.com", :primary => true

set :use_sudo, false
set :run_method, :run

namespace(:deploy) do
  task :after_update_code, :roles => :app do
    run "ln -s #{shared_path}/config/database.yml #{current_release}/config/database.yml"
    run "cp #{shared_path}/config/environment.rb #{current_release}/config/"
    run "chmod -R u+rwX,go-w #{current_release}/public #{current_release}/log"
  end

  task :restart do
    web.disable
    migrate
    cleanup
    web.enable
  end
end

namespace :web do
  desc "Serve up a custom maintenance page."
  task :disable, :roles => :web do
    require 'erb'
    on_rollback {run "rm #{shared_path}/system/maintenance.html"}
    reason = ENV['REASON']
    deadline = ENV['UNTIL']
    template = File.read("#{current_release}/app/views/maintenance/index.html.erb")
    page = ERB.new(template).result(binding)
    put page, "#{shared_path}/system/maintenance.html", :mode => 0644
  end
end

{% endhighlight %}

将GIT_REPOSITORY和DEPLOY_DIRECTORY分别替换为你自己的git repository地址，和rails app发布到的目录。我是自己在Hostmonster上面建了一个git server，然后设置好公私密钥，这样省去了每次都输入密码的烦恼。

第四行将scm设为git，默认是svn的，所以要显示设置一下。

15-19行，定义在部署之后要做的操作：

1. 为config/database.yml做一个软链接，因为database.yml文件是被git ignore的。
2. 复制config/environment.rb文件，因为需要加入ENV['RAILS_ENV'] ||= 'production'这句话，强制使用production环境。
3.  设置public和log的目录权限为755，因为在hostmonster上面public的目录对其它用户必须是不可写的，而capistrano默认是设置为775的。

31-39行，则是在部署的时候生成一个maintenance.html文件，表示系统正在维护，等部署完毕之后再删除，提供给用户一个比较友好的错误页面。

本来restart的task是用./script/process/reaper --action=restart --dispatcher=dispatch.fcgi命令的，不过rails2.3.2中已经没有process目录了，只得作罢。

