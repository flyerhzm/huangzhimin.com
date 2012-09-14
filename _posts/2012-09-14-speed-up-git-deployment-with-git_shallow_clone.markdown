---
layout: post
title: speed up git deployment with depth 1
categories:
- capistrano
---
By default, when you deploy your application by capistrano git, it will
clone the repository with entire history on production server, but it's
meaningless. You should never go to production host and check git log,
instead you just need latest code on production host.

With your application grows, git clone with entire history may take a
bit longer time than you expected. The following is the time spent with
fully cloning.

{% highlight bash %}
$ time git clone git@github.com:railsbp/rails-bestpractices.com.git
Cloning into 'rails-bestpractices.com'...
remote: Counting objects: 11438, done.
remote: Compressing objects: 100% (3915/3915), done.
remote: Total 11438 (delta 7012), reused 11277 (delta 6886)
Receiving objects: 100% (11438/11438), 5.52 MiB | 127 KiB/s, done.
Resolving deltas: 100% (7012/7012), done.
git clone git@github.com:railsbp/rails-bestpractices.com.git  0.55s user 0.26s system 1% cpu 55.275 total
{% endhighlight %}

But if clone with depth 1, it's finished much faster since there is only
1 revision fetched.

{% highlight bash %}
$ time git clone --depth 1 git@github.com:railsbp/rails-bestpractices.com.git
Cloning into 'rails-bestpractices.com'...
remote: Counting objects: 1635, done.
remote: Compressing objects: 100% (1243/1243), done.
remote: Total 1635 (delta 265), reused 1367 (delta 189)
Receiving objects: 100% (1635/1635), 3.02 MiB | 134 KiB/s, done.
Resolving deltas: 100% (265/265), done.
git clone --depth 1 git@github.com:railsbp/rails-bestpractices.com.git  0.24s user 0.17s system 1% cpu 34.236 total
{% endhighlight %}

It's time to apply this on your capistrano file to speed up your
deployment.

{% highlight ruby %}
set :scm, :git
set :git_shallow_clone, 1
{% endhighlight %}

**Warning**: git_shallow_clone can't work with branch.
