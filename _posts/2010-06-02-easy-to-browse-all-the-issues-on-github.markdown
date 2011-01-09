---
layout: post
title: 方便地浏览github上所有的issues
categories:
- Github
- Sinatra
---
我在github上面有好几个repositories，经常会有人来报告报告issue，但问题是有时候手头正好有其它的事情需要处理，就没有办法马上修复issue，随着时间的推移，越来越多的issues被积压下来，而且是分散在各个repositories，这让我找起来很费力，必须首先进入repository页面，再点击issues，才能看到相应的issues。我想要是有个页面能够列出所有repositories的issues该多好啊，不过github上面好像没有找到这样的页面。没办法，只好自己动手丰衣足食。

github提供了[api][1]，这大大方便了开发，同时有相应的ruby实现[octopi][2]。剩下的工作就很简单了，创建一个sinatra项目，接受用户输入的github用户名，通过用户名获取到该github user，再通过user拿到repositories，通过repository拿到issues，最后通过issue拿到comments，所有的数据都轻而易举地获得了，接下来就是稍微美工一下，然后就发布到heroku上面。半天时间搞定，ruby开发就是个快啊。

heroku上面的地址是：[http://github-issues.heroku.com/][3]

  [1]: http://develop.github.com/
  [2]: http://github.com/fcoury/octopi/
  [3]: http://github-issues.heroku.com/

