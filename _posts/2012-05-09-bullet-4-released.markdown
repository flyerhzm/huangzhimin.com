---
layout: post
title: bullet 4.0.0 released
categories:
- rails
- bullet
---
[bullet][1] is designed to help you reduce the number of db queries, such as
adding eager loading to kill n+1 queries and removing unused eager
loadings.

bullet works well in activerecord from 2.1 to 3.2 before, today I
released bullet 4.0.0, it starts to support mongoid (>= 2.4.1) now.

Why does bullet need to support mongoid?
Does mongo also have n+1 queries issue?

The answer is yes, check out the [performance metric of mongoid eager
loading][2], about 40% performance improved. 1 year ago I already
created a gem [mongoid-eager-loading][3] to add eager loading feature
in mongoid, it is deprecated as mongoid has already supported eager
loading natively.

Be aware that bullet for mongoid doesn't support 2 level deep eager
loading and counter cache because they are not supported in mongoid so
far.

What about mongomapper, I'd like to support it in future, but I have no
experience in it, does anybody have interests to implement it? Feel free
to contact me.

Another big improvement in 4.0.0 is much better integration tests. If
you check out the source code, you will see I separate different
integration tests for activerecord 2, activerecord 3 and mongoid, I also
add these integration tests to different Gemfiles, and ask travis to
test all of them for bullet, see the [build result][4].

If you have any problems to use bullet gem, feel free to mail me, tweet
me or open an issue on github.

[1]: https://github.com/flyerhzm/bullet
[2]: http://mongoid.org/performance.html
[3]: https://github.com/flyerhzm/mongoid-eager-loading
[4]: http://travis-ci.org/#!/flyerhzm/bullet/builds/1283580
