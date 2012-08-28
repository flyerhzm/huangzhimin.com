---
layout: post
title: how to write a jruby gem - part 2
categories:
- jruby
- rubygems
---
In my [previous post][0], I introduced how to write a jruby gem with
ruby code, today I will show you how to write a jruby extension with
java code, which can give you better performance.

### Standard Steps

1\. create java classes to wrap any java library you need, and the java
classes must extend RubyObject, then it can be called from jruby. e.g.

{% highlight java %}
class Memcached extends RubyObject {
    // MemcachedClient is what we want to wrap
    private MemcachedClient client;

    // java constructor
    public Memcached(final Ruby ruby, RubyClass rubyClass) {
        super(ruby, rubyClass);
    }

    // ruby initialize
    public IRubyObject initialize(ThreadContext context) {
        client = MemcachedClient.new();
    }

    // wrapper method, the first argument for jruby methods must be ThreadContext
    public IRubyObject get(ThreadContext context, IRubyObject key) {
        return (IRubyObject) client.get(key);
    }
}
{% endhighlight %}

Keep in mind, every objects you read from ruby or return to ruby must be
a RubyObject. So you have to convert between RubyObject and java Object in
your wrapper methods.

2\. add JRubyModule, JRubyClass, JRubyMethod and JRubyConstant annotations.

{% highlight java %}
@JRubyClass
class Memcached extends RubyObject {
    @JRubyMethod
    public IRubyObject initialize(ThreadContext context) {
        client = MemcachedClient.new();
    }

    @JRubyMethod
    public IRubyObject get(ThreadContext context, IRubyObject key) {
        return (IRubyObject) client.get(key);
    }
}
{% endhighlight %}

JRuby annotations tells jvm which classes and methods should be open to
ruby world. It can tell the details of classes and methods, like
what's the parent class, how many arguments of a methods, and so on.

3\. load all jruby modules, classes and methods with BasicLibraryService.

{% highlight java %}
public class MemcachedService implements BasicLibraryService {
    public boolean basicLoad(final Ruby ruby) throws IOException {
        // define Memcached class
        RubyClass memcached = ruby.defineClass("Memcached", ruby.getObject(), new ObjectAllocator() {
            public IRubyObject allocate(Ruby ruby, RubyClass klazz) {
                return new Memcached(ruby, klazz);
            }
        });
        // define all methods with @JRubyMethods in Memcached class
        memcached.defineAnnotatedMethods(Memcached.class);
        return true;
    }
}
{% endhighlight %}

BasicLibraryService is the standard load mechanism for easy extensions,
you should implement basicLoad method to define ruby modules, classes
and methods.

4\. finally, load MemcachedService in your ruby file

{% highlight ruby %}
# MemcachedService is in com.openfeint.memcached package
require 'com/openfeint/memcached/memcached'
{% endhighlight %}

Then you can load your jruby gem, and use any Memcached classes and
methods you defined.

### Some Advanced Tips:

1\. JRuby method names.

**different name**

in ruby

{% highlight ruby %}
def active?
end
{% endhighlight %}

in java

{% highlight java %}
@JRubyMethod(name = "active?")
public IRubyObject active_p(ThreadContext context) {
}
{% endhighlight %}

**alias methods**

in ruby

{% highlight ruby %}
def get(key)
end

alias :"[]" :get
{% endhighlight %}

in java

{% highlight java %}
@JRubyMethod(name = { "get", "[]" })
public IRubyObject get(ThreadContext context, IRubyObject key) {
}
{% endhighlight %}

2\. JRuby method arguments.

**rest arguments**

in ruby

{% highlight ruby %}
def initialize(*args)
end
{% endhighlight %}

in java

{% highlight java %}
@JRubyMethod(name = "initialize", rest = true)
public IRubyObject initialize(ThreadContext context, IRubyObject[] args) {
}
{% endhighlight %}

**arguments with default value**

in ruby

{% highlight ruby %}
def get(key, marshal=true)
end
{% endhighlight %}

in java

{% highlight java %}
@JRubyMethod(name = "get", required = 1, optional = 1)
public IRubyObject get(ThreadContext context, IRubyObject[] args) {
    Ruby ruby = context.getRuntime();
    RubyString key = (RubyString) args[0];
    RubyBoolean marshal = ruby.getTrue();
    if (args.length > 1) {
        marshal = args[1];
    }
}
{% endhighlight %}

3\. custom exceptions

Exception is also a class, so, you could define an Exception in jruby
just like defining a class.

{% highlight java %}
@JRubyClass(name = "Memcached::Error", parent = "RuntimeError")
public class Error {
    // you should wrap your custom exception with RaiseException for java land throwing purpose.
    public static RaiseException newNotFound(Ruby ruby, String message) {
        RubyClass errorClass = ruby.getModule("Memcached").getClass("NotFound");
        return new RaiseException(RubyException.newException(ruby, errorClass, message), true);
    }
}

// Yes, it is a subclass.
@JRubyClass(name="Memcached::NotFound", parent="Memcached::Error")
public class NotFound extends Error {
}

// Finally, load the Error in MemcachedService.
public class MemcachedService implements BasicLibraryService {
    public boolean basicLoad(final Ruby ruby) throws IOException {
        RubyClass runtimeError = ruby.getRuntimeError();
        RubyClass memcachedError = memcached.defineClassUnder("Error", runtimeError, runtimeError.getAllocator());
        memcached.defineClassUnder("NotFound", memcachedError, memcachedError.getAllocator());
        return true;
    }
}
{% endhighlight %}

so when your call Error.newNotFound(ruby, "Not Found") in your java
code, it can be catched with Memcached::NotFound in ruby.

4\. object convertion

**RubyObject to java Object**

you can use RubyObject convertToXXX methods

{% highlight java %}
convertToArray
convertToFloat
convertToHash
convertToInteger
convertToString
{% endhighlight %}

e.g.

{% highlight java %}
List<String> keys = (List<String>) args.convertToArray();
{% endhighlight %}

**java Object to RubyObject**

you can use Ruby newXXX methods

{% highlight java %}
newArray
newBoolean
newFixnum
newFloat
newString
{% endhighlight %}

e.g.

{% highlight java %}
ruby.newString("hello world");
{% endhighlight %}

You can read the source code of [jruby-memcached][1] to get more
information. Feel free to leave a comment if you have any question or
suggestion.

[0]: http://huangzhimin.com/2012/08/06/how-to-write-a-jruby-gem-part-1/
[1]: https://github.com/aurorafeint/jruby-memcached
