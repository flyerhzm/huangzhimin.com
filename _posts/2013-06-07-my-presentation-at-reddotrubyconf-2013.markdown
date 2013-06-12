---
layout: post
title: My presentation at reddotrubyconf 2013
categories:
- presentation
- ruby
---
This is my presentation on reddotrubyconf 2013 with notes, building
asynchronous apis.

{% speakerdeck cd157a80b1700130a9093242a473c411 %}

3\. Several years ago when I started learning rails, many people said rails was not fast, but it can significantly speed up development, the famous words are "Hardware is cheap, Programmers are expensive".

4\. It is true when your business is still young, at first, you may have only one server, then you can buy more servers, distribute web, app and db to different servers, it's the easiest way to handle more traffic.

5\. but...

6\. one day your business gets successful, more and more users will bring more and more traffics, you have to buy more and more web servers, app servers and db servers.

7\. At this stage, machines are not cheap any more, so programmers try to find ways to improve server performance, increase concurrency and reduce machines.

8\. So you see linkedin moved from rails to node, 27 servers cut and up to 20x faster.

9\. Iron.io mvoed from rails to go, 28 servers cut.

10\. Does it mean ruby or rails is so slow? Does it mean we should drop ruby and use node.js or go instead?

11\. From my experience, the answer is no, this is what I want to share with you today.

12\. During my last job, I'm lucky that I have the opportunity to build the same leaderboard apis service running with multi processes, multi threads and asynchronous non blocking io ruby servers. At first we build the api service with rails and ree, db is mysql, the average response time is 50 ms, and it handled 60k rpm on production with 13 machines, 6 passenger instances per machine. After that we migrated to JRuby 1.7.0, it introduced 40% performance improved, average response time decreased to 30 ms, it was same to handle 60k rpm on production, but with only 10 machines, 1 torquebox instance with 5 threads per machine. Finally, we rewrote the api service, using ruby 1.9.3, and used goliath, which is a non-blocking ruby web server, switched db to redis, the average response time decrease to 4 ms, and handled 240k rpm on production with only 4 machines, 4 goliath instances each machine. If old rails api service also handled 240k rpm, it needs 52 machines.

13\. So I can say moving from ruby to ruby, 48 servers cut and 10 times faster.

14\. We run the api service with rails synchronously, all IO operations are blocked, but run with goliath is asynchronous, and IO operations are nonblocking. It's a bit unfair to compare the performance directly between Rails and Goliath, or Rails and Node.js, but it's good to know that building api service with asynchronous nonblocking io can significantly increase the concurrency.

15\. How blocking IO works? e.g. when a request is coming, a process gets the cpu time, run the code, but when it calls database query, cpu has to wait for it to complete, we all know IO operations are slow, the blocking IO will block the whole process.

16\. In multi processes model, when cpu is blocked in process A, it will schedule from process A to process B, keep running, when IO operation is completed in process A, cpu will schedule back to process A and continue working.

17\. The advantages of multi processes are the multi processes can be executed in true parallel on multi cores cpu. Running with multi processes model is easy to manage, we can start or stop a processor by sending a signal. The disadvantages of multiple processes are process switching is expensive, it involves switching out all of the process resources. It also consumes many memory, multiple processes means multiple memory copy.

18\. Multi threads model is similar to multi processes model, when cpu is blocked in thread A, it will schedule from thread A to thread B in one process.

19\. The advantages of multi threads are threads switching is cheap, it involves switching out only the resources unique between threads. As many resources are shared between threads in one process, multi threads consume much less memory. The disadvantages are if you share mutable data across threads, you need to synchronize access to that data for thread safety, this will affect performance and concurrency. With ruby 1.9 or 2.0, GIL is still there, that means only one thread can handle request at a time. The exception is JRuby and Rubinius which already removed GIL and can make use of multi cores.

20\. Evented model is running with a main loop, and never blocked, all io operations are asynchronous, when calling an io operation, instead of waiting, the main loop can process other requests, and come back when the response from io call is ready.

21\. The advantages of the evented model are there is no blocking io, no context switching and it consumes least memory usage comparing to multi processes and multi threads models. The disadvantage is your code will be full of callbacks, make it difficult to understand.

22\. In ruby world, we usually use eventmachine to implement non blocking io, but it's very common to write many nested callbacks, like this.

23\. Good luck, ruby 1.9 introduces fiber, and a gem, named em-synchrony, fiber aware eventmachine can help solve too many callbacks issue.

24\. The code works same as the last example, using em-synchrony, but no callbacks and more readable.

25\. Let’s clarify the definitions of concurrency and parallelism, concurrency performs 2 operations in tandem, while parallelism performs 2 operations at the same time.

26\. Evented model is used to increase concurrency in one processor, so in practice, we will use multi processes with evented in order to utilize all of the cores on your CPU.

