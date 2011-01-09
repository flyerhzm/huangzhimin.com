---
layout: post
title: 在IE下flex的ExternalInterface.addCallback不可注册的函数名
categories:
- flex
---
应该是IE下的保留字，一旦注册了这些函数名，IE会报脚本错误，这些函数名包括：

* play
* stop
* tags
* item
* length

当然，还有其它的名字，所以建议flex注册js函数名时加上前缀flash_，避免冲突

