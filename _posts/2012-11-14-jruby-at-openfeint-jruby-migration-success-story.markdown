---
layout: post
title: JRuby at OpenFeint - a JRuby migration success story
categories:
- jruby
---

**TL;DR:** OpenFeint gets 40% performance improvement after migrating
to JRuby from REE.

## About OpenFeint
OpenFeint was the largest mobile social gaming platform in the world,
It was acquired by GREE for $104 million last year, and a new global
platform is building to replace OpenFeint. It is still one of the
biggest rails applications, with hundreds of thousands API calls per
minute.

OpenFeint platform is using rails 2.3.14 and was running on ree 1.8.7.

## Why try JRuby

My main job is to improve the performance and scalability of OpenFeint
platform.  This April, I attended Railsconf at Austin, there was
[a panel discussion][0] talking about real world rails apps, speakers
came from New Relic, Zendesk, Groupon, etc. They use the similar
achitecture like us, ree 1.8.7, rails 2.3, mysql, memcached, redis,
rabbitmq and so on. They all complained the slow gc of ruby 1.8.7, so
did we. After that, there are 2 jruby sessions interested me.

* [Up and to the right - how Spiceworks is scaling 200 million requests
per month][1], they shown how they migrate their rails app to jruby and
got 20% performance improvement.
* [Complex Made Simple: Sleep Better with Torquebox][2], it introduced
torquebox, a ruby application server that is build on JRuby and JBoss
AS 7.

When I went back to hotel, I googled something about jruby performance
and found [torquebox performance benchmark][3], it looked pretty
exciting. At that time I decided to try jruby on OpenFeint platform.

**Note:** you probably know new relic and zendesk have already migrated
to ruby 1.9.

## Quick and dirty performance test with JRuby

I always prefer doing the performance test by myself rather than blindly
believing the performance benchmark online. So the first thing I want to
do was to do a quick performance test with JRuby on OpenFeint platform.

It was expected that OpenFeint platform couldn't work with JRuby.  To
quickly verfiy if JRuby could give us a great performance improvement, I
fixed incompatible ruby gems, like adding jruby-openssl gem, removing
SystemTimer gems and using activerecord-jdbcmysql-adapter instead of
mysql gem. I also did some dirty hacks, e.g. I disabled database
sharding, background job and other non working parts, just want to do
a quick performance test. Then I deployed app to one of our qa servers,
the result of quick performance test is as follows

* response time of ree + passenger is **331ms**
* response time of jruby + torquebox is **51.5ms**

I was shocked that JRuby is so fast, that made it easy to persuade
manager to migrate OpenFeint platform to JRuby.

**Note:** our qa environment is quite different to production
environment, databases are shared between qa servers, but memcached,
redis, rabbitmq and app server are working together in one host, and
ree on qa server didn't do any gc tuning.

## JRuby migration strategy

After the quick performance test, JRuby looked very promising, then I'm
allowed to focus my work on JRuby migration. Before I tell you how we
migrate to JRuby, please let me give you a short introduction about
what OpenFeint platform uses

* load balancer servers with nginxes.
* app servers with nginx + passenger.
* memcached servers for caches.
* redis servers for feature flags, high score caches, device mapper, etc.
* mysql servers for data storage.
* uses rabbitmq server and workling servers to handle background jobs.

Of course OpenFeint platform uses other servers for cron job, performance
test, continuous integration, full text search, log analytics, etc.

To handle the massive requests, OpenFeint platform splits app and
databse servers into different pools according to different
functionalities.

Each app pool is isolated, they don't know each other. Load balancer
servers decide sending requests to which pool according to the request
urls. Each pool will connect to all db servers, e.g. high score app
servers will fetch high score info from high score dbs and fetch
user/game info from core dbs.

Considering that we don't have experienced java ops and we only have
1 or 2 qas can involve in, it is a big risk to migrate the whole
OpenFeint platform to JRuby. So I decide to do JRuby migrate one app pool
by one app pool.

The advantage of migration one pool by one pool is it allows OpenFeint
gets the JRuby's speed earlier, 1 or 2 qas are enough to promise app is
working correctly for one pool, ops can setup jruby environment and tune
the jvm performance on one pool's hosts to accumulate jruby experience.

The disadvantage is we have to promise OpenFeint platform is working
well on both REE and JRuby, running app with REE on some pools and
running app with JRuby on other pools.

**Note:** only load balancers and mysql servers are dedicated servers,
others are VPS.

## Fix incompatible gems

The most problems for migrating a rails app to JRuby are incompatible
gems, like c extensions gems or some non thread-safe ruby gems. I
encountered 2 incompatible gems that wasted my time.

