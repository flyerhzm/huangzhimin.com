---
layout: post
title: use rspec filter to speed up tests
categories:
- Rspec
---
Rspec 2 introduce a very efficient way to test only one test or one test
suit, it's filter_run.

You should first add filter_run in rspec/spec_helper.rb

{% highlight ruby %}
config.filter_run :focus => true
{% endhighlight %}

Then you can tell rspec to test only one test you are focused by

{% highlight ruby %}
it "should focus now", :focus => true do
  ...
end
{% endhighlight %}

rspec will only test this spec, :focus => true can be applied on
describe/context as well.

One problem is that if there is no :focus => true on your tests, rspec
will do nothing, but most of time we are expecting to test all specs if
no focus is true, so you should add a line to spec_helper as well.

{% highlight ruby %}
config.run_all_when_everything_filtered = true
{% endhighlight %}

As the name implies, rspec will test all specs if no focus filter.

Another you may interest that you can also define filter_run_excluding

{% highlight ruby %}
config.filter_run_excluding :slow => true
{% endhighlight %}

rspec will run all specs except what specs are marked as slow.
