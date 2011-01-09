---
layout: post
title: ActiveRecord Without Rails
categories:
- Ruby
- ActiveRecord
- Rails
---
前几天写了个小程序，帮我选号买彩票。主要是去网上抓取历次的开奖号码，存到数据库，然后再做统计分析。

因为程序很小，所以实在不想把Java这个大胖子叫出来，就简单地在vi下写了几十行的ruby代码。由于要用到数据库，自然想到了ActiveRecord，平时都是在Rails环境下用的，现在却是要让它脱离出来，闹独立。

首先是在mysql中新建数据库：

{% highlight bash %}
mysqladmin -uroot create caipiao
{% endhighlight %}

接着当然应该是定义database.yml

{% highlight yaml %}
adapter: mysql
encoding: utf8
database: caipiao
username: root
password:
socket: /var/run/mysqld/mysqld.sock
{% endhighlight %}

定义migration，新建db/migrate目录，新建migration文件，注意前面加上数字前缀，001_xxx, 002_yyy，migration文件内容就和rails中的一模一样。

{% highlight ruby %}
class CreateRedBlueBalls < ActiveRecord::Migration
  def self.up
    create_table :red_blue_balls do |t|
      t.integer :number
    end
  end

  def self.down
    drop_table :red_blue_balls
  end
end
{% endhighlight %}

最关键的是Rakefile文件

{% highlight ruby %}
require 'active_record'
require 'yaml'

task :default => :migrate

task :migrate => :environment do
  ActiveRecord::Migrator.migrate('db/migrate', ENV["VERSION"] ? ENV["VERSION"].to_i : nil )
end

task :environment do
  ActiveRecord::Base.establish_connection(YAML::load(File.open('database.yml')))
end
{% endhighlight %}

在environment任务中读取database.yml配置文件，在migrate任务中，根据VERSION定义数据库。

剩下的就是定义好model文件了：

{% highlight ruby %}
require 'rubygems'
require 'active_record'
require 'yaml'

dbconfig = YAML::load(File.open('database.yml'))
ActiveRecord::Base.establish_connection(dbconfig)

class RedBlueBall < ActiveRecord::Base
  has_many :red_balls
  has_one :blue_ball

  validates_uniqueness_of :number
end

{% endhighlight %}

最后你只需要在命令行输入rake即可运行migration，RedBlueBall就可以像在Rails中一样来使用了。

可以看到，Rails的约定帮我们做了很多事情，定义好了Rakefile，所有的model都会自动require相应的gems，读取database.yml配置文件。

