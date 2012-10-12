---
layout: post
title: newrelic-rake released
categories:
- newrelic
- rake
---
4 months ago, I released [newrelic-workling][0] gem, which helps us
montior the performance of background jobs. We used it to find out a
GC performance issue. But we still have some cron jobs, who call rake
tasks, running in the black box.

So I created a new project [newrelic-rake][1] that adds newrelic
instrument for rake tasks. Now when I go to the newrelic, I can see the
rake tasks listed in Background tasks section, it shows me the average
execution time and call count for all rake tasks.

![newrelic rake tasks](http://farm9.staticflickr.com/8467/8078580542_a85b59f8bd.jpg)

I can also see the performance breakdown for each rake task.

![newrelic rake instrument](http://farm9.staticflickr.com/8475/8078589421_7d3aa63972.jpg)

This rake task probably needs to use persistence net http or some c
extension http client, and reduce the GC calls.

**It's really important to do monitor first, then do optimize.**


[0]: https://github.com/aurorafeint/newrelic-workling
[1]: https://github.com/flyerhzm/newrelic-rake
