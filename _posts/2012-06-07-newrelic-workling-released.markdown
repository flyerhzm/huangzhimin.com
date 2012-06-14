---
layout: post
title: newrelic-workling released
categories:
- newrelic
- workling
---
We are using [workling][1] with [RabbitMQ][2] as our background
service and monitoring RabbitMQ on [scout][3]. Last month, we released
a new background job which generates tons of messages in RabbitMQ, then
messages in RabbitMQ queue kept growing, that means our workling
processes are not many enough to handle that messages. We fixed it by
reverting that job, using cron job to handle instead.

We thought about this accident, and we decided to add [newrelic][4]
support to measure workling instrument, so that we can have an idea
about how many messages generates for each job and how much does it cost
to consume one message.

We finally released the [newrelic-workling][5] 1.0 gem today, thank
newrelic's help, we are the official support for newrelic workling, feel
free to ping us if you have any question. The following is the
screenshot for the workling instrument on newrelic.

![workling instrument](http://flic.kr/p/bWZWc4)

[1]:"https://github.com/purzelrakete/workling"
[2]:"http://www.rabbitmq.com/"
[3]:"https://scoutapp.com/"
[4]:"http://newrelic.com/"
[5]:"https://github.com/aurorafeint/newrelic-workling"