1\. [typhoeus][4], it is one of the fastest http client ruby gems, it's
a c extenion gem, we used it to synchronize data between OpenFeint
platform and the new global platform. The official document says it is
built with FFI and is ready for use with any Ruby implementation. But
during performance test, I found it always crashed the JVM after running
about 1 hour. According to the crash log, I fixed a missing
attach_function [here][5], but it didn't help. I ended up using
net-http-persistent in JRuby while using typhoeus in REE. From
performance test, I surprisingly found JRuby + net-http-persistent isn't
slower than REE + JRbuy.

2\. [memcached][6], it is the fastest memcached client ruby gems, it's
also a c extension gem. At first I used [jruby-memcache-client][7], but
jruby-memcache-client uses Base64 to encode/decode value, which can't
work with memcached gem together. Then I chose [dalli][8] which supports
both REE and JRuby, but it uses different hash and distribution
algorithms, which causes too much cache misses on production. I searched
some other jruby memcached clients, but none of them are compatible with
memcached gem, I ended up writing [jruby-memcached gem][9] by myself
based on spymemcached. I wrote a post about this gem before, check it
out [here][10].

## Enable threadsafe

By default, threadsafe is disabled in rails 2.3.14, which means every
requests are locked by Rack::Lock, it's not a big deal when running in
multi-processes servers, like unicorn or passenger, but it loses the
JRuby's natvie multi-threads power. So make sure you enable the
threadsafe when migrating to JRuby.

Enabling threadsafe means rails won't automatically load libraries under
lib/ directory, you have to load them by yourselves.

Enabling threadsafe also means you must consider thread safety seriously.
OpenFeint platform uses long-running threads to communicate with scribe,
there is a eager loaded global queue and a lazy loaded thread for each
process, when doing performance test with JRuby + Torquebox, sometimes it
will genereate several lazy loaded threads, and finally cause memory
leak. The solution is to eager load the long running thread.

## Pass all tests

It's a common sense that you must have good coverage unit, functional
and integration tests before doing a big migration. When all tests
were passed, I was confident to go further.

**Note:** JRuby always eat much more memory to run memory, for openfeint
platform, I have to allocate 2 GB memory

{% highlight bash %}
JRUBY_OPTS=-J-Xmx2g jruby --client -S bundle exec rake test
{% endhighlight %}

## Pick up a JRuby server

There are 4 JRuby servers that I can choose

* [Trinidad][11], built on JRuby::Rack and Tomcat.
* [Torquebox][12], built on JBoss AS.
* [Mizuno][13], built on Jetty.
* [Puma][14], a new ruby web server built for concurrency.

Puma depends on rack ~> 1.2 but rails 2.3.14 depends on ~> 1.1.0, so I
can't try Puma for OpenFeint platform.

I chose Torquebox from the other 3 servers, the reasons are as follows.

1\. Torquebox runs faster than Trinidad and Mizuno according to our own
performance test, I think this is bacause Torquebox is mostly written
by Java while other servers are written by Ruby.
2\. Some Torquebox core team members are paid by Red Hat to work on
Torquebox project, that means we can get better supports.
3\. Torquebox project is very actively developing, and always keeps up
with latest JBoss AS server and JRuby.

**Note:** Recently I replaced torquebox with [torquebox-lite][15], which
is a smaller, web-only version of Torquebox, you can easily add other
jboss submodules when necessary.

## Monitor JVM

Running on JVM is quite different than running on REE, you probably face
some new issues, like memory leak and thread safety. We uses
[New Relic][16] to monitor response time, throughput, etc., but it
doesn't help to monitor jvm heap / non heap memory and thread stacks.
Fortunately we also use [scout][17] to monitor our servers, scout
provides JMX Monitoring plugin which collects the memory usage of jvm.
It is okay for production so far, but we will use [zabbix][18] for
better monitoring in the future.

In Java world, there are a lot of monitor tools. Command tools like
jstat, jstack and jmap, graphical tools like jconsole and visualvm, you
can easily get the heap / non heap memory usage, gc stats, each thead
stack trace, etc.

It's really important to monitor JVM when doing performance / stress test,
it can help you find out memory leak and thread safe issues before
running on production. Here are 2 examples.

1\. memory leak, I noticed that heap memory (both edge and old) reached
100% during stress test. Although no OutOfMemoryError raised, it was
definitely a memory leak. I used jmap to dump all heap memory and read
them by [Eclipse MAT][19], here is the result.

