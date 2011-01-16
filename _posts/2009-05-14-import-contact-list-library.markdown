---
layout: post
title: 导入联系人列表的类库
categories:
- contact-list
---
上个月在google code上发布了一个导入联系人列表的类库，[http://code.google.com/p/contact-list][1]，获取用户的msn和邮箱联系人列表，支持的邮箱包括hotmail, gmail, yahoo, sohu, sina, 163, 126, tom和yeah。算是之前一段时间的小成果吧。

不过由于这个类库的原理是使用抓取网页来分析联系人列表的，所以会因为邮箱网页的改版而无法正确获取联系人列表。 在写代码的时候就碰到过Hotmail改版的情况，所以这个类库是需要不断改版的。还好在发布之前特意写好了测试脚本，很容易找到哪个邮箱出问题了。

今天收到一个用户的email，说他的新浪和搜狐好像无法导入，我回来test了一下，发现新浪和搜狐没问题，倒是yahoo出问题了。于是给他回信，让他把log4j的level设置成debug，然后把调试信息发给我。现在有了用户的反馈，有点小压力，要好好维护好这个类库。

  [1]: http://code.google.com/p/contact-list
