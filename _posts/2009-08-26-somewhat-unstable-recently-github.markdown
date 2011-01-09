---
layout: post
title: github最近有点不稳定
categories:
- Life
---
今天早上在github上面发布bullet插件的第一个gem包，结果等了半天没结果，一会返回Queued for rebuild，一会什么都不返回。在support上面发帖提问，被告知可能是gem build进程运行在low priority，他们会把它升到medium priority。

等到下午快3点才收到通知说gem已经build成功，不过到现在还没有被加到github的gem list上，说是晚上会强制做一次reindex，希望那时候会成功gem install。

