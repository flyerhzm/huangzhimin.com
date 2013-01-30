---
layout: post
title: another zero downtime deployment solution
categories:
- deployment
---
I wrote [a post][0] for jruby migration 2 monthes ago, it mentioned a
solution to do zero downtime deployment: pull out server out of load
balancers, restart server, and then put in the server. It works but has
some cons

1. you must have more than 1 app hosts.
2. deployment process gets much slower if you have lots of app hosts.
3. you lost one host's throughput during deployment.

I'm using a different solution for zero downtime deployment now, instead
of processing app hosts one by one

1. it starts replicated ruby instances on all app hosts.
2. reload load balancer (proxy) to send traffic to replicated ruby
   instances.
3. stops original ruby instances.

It won't slow down your deployment process, it also works well if
you only have 1 app host and you don't lost any throughput during
deployment.

The disadvantage is it needs more memory on your app host, it occupies
x2 ruby instances' memory during deployment. Our project is an api
service built on ruby not rails, memory usage is pretty low, only 50 mb
per ruby instance, so x2 memory usage is not a big deal.

[0]: http://huangzhimin.com/2012/11/14/jruby-at-openfeint-jruby-migration-success-story/
