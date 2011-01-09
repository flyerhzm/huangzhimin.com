---
layout: post
title: 使用RubyParser检查Ruby代码的variable scope
categories:
- Ruby
---
今天参加rubyconfchina，再次聆听ihower的演讲，再次收益匪浅。

中间在听到Variable Scope突然想到可以使用RubyParser来检查，于是写了几行代码测试，果然是可行的。

ihower提到在ruby代码中只有在module，class和def才会创建Varible Scope，比如：

{% highlight ruby %}
module MyDemo
  var = 1
  class Demo
    var = 2
    def foo
      var = 3
    end
  end
end
{% endhighlight %}

其中三个var都在不同的scope。这个在RubyParser的解析结果里面有体现出来。比如，ihower提到def会创建一个scope而define_method不会。我们可以用下面的代码来做个实验

{% highlight ruby %}
text=-EOF
class Class
  def define_more_methods
    ["aaa", "bbb", "ccc"].each do |name|
      define_method(name) do
        puts name.upcase
      end
    end
  end
end
EOF
RubyParser.new.parse(text)
{% endhighlight %}

它的解析结果为

{% highlight ruby %}
s(:class, :Class, nil,
  s(:scope,
    s(:defn, :define_more_methods, s(:args),
      s(:scope,
        s(:block,
          s(:iter,
            s(:call,
              s(:array, s(:str, "aaa"), s(:str, "bbb"), s(:str, "ccc")),
              :each,
              s(:arglist)
            ),
            s(:lasgn, :name),
            s(:iter,
              s(:call, nil, :define_method, s(:arglist, s(:lvar, :name))),
              nil,
              s(:call, nil, :puts, s(:arglist, s(:lvar, :name)))
            )
          )
        )
      )
    )
  )
)
{% endhighlight %}

可以看到class有创建一个scope，defn也有创建一个scope，而define_method却没有。同样地，你也可以通过实验看到class_eval和instance_eval都没有创建scope。完全和ihower讲的一样。

以后要是什么时候碰到Variable Scope的问题，就可以使用RubyParser来检查啦，实践见真知。

