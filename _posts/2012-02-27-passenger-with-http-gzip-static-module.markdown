---
layout: post
title: passenger with http_gzip_static_module
categories:
- rails
- passenger
---
Rails 3.1 has been released for a long time, asset pipeline becomes more
and more popular, I also upgraded my rails website.

I used nginx + passenger for my rails projects, but nginx only supports
dynamic gzip support (compress in runtime), there is a
http_gzip_static_module for nginx, which can make full use of rails
asset pipeline.

I don't like the way to customize my Nginx installation during passenger
installation, I found there is a [pull request][1] to add
http_gzip_static_module, so I changed to source code of passenger gem,
then installed nginx as default. :-)

[1]:[https://github.com/FooBarWidget/passenger/pull/35]