![memory leak in eclipse mat](http://farm9.staticflickr.com/8196/8134695856_e06ba13e7f.jpg)

It's a typical memory leak, objects in container can't be gabarge
collected.

2\. thread safe, I also found the db connection pool in activerecord
2.3.14 is not thread safe. The throughput will decline after running
a long time, I used jstack to dump all threads stack trace and saw
most of threads are locked in connection_pool as follows.

{% highlight bash %}
"http--127.0.0.1-8180-1" daemon prio=10 tid=0x00007f4a17609800 nid=0x725a in Object.wait() [0x0000000049dfc000]
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
  at java.lang.Object.wait(Native Method)
  - waiting on <0x0000000704f40e18> (a org.jruby.libraries.ThreadLibrary$ConditionVariable)
  ......
  at rubyjit.ActiveRecord::ConnectionAdapters::ConnectionPool#checkout_0978F3C1EFB2CBFA2CD717B12DA76E3113CD78B7.block_1$RUBY$__file__(/home/deploy/rails_apps/  openfeint_platform/shared/bundle/jruby/1.8/gems/activerecord-2.3.14/lib/active_record/connection_adapters/abstract/connection_pool.rb:192)
  at rubyjit$ActiveRecord::ConnectionAdapters::ConnectionPool#checkout_0978F3C1EFB2CBFA2CD717B12DA76E3113CD78B7$block_1$RUBY$__file__.                          call(rubyjit$ActiveRecord::ConnectionAdapters::ConnectionPool#checkout_0978F3C1EFB2CBFA2CD717B12DA76E3113CD78B7$block_1$RUBY$__file__:65535)
  ......
{% endhighlight %}

But the count of http threads is equal to the count of db connections,
no thread should be locked. Considering our situation, I added a monkey
patch to connection_pool with one db connection per thread. It's not
perfect but works well.

## Tune JVM performance

There are several jvm settings you should set for JRuby performance.

1\. Xms and Xmx, when we hot deployed app to Torquebox by touching
-knob.yml.dodeploy, it took more than 20 minutes to complete, which was
unacceptable, after discussing with Torqeubox support team, I knew
default value for Xms is 64m and Xmx is 256m, they are too small, then I
increased them to 2g, it took only 100 seconds to hot deploy. The root
cause is hot deployment will increase memory a lot, which causing lots
of full GCs.

2\. CodeCache, when we do the performance test, I found response time
suddenly jumped after running a few minutes, the torquebox log told me
"CodeCache is full. Compiler has been disabled." CodeCache is a part of
non heap memory in Hopspot JVM, it's 64m by default, so I increased it
to 256m by setting -XX:ReservedCodeCacheSize=256m, then I don't see
the response time jump anymore.

There are a lot of JVM parameters you can tune for your application,
talk and learn from some Java experts.

## Performance / Stress test

I mentioned I already did a quick performance test, but it didn't make a
big sense, because qa and production have different environments. So
this time I did performance / stress tests on a reserved host, which has
the exactly same environments with production servers, connecting to
production database, memcache and redis servers.

Here are test results for actions in one pool.

<table style="margin-bottom: 18px">
  <tr>
    <td></td>
    <td>&nbsp;&nbsp;read action&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;write action&nbsp;&nbsp;</td>
  </tr>
  <tr>
    <td>REE 1.8.7 + passenger</td>
    <td>&nbsp;&nbsp;&nbsp;&nbsp;448 ms</td>
    <td>&nbsp;&nbsp;&nbsp;&nbsp;44 ms</td>
  </tr>
  <tr>
    <td>Ruby 1.9.3 + passenger</td>
    <td>&nbsp;&nbsp;&nbsp;&nbsp;374 ms</td>
    <td>&nbsp;&nbsp;&nbsp;&nbsp;42 ms</td>
  </tr>
  <tr>
    <td>JRuby 1.7.0.RC2 + torquebox-lite  </td>
    <td>&nbsp;&nbsp;&nbsp;&nbsp;187 ms</td>
    <td>&nbsp;&nbsp;&nbsp;&nbsp;38 ms</td>
  </tr>
</table>

JRuby is much faster than REE 1.8.7 and Ruby 1.9.3 in both read and
write actions. It's promising we can get a big performance improvement
on production.

Make sure you run your stress tests multiple times and run long time,
some memory leak and thread safety issues are not reproduced every time
or not occurred in a short time.

**Note:** REE in reserved host is already optimized with [twitter's
settings][20].

## Deployment strategy

Everything was ready, it was time to think about deployment strategy.

In Java world, you can deploy an app by packaging your source code into
a war file and copying the war package to app server. We can do the same
thing with JRuby, but it will break our existing capistrano deployment
script.

We kept existing capistrano deployment script except deploy:restart
task, replacing

{% highlight bash %}
touch tmp/restart.txt
{% endhighlight %}

with

{% highlight bash %}
touch /opt/torquebox/current/jboss/standalone/deployments/openfeint_platform-knob.yml.dodeploy
{% endhighlight %}

Torquebox will detect openfeint_platform-knob.yml.dodeploy, undeploy
old openfeint_platform and deploy new openfeint_platform, works very
similar to passenger. But I found everytime we redeploy app, the non
heap memory will jump a lot and the app will be super slow (multiple
times slower than usual) during redeployment process.

So I decided to deploy app by restarting jboss instead of hot
deployment.

{% highlight bash %}
sudo /etc/init.d/jboss-as-standalone restart
{% endhighlight %}

It solved memory issue, mitigated the slow requests, but introduced a
new issue, it will lost the requests during restarting jboss. The
solution we used is rolling restart to provide zero downtime
deployment, e.g. we have 3 app servers A, B, C

1. tell load balancers stop sending http requests to server A.
2. restart jboss on server A.
3. tell load balancers resend http resquests to server A when jboss
on server A is ready.

And restart server B and C one by one following the above steps.

So far, it works perfect, no memory jump and no request lost.

## JRuby on production

Finally we successfully migrated to JRuby on production and the response
time dropped a lot.

![performance improvement with JRuby](http://farm9.staticflickr.com/8328/8130182602_8106be24de.jpg)

It was about 40% performance improvement, although it was expected, I
was still very excited. Actually after fully warming up, it run even
faster than you see on the figure.

The following is the response time comparing to ree's 1 week ago.

![jruby performance comparison](http://farm9.staticflickr.com/8046/8134823364_f065545213.jpg)

This is the successful migration for one pool on OpenFeint platform, we
have already migrated 5 pools to JRuby, all got ~ 40% performance
improvement. I'm still working on the rest pools' migration and looking
forward to replacing all OpenFeint servers to JRuby.

Some JRuby servers have been running on OpenFeint platform for more than
2 months, they are running stably and much faster than before according
to New Relic's weekly report.

## Further

Java 7 introduced invokedynamic feature, a lot of people said
enabling invokedynamic made JRuby 1.7 run much faster, closer to Java
speed. But I'm failed tn enable invokedynamic feature with Torquebox,
saw the following error

{% highlight bash %}
18:29:03,515 ERROR [org.torquebox.core.runtime] (Thread-71) Error during execution: ENV['RAILS_ROOT']=RACK_ROOT
ENV['RAILS_ENV']=RACK_ENV
require %q(org/torquebox/web/rails/boot)
: org.jruby.exceptions.RaiseException: (LoadError) load error: haml/buffer -- java.lang.NoClassDefFoundError: org/jruby/runtime/ThreadContext
     at org.jruby.RubyKernel.require(org/jruby/RubyKernel.java:1010) [jruby.jar:]
     at ActiveSupport::Dependencies::Loadable.require(/home/deploy/rails_apps/openfeint_platform/shared/bundle/jruby/1.8/gems/activesupport-2.3.14/lib/active_support/dependencies.rb:182)
{% endhighlight %}

Torquebox team is trying to fix this issue, I will definitely enable
invokedynamic with new Torquebox release, and am looking forward to
another big performance improvement.

## Some Resources

If you join the JRuby world, the first thing you need to do is to follow
[Charles Nutter][22] on twitter, he is one of the JRuby core team
members and always shares a lot of JRuby knowledge. Also check out his
[presentations][23] to get latest JRuby features and benchmarks.
[JRuby wiki pages][24] are helpful to learn everything about JRuby.

At the end, please allow me to thank JRuby and Torquebox team for
providing such great things and thank [Gree][21] for allowing me to share
the knowledge.

[0]: http://railsconf2012.com/sessions/66
[1]: http://railsconf2012.com/sessions/62
[2]: http://railsconf2012.com/sessions/16
[3]: http://torquebox.org/news/2011/10/06/torquebox-2x-performance/
[4]: https://github.com/typhoeus/typhoeus
[5]: https://github.com/aurorafeint/typhoeus/commit/3ed63661e4f8e6b12e340fe3e84ba3a80b5c6f26
[6]: https://github.com/evan/memcached
[7]: https://github.com/ikai/jruby-memcache-client
[8]: https://github.com/mperham/dalli
[9]: https://github.com/aurorafeint/jruby-memcached
[10]: http://huangzhimin.com/2012/07/24/jruby-memcached-0-1-0-released/
[11]: https://github.com/trinidad/trinidad
[12]: https://github.com/torquebox/torquebox
[13]: https://github.com/matadon/mizuno
[14]: https://github.com/puma/puma
[15]: https://github.com/torquebox/torquebox-lite
[16]: http://newrelic.com/
[17]: http://scoutapp.com/
[18]: http://www.zabbix.com/
[19]: http://www.eclipse.org/mat/
[20]: https://gist.github.com/841168
[21]: http://product.gree.net/us/en
[22]: https://twitter.com/headius
[23]: https://speakerdeck.com/headius
[24]: https://github.com/jruby/jruby/wiki/_pages
