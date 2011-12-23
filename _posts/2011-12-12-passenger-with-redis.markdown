---
layout: post
title: passenger with redis
categories:
- passenger
- redis
---
Today I encountered an issue that passenger forks too many workers
than what we set (6) on qa servers. I used strace, the passenger worker
is blocked by failed to writing to a socket, like

{% highlight bash %}
select(15, [], [13], [], [58, 915000])
{% endhighlight %}

fd 13 is a socket.

I also tried netstat and found the status for some redis socket
connections are CLOSE_WAIT.

So I judged this is the problem the ruby redis clients are not closed
correctly. This reminds me that passenger fork() nature, I checked our
source codes, unfortunately, we didn't do anything special for passenger
fork.

This is the [link][1] tells you how to close the redis connection after
passenger forks a worker. After deploy the new codes to qa servers,
passenger never forks more workers than we expected. But the workers
still hang up according strace result, that means some workers keep
inactive status, they won't be able to handle any requests. Wooops...

I looked through the redis-rb source codes, we used redis 2.0.5, it
didn't handle TIMEOUT error and always retry writing to redis.
Fortunately, the latest redis version is 2.2.2 and it already fixed this
issue, retry 3 times, if still failed, the release the connection.

Now it works fine, no unexpected additional passenger workers and no
unexpected inactive workers.

[1]: https://github.com/ezmobius/redis-rb/wiki/redis-rb-on-Phusion-Passenger
