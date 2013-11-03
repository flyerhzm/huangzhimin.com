---
layout: post
title: Upgrade to capistrano3
categories:
- capistrano
---

## New things

I updated capistrano from 2.x to 3.0 for one project, it was a huge
change. The followings are the new things:

**1\. New structure.** If you use capify to generate base structure, you
will see some new syntax.

In Capfile, you need to require all dependencies/plugins you need for
deployment.

{% highlight ruby %}
require 'capistrano/setup'
require 'capistrano/deploy'

require 'capistrano/rvm'
require 'capistrano/bundler'
require 'capistrano/rails'

Dir.glob('lib/capistrano/tasks/*.cap').each { |r| import r }
{% endhighlight %}

It also generates 2 stages `config/deploy/production.rb` and
`config/deploy/staging.rb`, which means you don't need capistrano-ext
anymore, capistrano 3 supports different stages itself.

**2\. New plugins.** All capistrano plugins for 2.x can't be used in
capistrano 3, like builtin capistrano plugin in bundler and rvm,
fortunately capistrano team already wrote the [bundler][1], [rvm][2]
and [rails][3] plugins. So you should remove old capistrano 2.x
plugins

{% highlight ruby %}
# capistrano 2.x
require 'bundler/capistrano'
require 'rvm/capistrano'
{% endhighlight %}

and use new capistrano 3 plugins

{% highlight ruby %}
# capistrano 3
require 'capistrano/bundler'
require 'capistrano/rvm'
{% endhighlight %}

**3\. New flow.**

{% highlight ruby %}
# capistrano 3
deploy:starting
deploy:started
deploy:reverting           - revert server(s) to previous release
deploy:reverted            - reverted hook
deploy:publishing
deploy:published
deploy:finishing_rollback  - finish the rollback, clean up everything
deploy:finished
{% endhighlight %}

**4\. New syntax.** Capistrano 3 introduces lots of new syntax and new
variables.

{% highlight ruby %}
# capistrano 2.x
set :repository, "git@github.com:railsbp/rails-bestpractices.com.git"
# capistrano 3
set :repo_url, "git@github.com:railsbp/rails-bestpractices.com.git"
{% endhighlight %}

capistrano 3 use repo_url instead of repository variable.

{% highlight ruby %}
# capistrano 3
set :linked_files, %w{config/database.yml config/memcache.yml}
set :linked_dirs, %w{bin log tmp/pids tmp/cache tmp/sockets vendor/bundle public/system}
{% endhighlight %}

linked_files and linked_dirs are very useful, it automatically creates
symbolic files and dirs, which you have to write your own task in
capistrano 2.x.

{% highlight ruby %}
# capistrano 2.x
namespace :css_sprite do
  task :build, :roles => :app do
    run "cd #{release_path}; #{rake} RAILS_ENV=#{rails_env} css_sprite:build"
  end
end

# capistrano 3
namespace :css_sprite do
  task :build do
    on roles(:app) do
      within release_path do
        with rails_env: fetch(:rails_env) do
          execute :rake, "css_sprite:build"
        end
      end
    end
  end
end
{% endhighlight %}

capistrano 3 likes dsl (on, within, with, etc.) more.

Capistrano 3 also added parallel and sequence execution, and other
features.

## Problems

But I also found some problems from capistrano 3

1\. capistrano 3 doesn't allow invoke inside on() block, sometimes I
have to write duplicated code, see this [pull request][4].

2\. capistrano generate linked_files and linked_dirs only for app
servers, so when execute deploy:migrate on db server, it can't find
config/database.yml, here is my [temp solution][5].

[1]: https://github.com/capistrano/bundler
[2]: https://github.com/capistrano/rvm
[3]: https://github.com/capistrano/rails
[4]: https://github.com/ahmadsherif/capistrano-puma/pull/1
[5]: https://github.com/wecapslabs/capistrano/commit/2fe6bebe4a1536e2f4ccb0ef8402ff1555a8bf06
