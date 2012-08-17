---
layout: post
title: jruby-memcached 0.4.0 released
categories:
- jruby
- memcached
---
I just released [jruby-memcached 0.4.0][0], it contains the following
changes:

1. run spymemcached as a daemon thread. I found when running rake task
   with jruby-memcached < 0.4.0, it won't stop unless you press Ctrl+C.
2. get method can accept multiple keys.
3. add Memcached::Rails as a rails cache_store. Of course, it is
   compatible with Memcached::Rails in memcached.gem.
4. make full use of jruby annotation to reduce method definitions with
   optional and rest arguments.

check out the full code changes [here][1].

[0]: https://rubygems.org/gems/jruby-memcached/versions/0.4.0
[1]: https://github.com/aurorafeint/jruby-memcached/compare/v0.3.0...v0.4.0
