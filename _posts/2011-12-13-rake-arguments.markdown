---
layout: post
title: rake arguments
categories:
- rake
---
Long ago I began to write some rake tasks, it's simple but doesn't have
an instruction about how to add arguments to a rake task. What I did
before is to use ruby environment variables.

{% highlight ruby %}
task :try_argument do
  ENV['GLOBAL_ARGUMENT1'] or ENV['GLOBAL_ARGUMENT2']
end

GLOBAL_ARGUMENT1=xxx GLOBAL_ARGUMENT2=yyy rake try_argument
{% endhighlight %}

As you seen, I have to set the global environment variable to pass the
arguement to a rake task.

But there is another way to pass the arguments to rake task via []

{% highlight ruby %}
task :try_argument, [:key1, :key2] do |t, args|
  args.with_defaults(:key1 => value1, :key2 => value2)
  args[:key1] or args[:key2]
end

rake try_argument[xxx, yyy]
{% endhighlight %}

It looks like the difference between hash arguments and normal arguments.

Both of them have disadvantage:

ENV arguments also changes the system env variables
normal arguments do not make sense when calling, difficult to remember
the meanings of arguments.

Both work fine, it depends on you to use which one.
