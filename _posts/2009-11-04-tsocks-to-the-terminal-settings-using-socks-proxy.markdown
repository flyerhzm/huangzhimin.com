---
layout: post
title: 使用tsocks给terminal设置socks代理
categories:
- Linux
---
家里的rubygem一直不正常，一开始以为是环境配置有问题，昨天重装系统，发现原来是加了gemcutter的sources有问题。

执行gem sources -a http://gemcutter.org，报告下载http://gemcutter.org/specs.4.8.gz timeout了，在公司是没问题的，怀疑是有线通的问题。没办法，只能求助于代理了，网上都是介绍为termial增加http proxy的。要使用socks代理的话，还是要求助于tsocks了。

apt-get install tsocks之后，打开配置文件/etc/socks.conf，修改server和server_port值，分别为socks代理的host和port。

接下来就可以在terminal使用tsocks了，比如sudo tsocks gem sources -a http://gemcutter.org，执行后面的命令就可以通过socks代理来处理网络请求了。