27\. We already talked why we should use async non-blocking IO, but how? I wrote a project on github named apis-bench, it implements a simple leaderboard apis service with multiple framework and run on multi processes, multi threads and asynchronous non blocking ruby server.

28\. Assume we use rails to build the apis service, router dispatches the request to controller, controller creates, reads, updates or destroys models, then controller generate a json view and sends the response.

29\. A good practice is skinny controller and fat model, so I write most logic in models.

30\. Write the controller as simple as possible, and use respond_to / respond_with to render a json response.

31\. Here is the router.

32\. Instead of migrating asynchronous io directly, let's do a small step, migrating rails to grape framework. Grape is a micro framework to build REST apis, using grape instead of rails controller can decrease response time.

33\. Grape is responsible for router, controller and view, gets request, ask model to do something and then render response.

34\. Most developers prefer using activerecord, it provides many powerful ways to develop models rapidly. We can use activerecord without rails, so here, we don't need to do any change in model layer.

35\. Grape provides its own DSL, we have to use Grape::API replace rails controller api, but we already followed the skinny controller practice, it should not be too much work to do.

36\. Next step, let's migrate to asynchronous non-blocking io, goliath is a non-blocking ruby web server framework, adding goliath can significantly increase the throughput.

37\. Here, each HTTP request is handled by goliath, request is executed within a ruby fiber, then goliath proxies request to grape, all IO operations are asynchronous.

38\. In this migration, we also no need to change any code except adding goliath api, and telling it delegate request to grape api, very simple.

39\. Besides we must replace our existing blocking io libraries to eventmachine's libraries, like mysql2 to em_mysql2, mongo to em_mongo, etc.

40\. We have another option besides grape, it's sinatra, it can also decrease the response time.

41\. Similar to grape, sinatra takes care of router, controller and view.

42\. The only place we should change from rails to sinatra is the controller, here we define the route, action and render json

43\. After using sinatra, it's also easy to migrate to asynchronous non blocking io by adding sinatra-synchrony, as its name implies, sinatra-synchrony adds em-synchrony to sinatra.

44\. sinatra-synchrony is not a web server, so we have to use an event ruby server, like thin, then sinatra-synchrony executes each http request within a ruby fiber just like goliath.

45\. Adding sinatra-synchrony is also easy, what you need to do is only register Sinatra::Synchrony as an extension, then it works.

46\. Same, you need to replace blocking io library with eventmachine's libraries.

47\. Finally, let's see the benchmark result.

48\. The first benchmark test is a CPU bound action, db time takes about 10% total response time, it's tested with apache benchmark.

49\. I tested with several groups, sending 1000 requests with 10 concurrency, 50 concurrency, 100 concurrency, 200 concurrency, 500 concurrency and last one is sending 2000 requests with 1000 concurrency, in each group, I tried rails, sinatra, grape, sinatra with threads, grape with threads, sinatra-synchrony with thin and grape with goliath, they all run in a single process, rails, sinatra and grape are running in unicorn, sinatra with threads and grape with thread are running in rainbows. The value here is the time taken for completing all requests.  As you have seen, sinatra api is 40% faster than rails api and grape api is 30% faster than rails api, sinatra threads and grape threads in this case, about 2 times slower, it should perform better when running threads with jruby. Asynchrous non blocking io performs best, especially sinatra-synchrony. When sending requests with 200 concurrency, rails, sinatra, grape, sinatra threads and grape threads are all timed out, they are failed to handle so many requests, but grape with goliath and sinatra-synchrony with thin can handle 1000 concurrency without any errors.
With CPU bound actions, threads didn't perform well, but asynchronous non blocking io works can handle much more requests.

50\. What about the IO bound action? the following test is an action, in which db time takes more than 90% total response time, I sent the requests with stable rates and measured the performance on newrelic.

51\. I sent 1200 rpm to rails api, but it can only handle 984 rpm, others returns 502 timed out error.

52\. Sinatra api can only handle 1080 rpm.

53\. and grape api handle 1130 rpm, all of them failed to handle 1200 rpm.

54\. I set rainbows work with 200 threads and 200 connections in db pool, sinatra threads successfully handle 3000 rpm.

55\. Grape threads also succeed.

56\. grape with goliath passed as well.

57\. I failed to add newrelic with sinatra-synchrony, but it also succeed to handle 3000 rpm. Another known issue is I failed to add fiber_pool to goliath, I appreciate it if you can help to solve the issue and open a pull request to me.

58\. Okay, the conclustion is Rails is good, it's still a good choice to build apis service rapidly, we can migrate rails to sinatra or grape to decrease response time, then migrate to sinatra-synchrony or goliath to increase the throughput, finally I have to say asynchronous non-blocking io is awesome, you should give it a try.
