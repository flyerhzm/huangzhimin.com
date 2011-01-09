---
layout: post
title: 为resque写扩展
categories:
- Rails
- Resque
- Ruby
---
resque是基于redis的ruby类库，用于创建后台任务，把这些后台任务放在多个队列中去，之后在处理它们。github就是使用resque来处理它们的后台任务的。

对于需要长时间处理的任务，比如发送email，发tweet，图片resize等等，都是resque的用武之地。默认resque就是将任务加到redis的队列中去，然后定时取出来去处理，实际项目中我们往往需要对其增加额外的扩展，比如你需要增加日志功能，增加处理次数的限制，这个时候就可以给resque写一个plugin，就像rails的plugin一样。

resque定义了非常良好的HOOK，使得为其写扩展变得更加容易。

resque采取的是每隔n秒从队列中获取一个任务，然后fork一个子进程来执行这个任务。resque定义了before_fork, after_fork, before_perform, after_perform, around_perform, on_failure几个hook，执行顺序如下

1. before_fork

2. fork

3. after_fork

4. before_perform

5. around_perform

6. perform

7. around_perfomr

8. after_perform

还有就是发生错误的时候，on_failure会被执行。

再给一个我写的resque-restriction插件的实例

{% highlight ruby %}
def before_perform_restriction(*args)
  settings.each do |period, number|
    key = redis_key(period)
    value = get_restrict(key)

    if value.nil? or value == ""
      set_restrict(key, seconds(period), number)
    elsif value.to_i <= 0
      Resque.push "restriction", :class => to_s, :args => args
      raise Resque::Job::DontPerform
    end
  end
end

def after_perform_restriction(*args)
  settings.each do |period, number|
    key = redis_key(period)
    Resque.redis.decrby(key, 1)
  end
end
{% endhighlight %}

before_perform_restriction检查任务在一个时间段执行的次数，如果执行次数超过规定，抛出Resque::Job::DontPerform异常，它将终止该任务继续执行。

after_perform_restriction则在任务执行之后，将计数器减一。

可以看出，resque作为一个后台任务的框架，其api设计非常良好，很容易对其进行扩展，应该多学习学习。

