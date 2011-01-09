---
layout: post
title: ruby正则的named capture
categories:
- Ruby
---
之前用python re的时候，特别喜欢用named capture，主要是可读性好太多了，一个正则表达式写出来都不用再加注释了。

可是ruby1.8并不支持，每次用$1, $2的时候都觉得很ugly，幸好ruby1.9开始支持named capture了。看看example：


result = %r{(?<lastname>\w+)\s(?<firhestname>\w+)}.match("Richard Huang")
result.lastname
# => "Richard"
result.firstname
# => "Huang"通过named capture，别人读你的正则表达式时，也能够轻松地理解你的意图



