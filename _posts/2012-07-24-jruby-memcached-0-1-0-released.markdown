---
layout: post
title: jruby-memcached 0.1.0 released
categories:
- jruby
- memcached
---
I just released [jruby-memcached][0] 0.1.0 gem, which is the fastest
jruby memcached client so far and it is also compatible with
memcached.gem.  The following is the story why I created
jruby-memcached gem.

We are trying to migrate our service from ree to jruby. It's a big
project for us, as our repository is written from early 2009, it becomes
bigger and bigger, and nobody can promise migrating it to jruby without
any errors. Fortunately we are separating our service into different
pools, like one pool to handle high scores requests, one pool to handle
achievements requests, so our strategy is to migrate to jruby one pool
by one pool, it makes migrating processes easier, everytime we only focus
on one pool.

This raises one problem, we are using [evan's memcached gem][1] which is
the fastest memcached client for MRI, but it isn't working in jruby, yes,
it's a ruby gem with c extention. But we have to solve the situation that
memcached client must work on both ree pool and jruby pool.

The first idea in my mind is to use a jruby memcached client, after
googling I found [jruby-memcached-client][2], but soon I get to know
they can't be used together. jruby-memcached-client marshal dump the
value, encode the value to base64 then save to memcached, and memcached
gem only marshal dump, do not encode to base 64. Althrough I can fork
and change jruby-memcached-client, but there is still a string issue
passing from ruby to jave, I will mention it later.

So I have to give up jruby-memcached-client, then I try to use pure ruby
memcached client like memcache-client or dalli. I pick up [dalli][3]
which is faster than memcached-client, but after we deployed it on
production, we found memcached misses jump too high which we can't
afford, see

![Memcached misses](http://farm8.staticflickr.com/7128/7635380018_69f4cc5247.jpg)

we have to revert the release.

I did some research about memcached, then I realized memcached and dalli
are incompatible, why? You may think memcached is simple, just set
key/value pair and get value based on key. It is right in common, but if
you have more than 1 memcached servers, memcached client should know
what key is on which memcached server, client must not fetch the key from
server1 now but fetch it from server2 10 minutes later.

Let me introduce you 2 important client configurations

1. Hashing, it is the algorithm to convert you string key to long hash.
2. Consistent Hashing, aka distribution in memcached gem, it is the
   algorithm to map you generated hash to one of your memcached servers,
   it promises low ratio cache reassigns when you add or remove a
   memcached server. See more about consistent hashing on [wikipedia][4].

memcached uses fnv1_32 as hash algorithm by default and dalli uses
crc32, and their distribution algorithm are not compatible as well.

Finally I decided to write a jruby memcached based on a java memcached
library by myself. After googling, I find 2 options: [xmemcached][5] and
[spymemcached][6]. The author of xmemcached shows the benchmark which
said xmemcached is a bit faster than spymemcached and it provides
libmemcached compatible hasing algorithm (although I was cheated in the
end :-) ), so I gave it a try first.

xmemcached's LibmemcachedMemcachedSessionLocator is not compatbile with
libmemcached, at least not compatible with libmemcached 0.32 which is
used by memcached gem. I have to dive into libmemcached 0.32 source code
and override xmemcached MemcachedSessionLocator, and write a jruby gem
to wrap the xmemcached. (writing a jruby gem is not difficult, I
probably write a new post to introduce in the future) Then I released it
on our reverse pool, sending high traffic to see the performance, I'm
disappointed, memcached get time increased from 30+ ms to 60 ms, and it
generated about 200 threads for xmemcached (we have 30 memcached servers
and 2 memcached client instances).

Quickly I replaced xmemcached to spymemcached, and memcached get time
decreased to 40+ ms and it only generates 2 threads, awesome. And its
hash and distribution algorithms are 100% compatible to libmemcached
0.32. You can read the source code in [src/main/java][7] to see all
hacks I did for spymemcached.

I mention a string issue above, it is when we passing a zlib deflated
value, like "x\234c?P?*?/?I\001\000\b8\002a", it changes to
"x?c?P?*?/?8a" in java, so we can't pass deflated string directly,
instead we pass bytes.

I also did some benchmark between memcached, jruby-memcached and dalli.

    in ruby-1.9.3
                               user     system      total        real
    memcached set          1.110000   1.020000   2.130000 (  4.592509)
    memcached get          0.970000   1.000000   1.970000 (  4.172170)
                               user     system      total        real
    dalli set              8.330000   1.560000   9.890000 ( 10.094499)
    dalli get              8.530000   1.680000  10.210000 ( 10.331083)

    in jruby-1.6.7.2
                              user     system      total        real
    jruby-memcached set   6.902000   0.000000   6.902000 (  6.902000)
    jruby-memcached get   6.845000   0.000000   6.845000 (  6.845000)
                              user     system      total        real
    dalli set            13.251000   0.000000  13.251000 ( 13.251000)
    dalli get            13.536000   0.000000  13.536000 ( 13.536000)

see more [here][8], as you seen, both memcached and jruby-memcached are
2x faster than dalli.

[0]: https://github.com/aurorafeint/jruby-memcached
[1]: https://github.com/evan/memcached
[2]: https://github.com/ikai/jruby-memcache-client
[3]: https://github.com/mperham/dalli
[4]: http://en.wikipedia.org/wiki/Consistent_hashing
[5]: http://code.google.com/p/xmemcached/
[6]: http://code.google.com/p/spymemcached/
[7]: https://github.com/aurorafeint/jruby-memcached/tree/master/src/main/java
[8]: https://github.com/aurorafeint/jruby-memcached/blob/master/benchmark.rb
