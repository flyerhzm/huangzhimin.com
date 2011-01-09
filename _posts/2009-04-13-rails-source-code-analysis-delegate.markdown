---
layout: post
title: Rails源码分析——delegate
categories:
- Rails
---
Delegate是一种应用composite来代替extend的机制，可以有效地降低代码的耦合性。

Rails 2.2增加了delegate方法，可以十分方便地实现delegate机制。来看看源码吧：

{% highlight ruby %}
def delegate(*methods)
  options = methods.pop
  unless options.is_a?(Hash) && to = options[:to]
    raise ArgumentError, "Delegation needs a target. Supply an options hash with a :to key as the last argument (e.g. delegate :hello, :to => :greeter)."
  end

  if options[:prefix] == true && options[:to].to_s =~ /^[^a-z_]/
    raise ArgumentError, "Can only automatically set the delegation prefix when delegating to a method."
  end

  prefix = options[:prefix] && "#{options[:prefix] == true ? to : options[:prefix]}_"

  methods.each do |method|
    module_eval(<<-EOS, "(__DELEGATION__)", 1)
      def #{prefix}#{method}(*args, &block)
        #{to}.__send__(#{method.inspect}, *args, &block)
      end
    EOS
  end
end
{% endhighlight %}

delegate方法首先检查传入的参数，正确参数形式为:method1, :method2, ..., :methodN, :to => klass[, :prefix => prefix]

delegate要求参数的最后必须是一个Hash，:to表示需要代理的类，:prefix表示代理的方法是否要加前缀，如果:prefix => true，则代理的方法名为klass_method1, klass_method2, ..., klass_methodN，如果:prefix => prefix (prefix为string)，则代理的方法名为prefix_method1, prefix_method2, ..., prefix_methodN。

最终通过module_eval动态生成每个方法定义。通过__send__方法调用:to类的方法。

来看看调用的例子：

简单的调用：

{% highlight ruby %}
class Greeter  ActiveRecord::Base
  def hello()   "hello"   end
  def goodbye() "goodbye" end
end

class Foo  ActiveRecord::Base
  delegate :hello, :goodbye, :to => :greeter
end

Foo.new.hello   # => "hello"
Foo.new.goodbye # => "goodbye"
{% endhighlight %}

增加:prefix = true：

{% highlight ruby %}
class Foo  ActiveRecord::Base
  delegate :hello, :goodbye, :to => :greeter, :prefix => true
end

Foo.new.greeter_hello   # => "hello"
Foo.new.greeter_goodbye # => "goodbye"
{% endhighlight %}

自定义前缀名：

{% highlight ruby %}
class Foo  ActiveRecord::Base
  delegate :hello, :goodbye, :to => :greeter, :prefix => :foo
end

Foo.new.foo_hello   # => "hello"
Foo.new.foo_goodbye # => "goodbye"
{% endhighlight %}

ruby的动态性再一次发挥了强大的功能！

