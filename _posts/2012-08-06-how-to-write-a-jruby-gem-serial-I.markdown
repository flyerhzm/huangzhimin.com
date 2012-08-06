---
layout: post
title: how to write a jruby gem - serial I
categories:
- jruby
- rubygems
---
In my [previous post][0], I mentioned I have written a jruby memcached
gem.  I'm glad to share my experience how to extend jruby here.

JRuby is a 100% java implementation of ruby programming language, it
allows you calling java code from ruby code. Java world has much more
libraries than ruby gems, to make use of those java jar, it makes your
code easier and faster.

I assume you already had the experience to create a pure ruby gem, the
first step to create a jruby gem is just the same as ruby gem, the gem
structure is as follows:

{% highlight bash %}
|- lib/                   // ruby implementation code
|   |- memcached/
|   |- memcached.rb
|- test/                  // ruby test code (rspec or minitest)
|   |- memcached/
|   |- memcached_test.rb
|   |- test_helper.rb
|- Gemfile
|- jruby_memcached.gemspec // your gem manifest
|- Rakefile
|- README.md
{% endhighlight %}

Then let's introduce the java jar into our jruby gem.

It's well-known to use maven2 to manage your java source code and
dependencies, maven uses pom.xml as a config file to define compile,
test and package processes, it also defines the dependencies, looks
like the combination of rake and bundler. All the java implementation
and test code are put in src directory, while compiled classes and jar
files are put in target directory. Now the structure looks like:

{% highlight bash %}
|- lib/
|   |- memcached/
|   |- memcached.rb
|- test/
|   |- memcached/
|   |- memcached_test.rb
|   |- test_helper.rb
|- src/                    // java source code
|   |- main/               // java implementation code
|   |   |- java/
|   |- test                // java test code
|       |- java/
|- target/
|   |- classes/            // compiled classes files
|   |- spymemcached-ext-0.0.1.jar // package java source code to a jar
|- Gemfile
|- jruby_memcached.gemspec
|- pom.xml                 // maven config file, compile, test, package
|- Rakefile
|- README.md
{% endhighlight %}

In pom.xml, I said it depends on spymemcached 2.8.1 jar, so I can import
spymemcached in my hack code under src/main/java. I also defined package
shade plugin which package spymemcached 2.8.1 jar and my hack code
together into target/spymemcached-ext-0.0.1.jar.

The last step is to combine the ruby and java code. JRuby provides the
power to easily use spymemcached-ext-0.0.1.jar in ruby code.

{% highlight ruby %}
require 'target/spymemcached-ext-0.0.1.jar'

java_import 'net.spy.memcached.MemcachedClient'
java_import 'net.spy.memcached.ConnectionFactoryBuilder'
java_import 'net.spy.memcached.AddrUtil'

builder = ConnectionFactoryBuilder.new
@client = MemcachedClient.new builder.build, AddrUtil.getAddresses(Array(addresses).join(' '))
{% endhighlight %}

As you seen, after require the java jar file, you can import the java
classes and call the java methods with ruby syntax, jruby is smart enough
to convert ruby code into java code. Check out more about how to calling
java from jruby [here][1].

You can check out jruby-memcached 0.2.0 source code [here][2] to get
more details. This is the simplest solution to create jruby gem, in
next post I will introduce you how to write a real jruby ext, which can
improve the performance of your jruby gem.

[0]: http://huangzhimin.com/2012/07/24/jruby-memcached-0-1-0-released/
[1]: https://github.com/jruby/jruby/wiki/CallingJavaFromJRuby
[2]: https://github.com/aurorafeint/jruby-memcached/tree/2adc85e8121229527a57a71f221fdade40de61df
