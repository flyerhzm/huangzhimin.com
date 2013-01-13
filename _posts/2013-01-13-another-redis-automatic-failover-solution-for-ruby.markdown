---
layout: post
title: another redis automatic failover solution for ruby
categories:
- ruby
- redis
---
Redis gets more and more popular as a backend storage, so the redis
failover solution becomes important before you use redis as a critical
resource.

Currently the most popular automatic master/slave failover solution for
ruby is [redis_failover][0], it's based on ZooKeeper, if you already
have ZooKeeper in your infrastructure, it's great.

But I noticed that redis already has a built-in automatic failover
solution, called [Redis Sentinel][1]. In case you didn't heard of it,
please read the official document, it's simple and no other external
dependency. I searched on github, but none was working well. I have
to implement it by myself.

The key point is you never connect to redis master server directly.
Instead, you talk to redis sentinel servers, ask them where is the
master server, and then connect to the redis master server.

When your redis master server down, your redis sentinel servers will
tell you a new master server, so you just disconnect old server and
connect to new master server

My soluion is a monkey-patch to redis-rb gem, it's [redis-sentinel][2],
before it tries to connect redis server, it firstly asks redis
sentinels where is master server, then connect as usual. Try it and give
me the feedback.

[0]: https://github.com/ryanlecompte/redis_failover
[1]: http://redis.io/topics/sentinel
[2]: https://github.com/flyerhzm/redis-sentinel
